<?php

namespace App\Exceptions\Registration;

use App\Exceptions\BusinessException;

class RegistrationFacultyNotAllowedException extends BusinessException
{
    protected $message = 'Solo puedes registrar usuarios dentro de tu propia facultad.';

    public function status(): int
    {
        return 403;
    }

    public function code(): string
    {
        return 'USER_REGISTRATION_FACULTY_NOT_ALLOWED';
    }
}
