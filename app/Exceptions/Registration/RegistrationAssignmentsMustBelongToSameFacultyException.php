<?php

namespace App\Exceptions\Registration;

use App\Exceptions\BusinessException;

class RegistrationAssignmentsMustBelongToSameFacultyException extends BusinessException
{
    protected $message = 'Para el Docente Supervisor, todas sus asignaciones deben pertenecer a la misma Facultad.';

    public function status(): int
    {
        return 403;
    }

    public function code(): string
    {
        return 'USER_REGISTRATION_ASSIGNMENTS_MUST_BELONG_TO_SAME_FACULTY';
    }
}
