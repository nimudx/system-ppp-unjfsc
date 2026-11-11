<?php

namespace App\Domains\JobBoard\Services;

use App\Domains\Identity\Models\User;
use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Models\Vacancy;
use App\Domains\JobBoard\Models\VacancyView;
use Illuminate\Support\Collection;

class VacancyNewBadgeService
{
    public function markSeen(Vacancy $vacancy, User $user): void
    {
        VacancyView::query()->updateOrCreate(
            ['vacancy_id' => $vacancy->id, 'user_id' => $user->id],
            ['seen_at' => now()],
        );
    }

    /**
     * Ids de vacantes que siguen siendo "Nuevas" para el usuario.
     *
     * @param  Collection<int, Vacancy>  $vacancies
     * @return array<int, int>
     */
    public function newIds(Collection $vacancies, User $user, string $context): array
    {
        $ids = $vacancies->pluck('id')->map(fn ($id) => (int) $id);

        if ($ids->isEmpty()) {
            return [];
        }

        $seen = VacancyView::query()
            ->where('user_id', $user->id)
            ->whereIn('vacancy_id', $ids)
            ->pluck('vacancy_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $threshold = now()->subDays((int) config('jobboard.new_days', 14));

        return $vacancies
            ->filter(function (Vacancy $vacancy) use ($seen, $context, $threshold) {
                if (in_array((int) $vacancy->id, $seen, true)) {
                    return false;
                }

                if ($context === 'teacher') {
                    return $vacancy->status === VacancyStatus::PUBLISHED
                        && $vacancy->published_at !== null
                        && $vacancy->published_at->greaterThanOrEqualTo($threshold);
                }

                return $vacancy->status === VacancyStatus::PENDING_REVIEW
                    && $vacancy->updated_at !== null
                    && $vacancy->updated_at->greaterThanOrEqualTo($threshold);
            })
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }
}
