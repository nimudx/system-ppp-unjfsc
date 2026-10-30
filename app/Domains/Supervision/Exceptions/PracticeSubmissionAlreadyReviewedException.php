<?php

namespace App\Domains\Supervision\Exceptions;

use App\Shared\Exceptions\BusinessException;

class PracticeSubmissionAlreadyReviewedException extends BusinessException
{
    protected $message = 'Esta entrega ya fue revisada.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'PRACTICE_SUBMISSION_ALREADY_REVIEWED';
    }
}
