<?php

namespace App\Domains\Supervision\Exceptions;

use App\Shared\Exceptions\BusinessException;

class GroupHasStudentsException extends BusinessException
{
    protected $message = 'El grupo no se puede eliminar porque tiene estudiantes asignados.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'GROUP_HAS_STUDENTS';
    }
}
