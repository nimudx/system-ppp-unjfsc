<?php

namespace App\Domains\JobBoard\Exceptions;

use App\Shared\Exceptions\BusinessException;

class CompanyNotActive extends BusinessException
{
    protected $message = 'La cuenta de empresa debe estar activa para publicar vacantes.';

    public function status(): int
    {
        return 403;
    }

    public function code(): string
    {
        return 'COMPANY_NOT_ACTIVE';
    }
}
