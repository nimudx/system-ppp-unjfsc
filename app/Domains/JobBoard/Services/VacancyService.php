<?php

namespace App\Domains\JobBoard\Services;

use App\Domains\Academic\Models\Semester;
use App\Domains\Company\Contracts\ActiveCompanyResolver;
use App\Domains\Company\Models\Company;
use App\Domains\Identity\Models\User;
use App\Domains\JobBoard\Enums\VacancyCloseReason;
use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Exceptions\CompanyNotActive;
use App\Domains\JobBoard\Exceptions\VacancyInvalidTransition;
use App\Domains\JobBoard\Exceptions\VacancyNotEditable;
use App\Domains\JobBoard\Models\Vacancy;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class VacancyService
{
    public function __construct(
        private ActiveCompanyResolver $companies,
        private VacancyNotificationService $notifications,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data): Vacancy
    {
        $company = $this->activeCompany($user);

        return DB::transaction(function () use ($company, $data) {
            $vacancy = Vacancy::create([
                'company_id' => $company->id,
                'semester_id' => session('semester_id') ?? Semester::getActiveSemester()?->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'type' => $data['type'],
                'modality' => $data['modality'],
                'area_name' => $data['area_name'] ?? null,
                'location' => $data['location'] ?? null,
                'positions_count' => $data['positions_count'] ?? 1,
                'requirements' => $data['requirements'] ?? null,
                'deadline_at' => $data['deadline_at'] ?? null,
                'status' => VacancyStatus::DRAFT,
            ]);

            $this->syncSchools($vacancy, $data['school_ids'] ?? []);

            return $vacancy->load('schools');
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User $user, Vacancy $vacancy, array $data): Vacancy
    {
        $company = $this->activeCompany($user);

        if ($vacancy->company_id !== $company->id) {
            throw new CompanyNotActive;
        }

        if (! in_array($vacancy->status, [VacancyStatus::DRAFT, VacancyStatus::OBSERVED], true)) {
            throw new VacancyNotEditable;
        }

        return DB::transaction(function () use ($vacancy, $data) {
            $vacancy->fill([
                'title' => $data['title'],
                'description' => $data['description'],
                'type' => $data['type'],
                'modality' => $data['modality'],
                'area_name' => $data['area_name'] ?? null,
                'location' => $data['location'] ?? null,
                'positions_count' => $data['positions_count'] ?? 1,
                'requirements' => $data['requirements'] ?? null,
                'deadline_at' => $data['deadline_at'] ?? null,
            ])->save();

            $this->syncSchools($vacancy, $data['school_ids'] ?? []);

            return $vacancy->refresh()->load('schools');
        });
    }

    public function submit(User $user, Vacancy $vacancy): Vacancy
    {
        $company = $this->activeCompany($user);

        if ($vacancy->company_id !== $company->id) {
            throw new CompanyNotActive;
        }

        $vacancy = DB::transaction(function () use ($vacancy) {
            $vacancy = Vacancy::query()->lockForUpdate()->findOrFail($vacancy->id);

            if (! in_array($vacancy->status, [VacancyStatus::DRAFT, VacancyStatus::OBSERVED], true)) {
                throw new VacancyInvalidTransition;
            }

            $vacancy->fill([
                'status' => VacancyStatus::PENDING_REVIEW,
                'review_comment' => null,
                'reviewed_by_assignment_id' => null,
                'reviewed_at' => null,
            ])->save();

            return $vacancy;
        });

        $this->notifications->vacancySubmitted($vacancy, $user);

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

    /**
     * @param  array<int, int|string>  $schoolIds
     */
    public function syncSchools(Vacancy $vacancy, array $schoolIds): void
    {
        $ids = collect($schoolIds)
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $vacancy->schools()->sync($ids);
    }

    private function activeCompany(User $user): Company
    {
        try {
            return $this->companies->company($user);
        } catch (ModelNotFoundException) {
            throw new CompanyNotActive;
        }
    }
}
