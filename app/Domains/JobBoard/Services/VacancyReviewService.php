<?php

namespace App\Domains\JobBoard\Services;

use App\Domains\Academic\Models\School;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use App\Domains\JobBoard\Enums\VacancyCloseReason;
use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Exceptions\VacancyInvalidTransition;
use App\Domains\JobBoard\Models\Vacancy;
use App\Domains\JobBoard\Support\JobBoardAccess;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VacancyReviewService
{
    public function __construct(
        private JobBoardAccess $access,
        private VacancyNotificationService $notifications,
    ) {}

    /**
     * El administrador aprueba, observa o rechaza una vacante enviada a revisión.
     *
     * Al aprobar confirma las escuelas destino; si el admin es subadministrador,
     * solo puede confirmar escuelas de su facultad.
     *
     * @param  array<int, int|string>|null  $schoolIds
     */
    public function review(User $user, Vacancy $vacancy, string $decision, ?string $comment, bool $notifyTeachers = true, ?array $schoolIds = null): Vacancy
    {
        $assignment = $this->access->assignment($user, [1, 2]);

        if (! $assignment) {
            throw new VacancyInvalidTransition;
        }

        $vacancy = DB::transaction(function () use ($vacancy, $assignment, $decision, $comment, $schoolIds) {
            $vacancy = Vacancy::query()->lockForUpdate()->findOrFail($vacancy->id);

            if ($vacancy->status !== VacancyStatus::PENDING_REVIEW) {
                throw new VacancyInvalidTransition;
            }

            $status = match ($decision) {
                'approve' => VacancyStatus::PUBLISHED,
                'observe' => VacancyStatus::OBSERVED,
                'reject' => VacancyStatus::REJECTED,
                default => throw new VacancyInvalidTransition,
            };

            if ($status === VacancyStatus::PUBLISHED && $schoolIds !== null) {
                $schoolIds = array_values(array_unique(array_map('intval', $schoolIds)));

                if ($schoolIds === []) {
                    throw ValidationException::withMessages([
                        'school_ids' => 'Confirma al menos una escuela destino antes de publicar.',
                    ]);
                }

                $this->assertSchoolsWithinScope($assignment, $schoolIds);

                $vacancy->schools()->sync($schoolIds);
            }

            $vacancy->fill([
                'status' => $status,
                'review_comment' => $comment,
                'reviewed_by_assignment_id' => $assignment->id,
                'reviewed_at' => now(),
                'published_at' => $status === VacancyStatus::PUBLISHED
                    ? ($vacancy->published_at ?? now())
                    : $vacancy->published_at,
                'closed_at' => null,
                'closed_reason' => null,
            ])->save();

            return $vacancy;
        });

        if ($decision === 'approve' && $notifyTeachers) {
            $this->notifications->vacancyPublished($vacancy, $assignment);
        }

        $this->notifications->vacancyReviewed($vacancy, $assignment);

        return $vacancy;
    }

    /**
     * @param  array<int, int>  $schoolIds
     */
    private function assertSchoolsWithinScope(Assignment $assignment, array $schoolIds): void
    {
        if (! $this->access->isSubadmin($assignment)) {
            return;
        }

        $facultyId = $assignment->section?->school?->faculty_id;

        $allowed = School::query()
            ->whereIn('id', $schoolIds)
            ->where('faculty_id', $facultyId)
            ->count();

        if ($allowed !== count($schoolIds)) {
            throw ValidationException::withMessages([
                'school_ids' => 'Solo puedes confirmar escuelas de tu facultad.',
            ]);
        }
    }

    /**
     * El administrador reenvía el aviso a los docentes de las escuelas destino.
     */
    public function notifyTeachers(User $user, Vacancy $vacancy): Vacancy
    {
        if ($vacancy->status !== VacancyStatus::PUBLISHED) {
            throw new VacancyInvalidTransition;
        }

        $assignment = $this->access->assignment($user, [1, 2]);

        if (! $assignment) {
            throw new VacancyInvalidTransition;
        }

        $this->notifications->vacancyPublished($vacancy, $assignment);

        return $vacancy;
    }

    public function close(User $user, Vacancy $vacancy, VacancyCloseReason $reason): Vacancy
    {
        return DB::transaction(function () use ($vacancy, $reason) {
            $vacancy = Vacancy::query()->lockForUpdate()->findOrFail($vacancy->id);

            if ($vacancy->status !== VacancyStatus::PUBLISHED) {
                throw new VacancyInvalidTransition;
            }

            $vacancy->fill([
                'status' => VacancyStatus::CLOSED,
                'closed_at' => now(),
                'closed_reason' => $reason,
            ])->save();

            return $vacancy;
        });
    }
}
