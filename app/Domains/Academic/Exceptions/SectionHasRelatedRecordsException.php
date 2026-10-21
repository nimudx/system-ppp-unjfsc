<?php

namespace App\Domains\Academic\Exceptions;

use App\Shared\Exceptions\BusinessException;

class SectionHasRelatedRecordsException extends BusinessException
{
    protected $message = 'No se puede eliminar la sección porque tiene registros relacionados.';

    public function status(): int
    {
        return 403;
    }

    public function code(): string
    {
        return 'SECTION_HAS_RELATED_RECORDS';
    }
}
