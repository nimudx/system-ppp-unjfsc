<?php

namespace App\Domains\JobBoard\Services;

use App\Domains\Identity\Enums\AssignmentStatus;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use App\Domains\JobBoard\Enums\CandidateStatus;
use App\Domains\JobBoard\Exceptions\CandidateAlreadyProposed;
use App\Domains\JobBoard\Exceptions\CandidateNotEligible;
use App\Domains\JobBoard\Models\Vacancy;
use App\Domains\JobBoard\Models\VacancyCandidate;
use App\Domains\JobBoard\Support\JobBoardAccess;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CandidateProposalService
{
    public function __construct(
        private JobBoardAccess $access,
        private VacancyNotificationService $notifications,
    ) {}

    /**
     * @param  array<int, int|string>  $studentAssignmentIds
     * @return Collection<int, VacancyCandidate>
     */
    public function propose(User $user, Vacancy $vacancy, array $studentAssignmentIds, ?string $note = null): Collection
    {
        $teacher = $this->access->assignment($user, [3]);

        if (! $teacher || ! $teacher->section) {
            abort(403, 'Se requiere un perfil de docente titular con sección activa.');
        }

        $ids = collect($studentAssignmentIds)
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $students = Assignment::query()
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id');

        if ($students->count() !== $ids->count()) {
            throw new CandidateNotEligible('Uno o más estudiantes no existen.');
        }

        foreach ($ids as $id) {
            $this->assertEligible($teacher, $students->get($id));
        }

        $created = DB::transaction(function () use ($vacancy, $teacher, $ids, $note) {
            $vacancy = Vacancy::query()->lockForUpdate()->findOrFail($vacancy->id);

            $already = VacancyCandidate::query()
                ->where('vacancy_id', $vacancy->id)
                ->whereIn('student_assignment_id', $ids)
                ->exists();

            if ($already) {
                throw new CandidateAlreadyProposed;
            }

            $result = collect();

            foreach ($ids as $studentId) {
                try {
                    $result->push(VacancyCandidate::create([
                        'vacancy_id' => $vacancy->id,
                        'student_assignment_id' => $studentId,
                        'proposed_by_assignment_id' => $teacher->id,
                        'note' => $note,
                        'status' => CandidateStatus::PROPOSED,
                    ]));
                } catch (QueryException $exception) {
                    // Concurrencia: el índice único es la última palabra.
                    if ($this->isUniqueViolation($exception)) {
                        throw new CandidateAlreadyProposed;
                    }

                    throw $exception;
                }
            }

            return $result;
        });

        foreach ($created as $candidate) {
            $this->notifications->candidateProposed($candidate, $teacher);
        }

        return $created;
    }

    public function withdraw(VacancyCandidate $candidate): void
    {
        $candidate->delete();
    }

    public function updateStatus(VacancyCandidate $candidate, string $status, ?string $note): VacancyCandidate
    {
        $candidate->fill([
            'status' => $status,
            'status_note' => $note,
        ])->save();

        return $candidate;
    }

    private function assertEligible(Assignment $teacher, ?Assignment $student): void
    {
        if (! $student
            || (int) $student->role_id !== 5
            || $student->status !== AssignmentStatus::ACTIVE
            || (int) $student->section_id !== (int) $teacher->section_id
            || (int) $student->semester_id !== (int) $teacher->semester_id
            || ! $student->isApproved()
        ) {
            throw new CandidateNotEligible;
        }
    }

    private function isUniqueViolation(QueryException $exception): bool
    {
        return Str::contains($exception->getMessage(), [
            'UNIQUE constraint failed',
            'Duplicate entry',
            'violates unique constraint',
        ]);
    }
}
