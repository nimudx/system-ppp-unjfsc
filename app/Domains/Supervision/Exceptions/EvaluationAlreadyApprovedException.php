<?php

namespace App\Domains\Supervision\Exceptions;

use App\Shared\Exceptions\BusinessException;

class EvaluationAlreadyApprovedException extends BusinessException
{
    protected $message = 'La evaluación ya fue aprobada o está pendiente, by Marrrr.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'EVALUATION_ALREADY_APPROVED';
    }
}
