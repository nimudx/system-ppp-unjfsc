<?php

namespace App\Domains\Academic\Exceptions;

use App\Shared\Exceptions\BusinessException;

class SemesterHasRelatedRecordsException extends BusinessException
{
    protected $message = 'No se puede retroceder, hay registros que dependen de este semestre.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'SEMESTER_HAS_RELATED_RECORDS';
    }
}
