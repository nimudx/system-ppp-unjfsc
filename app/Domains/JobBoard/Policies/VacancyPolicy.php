<?php

namespace App\Domains\JobBoard\Policies;

use App\Domains\Identity\Models\User;
use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Models\Vacancy;
use App\Domains\JobBoard\Support\JobBoardAccess;

class VacancyPolicy
{
    public function __construct(private JobBoardAccess $access) {}

    public function viewAny(User $user): bool
    {
        return $this->access->company($user) !== null
            || $this->access->assignment($user, [1, 2, 3]) !== null;
    }

    public function view(User $user, Vacancy $vacancy): bool
    {
        $company = $this->access->company($user);

        if ($company !== null) {
            return (int) $vacancy->company_id === (int) $company->id;
        }

        $assignment = $this->access->assignment($user, [1, 2, 3]);

        if (! $assignment) {
            return false;
        }

        if ($this->access->isAdmin($assignment)) {
            return true;
        }

        if ($this->access->isSubadmin($assignment)) {
            return $this->access->subadminCoversVacancy($assignment, $vacancy);
        }

        return $this->access->isTeacher($assignment)
            && $vacancy->status === VacancyStatus::PUBLISHED
            && $this->access->teacherCoversVacancy($assignment, $vacancy);
    }

    public function create(User $user): bool
    {
        return $this->access->company($user) !== null;
    }

    public function update(User $user, Vacancy $vacancy): bool
    {
        return $this->owns($user, $vacancy)
            && in_array($vacancy->status, [VacancyStatus::DRAFT, VacancyStatus::OBSERVED], true);
    }

    public function submit(User $user, Vacancy $vacancy): bool
    {
        return $this->owns($user, $vacancy)
            && in_array($vacancy->status, [VacancyStatus::DRAFT, VacancyStatus::OBSERVED], true);
    }

    public function review(User $user, Vacancy $vacancy): bool
    {
        return $this->administers($user, $vacancy);
    }

    public function notifyTeachers(User $user, Vacancy $vacancy): bool
    {
        return $vacancy->status === VacancyStatus::PUBLISHED
            && $this->administers($user, $vacancy);
    }

    public function manageCandidates(User $user, Vacancy $vacancy): bool
    {
        return $this->administers($user, $vacancy);
    }

    public function close(User $user, Vacancy $vacancy): bool
    {
        if ($this->administers($user, $vacancy)) {
            return true;
        }

        return $this->owns($user, $vacancy)
            && $vacancy->status === VacancyStatus::PUBLISHED;
    }

    public function propose(User $user, Vacancy $vacancy): bool
    {
        $assignment = $this->access->assignment($user, [3]);

        return $assignment !== null
            && $vacancy->status === VacancyStatus::PUBLISHED
            && $this->access->teacherCoversVacancy($assignment, $vacancy);
    }

    private function owns(User $user, Vacancy $vacancy): bool
    {
        $company = $this->access->company($user);

        return $company !== null && (int) $vacancy->company_id === (int) $company->id;
    }

    private function administers(User $user, Vacancy $vacancy): bool
    {
        $assignment = $this->access->assignment($user, [1, 2]);

        if (! $assignment) {
            return false;
        }

        return $this->access->isAdmin($assignment)
            || $this->access->subadminCoversVacancy($assignment, $vacancy);
    }
}
