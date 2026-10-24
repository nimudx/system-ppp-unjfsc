<?php

namespace App\Domains\Company\Services;

use App\Domains\Company\Enums\CompanyRequestState;
use App\Domains\Company\Models\CompanyValidationRequest;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Internship\Models\Placement;

class CompanyAcceptanceService
{
    public const PRACTICE_DECLARATION = 'Declaro que los datos del jefe inmediato y de la práctica registrados son válidos y correctos.';

    public function accepted(Assignment $student, ?int $companyId = null): CompanyValidationRequest
    {
        abort_unless($student->role_id === 5 && $student->status->value === 1 && $student->user_id === auth()->id(), 403, 'La práctica debe pertenecer al estudiante autenticado.');
        $selected = app(\App\Domains\Company\Support\CompanyWorkflowAccess::class)->assignment(auth()->user(), 5, true);
        abort_unless($selected->id === $student->id, 403, 'El perfil de estudiante no coincide con la sesión.');
        $item = CompanyValidationRequest::where('assignment_id', $student->id)->where('state', CompanyRequestState::ACCEPTED)->first();
        abort_unless($item && ($companyId === null || $item->company_id === $companyId), 409, 'La empresa debe aceptar al estudiante antes de registrar la práctica o cargar archivos.');
        abort_unless($item->company?->status == 1, 409, 'La empresa no está activa.');

        return $item;
    }

    public function documents(Assignment $student, Placement $placement): void
    {
        abort_unless($placement->assignment_id === $student->id, 403, 'El expediente no pertenece al estudiante.');
        $item = $this->accepted($student, $placement->company_id);
        abort_unless($placement->company_validation_request_id === $item->id && $placement->practice_declared_at, 409, 'Primero registra el jefe inmediato y los datos de la práctica.');
    }
}
