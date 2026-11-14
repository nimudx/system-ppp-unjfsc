<?php

namespace App\Domains\JobBoard\Exceptions;

use App\Shared\Exceptions\BusinessException;

class CandidateAlreadyProposed extends BusinessException
{
    protected $message = 'El estudiante ya fue propuesto para esta vacante.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'CANDIDATE_ALREADY_PROPOSED';
    }
}
