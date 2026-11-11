<?php

namespace App\Domains\JobBoard\Exceptions;

use App\Shared\Exceptions\BusinessException;

class CandidateNotEligible extends BusinessException
{
    protected $message = 'El estudiante no cumple los requisitos para ser propuesto.';

    public function status(): int
    {
        return 422;
    }

    public function code(): string
    {
        return 'CANDIDATE_NOT_ELIGIBLE';
    }
}
