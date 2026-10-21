<?php

namespace App\Exceptions\Registration;

use App\Exceptions\BusinessException;

class UserAlreadyAssignedInSemesterException extends BusinessException
{
    protected $roleName;

    public function __construct(string $roleName)
    {
        $this->roleName = $roleName;
        $this->message = 'El usuario ya cuenta con una asignación activa en este semestre como '.$roleName.'.';
    }

    public function status(): int
    {
        return 403;
    }

    public function code(): string
    {
        return 'USER_ALREADY_ASSIGNED_IN_SEMESTER';
    }
}
