<?php

namespace App\Domains\Documents\Exceptions;

use App\Shared\Exceptions\BusinessException;

class DocumentInvalidContextException extends BusinessException
{
    protected $message = 'El contexto del documento no es válido.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'CONTEXT_INVALID';
    }
}
