<?php

namespace App\Exceptions\Document;

use App\Exceptions\BusinessException;

class DocumentSizeLimitException extends BusinessException
{
    protected $message = 'El archivo supera el límite permitido de 10MB..';

    public function status(): int
    {
        return 402;
    }

    public function code(): string
    {
        return 'FILE_SIZE_LIMIT';
    }
}
