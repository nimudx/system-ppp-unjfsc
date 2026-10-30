<?php

namespace App\Domains\Identity\Support;

use Illuminate\Http\Request;
use Laravel\Fortify\LoginRateLimiter;

/**
 * Bloquea el inicio de sesión de un correo (desde una misma IP) tras 3 intentos fallidos.
 * El contador solo suma intentos fallidos y se reinicia al iniciar sesión correctamente.
 */
class StrictLoginRateLimiter extends LoginRateLimiter
{
    public const MAX_ATTEMPTS = 3;

    public const LOCKOUT_SECONDS = 15 * 60;

    public function tooManyAttempts(Request $request)
    {
        return $this->limiter->tooManyAttempts($this->throttleKey($request), self::MAX_ATTEMPTS);
    }

    public function increment(Request $request)
    {
        $this->limiter->hit($this->throttleKey($request), self::LOCKOUT_SECONDS);
    }

    public function remaining(Request $request): int
    {
        return max(0, self::MAX_ATTEMPTS - $this->attempts($request));
    }
}
