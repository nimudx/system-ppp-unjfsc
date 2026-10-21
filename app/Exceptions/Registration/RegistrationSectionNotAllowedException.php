<?php

namespace App\Exceptions\Registration;

use App\Exceptions\BusinessException;

class RegistrationSectionNotAllowedException extends BusinessException
{
    protected $message = 'Solo puedes realizar registros para tu propia sección asignada.';

    public function status(): int
    {
        return 403;
    }

    public function code(): string
    {
        return 'USER_REGISTRATION_SECTION_NOT_ALLOWED';
    }
}
