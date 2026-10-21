<?php

namespace App\Exceptions;

class ResourceNotFoundException extends BusinessException
{
    protected $message = 'El recurso no fue encontrado.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'RESOURCE_NOT_FOUND';
    }
}
