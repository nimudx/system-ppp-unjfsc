<?php

namespace App\Domains\Supervision\Exceptions;

use App\Shared\Exceptions\BusinessException;

class PracticeReviewNotAllowedException extends BusinessException
{
    protected $message = 'Solo el docente supervisor asignado al estudiante puede calificar esta entrega.';

    public function status(): int
    {
        return 403;
    }

    public function code(): string
    {
        return 'PRACTICE_REVIEW_NOT_ALLOWED';
    }
}
