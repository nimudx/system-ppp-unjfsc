<?php

namespace App\Exceptions\Registration;

use App\Exceptions\BusinessException;

class UserAlreadyRegisteredInSectionException extends BusinessException
{
    protected $roleName;

    public function __construct(string $roleName)
    {
        $this->roleName = $roleName;
        $this->message = 'El usuario ya se encuentra registrado en esta sección como '.$roleName.'. Revise la lista.';
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
