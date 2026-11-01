<?php

namespace App\Domains\Identity\Actions;

use App\Domains\Identity\Models\User;
use App\Domains\Identity\Support\StrictLoginRateLimiter;
use Illuminate\Auth\Events\Failed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;

/**
 * Valida las credenciales del login, rechaza cuentas desactivadas y avisa cuántos intentos quedan.
 * Fortify la usa antes del desafío 2FA y al iniciar sesión.
 */
class AuthenticateActiveUser
{
    public function __construct(protected StrictLoginRateLimiter $limiter) {}

    public function __invoke(Request $request): User
    {
        // Eloquent usa consultas preparadas: el correo nunca se concatena al SQL.
        $user = User::where('email', (string) $request->input(Fortify::username()))->first();

        // Se compara contra un hash aunque el correo no exista, para no revelar qué correos están registrados.
        $hash = $user?->password ?? '$2y$12$'.str_repeat('a', 53);

        if (! Hash::check((string) $request->input('password'), $hash) || ! $user) {
            $this->fail($request);
        }

        if ((int) ($user->status ?? 1) !== 1) {
            throw ValidationException::withMessages([
                Fortify::username() => ['Tu cuenta está desactivada. Comunícate con el administrador.'],
            ]);
        }

        return $user;
    }

    protected function fail(Request $request): never
    {
        event(new Failed(config('fortify.guard'), null, [
            Fortify::username() => $request->input(Fortify::username()),
        ]));

        $this->limiter->increment($request);
        $remaining = $this->limiter->remaining($request);

        $message = $remaining > 0
            ? "Correo o contraseña incorrectos. Te quedan {$remaining} intento(s)."
            : 'Correo o contraseña incorrectos. Cuenta bloqueada temporalmente por 15 minutos.';

        throw ValidationException::withMessages([
            Fortify::username() => [$message],
        ]);
    }
}
