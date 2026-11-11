<?php

namespace App\Domains\JobBoard\Exceptions;

use App\Shared\Exceptions\BusinessException;

class VacancyNotEditable extends BusinessException
{
    protected $message = 'Solo se puede editar una vacante en borrador u observada.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'VACANCY_NOT_EDITABLE';
    }
}
