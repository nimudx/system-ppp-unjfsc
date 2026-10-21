<?php

namespace App\Domains\Documents\Exceptions;

use App\Shared\Exceptions\BusinessException;

class DocumentAlreadyApprovedException extends BusinessException
{
    protected $message = 'La evaluación ya fue aprobada o está pendiente.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'DOCUMENT_ALREADY_APPROVED';
    }
}
