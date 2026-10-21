<?php

namespace App\Domains\Academic\Exceptions;

use App\Shared\Exceptions\BusinessException;

class SemesterInvalidCodeException extends BusinessException
{
    protected $message = 'El código del semestre es inválido.';

    public function status(): int
    {
        return 400;
    }

    public function code(): string
    {
        return 'SEMESTER_INVALID_CODE';
    }
}
