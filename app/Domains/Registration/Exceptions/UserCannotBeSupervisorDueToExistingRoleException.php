<?php

namespace App\Domains\Registration\Exceptions;

use App\Shared\Exceptions\BusinessException;

class UserCannotBeSupervisorDueToExistingRoleException extends BusinessException
{
    protected $roleName;

    public function __construct(string $roleName)
    {
        $this->roleName = $roleName;
        $this->message = 'El usuario no puede ser Docente Supervisor porque ya está registrado como '.$roleName.'.';
    }

    public function status(): int
    {
        return 403;
    }

    public function code(): string
    {
        return 'USER_REGISTRATION_ROLE_NOT_ALLOWED';
    }
}
