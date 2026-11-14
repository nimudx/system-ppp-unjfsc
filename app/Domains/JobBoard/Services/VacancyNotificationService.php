<?php

namespace App\Domains\JobBoard\Services;

use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use App\Domains\JobBoard\Enums\CandidateStatus;
use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Models\Vacancy;
use App\Domains\JobBoard\Models\VacancyCandidate;
use App\Domains\Notifications\Services\NotificationService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Centraliza destinatarios y payloads de las notificaciones del módulo.
 */
class VacancyNotificationService
{
    public function __construct(private NotificationService $notifications) {}

    public function vacancySubmitted(Vacancy $vacancy, User $actor): void
    {
        $this->notifications->notify(
            'VACANCY_SUBMITTED',
            $actor,
            $vacancy,
            [
                'action' => ['route' => 'academic.jobboard.admin.index', 'params' => ['v' => $vacancy->id]],
                'meta' => $this->meta($vacancy, 'Nueva vacante por revisar'),
            ],
            fn () => $this->adminRecipients($vacancy)
        );
    }

    public function vacancyReviewed(Vacancy $vacancy, Model $actor): void
    {
        $companyUser = User::query()->find($vacancy->company?->account_user_id);

        if (! $companyUser) {
            return;
        }

        $title = match ($vacancy->status) {
            VacancyStatus::PUBLISHED => 'Tu vacante fue publicada',
            VacancyStatus::OBSERVED => 'Tu vacante fue observada',
            VacancyStatus::REJECTED => 'Tu vacante fue rechazada',
            default => 'Tu vacante fue revisada',
        };

        $this->notifications->notify(
            'VACANCY_REVIEWED',
            $actor,
            $vacancy,
            [
                'action' => ['route' => 'company.jobboard.index', 'params' => ['v' => $vacancy->id]],
                'meta' => $this->meta($vacancy, $title),
            ],
            fn () => collect([$companyUser])
        );
    }

    public function vacancyPublished(Vacancy $vacancy, Model $actor): void
    {
        $recipients = $this->teacherRecipients($vacancy);

        if ($recipients->isEmpty()) {
            return;
        }

        $this->notifications->notify(
            'VACANCY_PUBLISHED',
            $actor,
            $vacancy,
            [
                'action' => ['route' => 'academic.jobboard.teacher.index', 'params' => ['v' => $vacancy->id]],
                'meta' => $this->meta($vacancy, 'Nueva vacante para tu escuela'),
            ],
            fn () => $recipients
        );
    }

    public function candidateProposed(VacancyCandidate $candidate, Assignment $actor): void
    {
        $vacancy = $candidate->vacancy;

        $this->notifications->notify(
            'CANDIDATE_PROPOSED',
            $actor,
            $candidate,
            [
                'action' => ['route' => 'academic.jobboard.admin.index', 'params' => ['v' => $vacancy->id]],
                'meta' => [
                    'title' => 'Nuevo candidato propuesto',
                    'role' => $actor->role?->name,
                    'document' => $vacancy->title,
                    'entity' => 'vacancy_candidate',
                    'status' => CandidateStatus::PROPOSED->value,
                    'comment' => $candidate->note,
                ],
            ],
            fn () => $this->adminRecipients($vacancy)
        );
    }

    /**
     * @return Collection<int, User>
     */
    public function adminRecipients(Vacancy $vacancy): Collection
    {
        $facultyIds = $vacancy->schools()->pluck('faculty_id')->map(fn ($id) => (int) $id)->unique();

        return Assignment::query()
            ->whereIn('role_id', [1, 2])
            ->where('status', 1)
            ->with(['user', 'section.school'])
            ->get()
            ->filter(function (Assignment $assignment) use ($facultyIds) {
                if ((int) $assignment->role_id === 1) {
                    return true;
                }

                $facultyId = $assignment->section?->school?->faculty_id;

                return $facultyId !== null && $facultyIds->contains((int) $facultyId);
            })
            ->pluck('user')
            ->filter()
            ->unique('id')
            ->values();
    }

    /**
     * @return Collection<int, User>
     */
    public function teacherRecipients(Vacancy $vacancy): Collection
    {
        $schoolIds = $vacancy->schools()->pluck('schools.id')->map(fn ($id) => (int) $id);

        return Assignment::query()
            ->where('role_id', 3)
            ->where('status', 1)
            ->where('access_status', 1)
            ->when($vacancy->semester_id, fn ($query) => $query->where('semester_id', $vacancy->semester_id))
            ->whereHas('section', fn ($query) => $query->whereIn('school_id', $schoolIds))
            ->with('user')
            ->get()
            ->pluck('user')
            ->filter()
            ->unique('id')
            ->values();
    }

    /**
     * @return array<string, mixed>
     */
    private function meta(Vacancy $vacancy, string $title): array
    {
        return [
            'title' => $title,
            'document' => $vacancy->title,
            'entity' => 'vacancy',
            'status' => $vacancy->status->value,
            'comment' => $vacancy->review_comment,
        ];
    }
}
