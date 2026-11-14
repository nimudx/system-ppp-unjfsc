<?php

namespace App\Domains\JobBoard\Exceptions;

use App\Shared\Exceptions\BusinessException;

class VacancyInvalidTransition extends BusinessException
{
    protected $message = 'La vacante no puede pasar a ese estado.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'VACANCY_INVALID_TRANSITION';
    }
}
