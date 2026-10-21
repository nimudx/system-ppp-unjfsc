<?php

namespace App\Domains\Internship\Exceptions;

use App\Shared\Exceptions\BusinessException;

class InternshipNotActiveException extends BusinessException
{
    protected $message = 'Ya existe una práctica activa. No se puede registrar una nueva';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'INTERNSHIP_NOT_ACTIVE';
    }
}
