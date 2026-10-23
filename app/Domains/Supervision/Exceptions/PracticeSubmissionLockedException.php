<?php

namespace App\Domains\Supervision\Exceptions;

use App\Shared\Exceptions\BusinessException;

class PracticeSubmissionLockedException extends BusinessException
{
    protected $message = 'Ya tienes una entrega pendiente de revisión o aprobada para este documento.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'PRACTICE_SUBMISSION_LOCKED';
    }
}
