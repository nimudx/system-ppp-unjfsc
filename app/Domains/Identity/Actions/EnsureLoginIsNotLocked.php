<?php

namespace App\Domains\Identity\Actions;

use App\Domains\Identity\Support\StrictLoginRateLimiter;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;

class EnsureLoginIsNotLocked
{
    public function __construct(protected StrictLoginRateLimiter $limiter) {}

    public function handle($request, $next)
    {
        if (! $this->limiter->tooManyAttempts($request)) {
            return $next($request);
        }

        event(new Lockout($request));

        $minutes = (int) ceil($this->limiter->availableIn($request) / 60);

        throw ValidationException::withMessages([
            Fortify::username() => ["Cuenta bloqueada temporalmente por demasiados intentos fallidos. Inténtalo de nuevo en {$minutes} minuto(s) o restablece tu contraseña."],
        ])->status(429);
    }
}
