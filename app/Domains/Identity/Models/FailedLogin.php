<?php

namespace App\Domains\Identity\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Intento fallido o bloqueo de inicio de sesión (lo registra FortifyServiceProvider).
 */
class FailedLogin extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['email', 'ip', 'locked_out'];

    protected function casts(): array
    {
        return ['locked_out' => 'boolean'];
    }
}
