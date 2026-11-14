<?php

namespace App\Domains\JobBoard\Policies;

use App\Domains\Identity\Models\User;
use App\Domains\JobBoard\Enums\CandidateStatus;
use App\Domains\JobBoard\Models\VacancyCandidate;
use App\Domains\JobBoard\Support\JobBoardAccess;

class VacancyCandidatePolicy
{
    public function __construct(private JobBoardAccess $access) {}

    public function updateStatus(User $user, VacancyCandidate $candidate): bool
    {
        $assignment = $this->access->assignment($user, [1, 2]);

        if (! $assignment) {
            return false;
        }

        return $this->access->isAdmin($assignment)
            || $this->access->subadminCoversVacancy($assignment, $candidate->vacancy);
    }

    public function withdraw(User $user, VacancyCandidate $candidate): bool
    {
        $assignment = $this->access->assignment($user, [3]);

        return $assignment !== null
            && (int) $candidate->proposed_by_assignment_id === (int) $assignment->id
            && $candidate->status === CandidateStatus::PROPOSED
            && $this->access->teacherCoversVacancy($assignment, $candidate->vacancy);
    }
}
