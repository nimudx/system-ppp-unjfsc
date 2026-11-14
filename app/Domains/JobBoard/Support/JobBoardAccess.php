<?php

namespace App\Domains\JobBoard\Support;

use App\Domains\Company\Models\Company;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use App\Domains\JobBoard\Models\Vacancy;

/**
 * Resolución del contexto activo del usuario para el módulo JobBoard.
 *
 * Las policies no pueden usar abort(), por eso aquí se devuelven valores
 * nullable y cada capa decide si autoriza o no.
 */
class JobBoardAccess
{
    /**
     * @param  array<int, int>  $roles
     */
    public function assignment(User $user, array $roles): ?Assignment
    {
        $assignmentId = session('assignment_id');

        if (! $assignmentId) {
            return null;
        }

        return Assignment::query()
            ->with(['section.school', 'semester'])
            ->whereKey($assignmentId)
            ->where('user_id', $user->id)
            ->where('status', 1)
            ->whereIn('role_id', $roles)
            ->first();
    }

    public function company(User $user): ?Company
    {
        if ((int) $user->type_user_id !== 3 || (int) $user->status !== 1) {
            return null;
        }

        return Company::query()
            ->where('account_user_id', $user->id)
            ->where('status', 1)
            ->whereNotNull('activated_at')
            ->first();
    }

    public function isAdmin(Assignment $assignment): bool
    {
        return (int) $assignment->role_id === 1;
    }

    public function isSubadmin(Assignment $assignment): bool
    {
        return (int) $assignment->role_id === 2;
    }

    public function isTeacher(Assignment $assignment): bool
    {
        return (int) $assignment->role_id === 3;
    }

    /**
     * Un subadmin solo alcanza vacantes cuyas escuelas destino pertenecen
     * a la facultad de su sección activa.
     */
    public function subadminCoversVacancy(Assignment $assignment, Vacancy $vacancy): bool
    {
        $facultyId = $assignment->section?->school?->faculty_id;

        if (! $facultyId) {
            return false;
        }

        return $vacancy->schools()->where('faculty_id', $facultyId)->exists();
    }

    /**
     * Un docente titular solo alcanza vacantes publicadas para su escuela.
     */
    public function teacherCoversVacancy(Assignment $assignment, Vacancy $vacancy): bool
    {
        $schoolId = $assignment->section?->school_id;

        if (! $schoolId) {
            return false;
        }

        return $vacancy->schools()->where('school_id', $schoolId)->exists();
    }
}
