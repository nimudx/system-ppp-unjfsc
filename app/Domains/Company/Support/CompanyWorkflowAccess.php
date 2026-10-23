<?php

namespace App\Domains\Company\Support;

use App\Domains\Company\Models\Company;
use App\Domains\Company\Models\CompanyValidationRequest;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use Illuminate\Database\Eloquent\Builder;

class CompanyWorkflowAccess
{
    public function assignment(User $user, int $role, bool $write = false): Assignment
    {
        $assignment = Assignment::with('section.school', 'semester')->whereKey(session('assignment_id'))->where('user_id', $user->id)->where('role_id', $role)->where('status', 1)->first();
        abort_unless($user->status == 1 && in_array($user->type_user_id, [1, 2]) && $assignment && $assignment->section, 403, 'El perfil académico activo no está autorizado.');
        abort_if($assignment->isBlocked() || $assignment->isLimited(), 403, 'Completa la validación académica antes de continuar.');
        if ($write) {
            abort_if($assignment->isReadOnly() || $assignment->semester?->status->value !== 1, 403, 'El perfil o semestre está en modo lectura.');
        }

        return $assignment;
    }

    public function teacherQuery(Assignment $teacher): Builder
    {
        return CompanyValidationRequest::query()->where('school_id', $teacher->section->school_id)->where('semester_id', $teacher->semester_id);
    }

    public function teacherRequest(User $user, CompanyValidationRequest $item, bool $write = false): Assignment
    {
        $teacher = $this->assignment($user, 3, $write);
        abort_unless($this->teacherQuery($teacher)->whereKey($item->id)->exists(), 403, 'La solicitud pertenece a otra escuela o semestre.');

        return $teacher;
    }

    public function studentRequest(User $user, CompanyValidationRequest $item, bool $write = false): Assignment
    {
        $student = $this->assignment($user, 5, $write);
        abort_unless($item->assignment_id === $student->id, 403, 'La solicitud no pertenece a tu perfil.');

        return $student;
    }

    public function company(User $user): Company
    {
        abort_unless($user->type_user_id === 3 && $user->status == 1, 403, 'Se requiere una cuenta de empresa activa.');

        return Company::where('account_user_id', $user->id)->where('status', 1)->whereNotNull('activated_at')->firstOrFail();
    }
}
