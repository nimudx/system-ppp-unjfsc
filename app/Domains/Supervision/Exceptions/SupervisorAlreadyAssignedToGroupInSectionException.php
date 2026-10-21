<?php

namespace App\Domains\Supervision\Exceptions;

use App\Shared\Exceptions\BusinessException;

class SupervisorAlreadyAssignedToGroupInSectionException extends BusinessException
{
    protected $message = 'El docente supervisor ya tiene un grupo asignado en esta sección.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'SUPERVISOR_ALREADY_ASSIGNED_TO_GROUP_IN_SECTION';
    }
}
