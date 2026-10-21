<?php

namespace App\Domains\Academic\Exceptions;

use App\Shared\Exceptions\BusinessException;

class SemesterPreviousNotFoundException extends BusinessException
{
    protected $message = 'No hay semestres anteriores para retroceder.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'SEMESTER_PREVIOUS_NOT_FOUND';
    }
}
