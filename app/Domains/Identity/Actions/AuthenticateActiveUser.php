<?php

namespace App\Domains\Identity\Actions;

use App\Domains\Identity\Models\User;
use App\Domains\Identity\Support\StrictLoginRateLimiter;
use App\Shared\Enums\Role;
use Illuminate\Auth\Events\Failed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;

/**
 * Valida las credenciales del login, rechaza cuentas desactivadas y avisa cuántos intentos quedan.
 * Fortify la usa antes del desafío 2FA y al iniciar sesión.
 */
class AuthenticateActiveUser
{
    /** Tipo de usuario administrador. */
    private const ADMIN_TYPE_ID = 1;

    /** Tipo de usuario empresa. */
    private const COMPANY_TYPE_ID = 3;

    /** Roles que no son docentes ni alumnos y pueden usar cualquier correo. */
    private const UNRESTRICTED_ROLE_IDS = [
        Role::ADMIN,
        Role::SUBADMIN,
        Role::EMPRESA,
    ];

    /** Dominio institucional obligatorio para docentes y alumnos. */
    private const INSTITUTIONAL_EMAIL_DOMAIN = '@unjfsc.edu.pe';

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

        // Docentes y alumnos solo pueden entrar con su correo institucional.
        // Administradores, subadministradores y empresas pueden usar cualquier dominio.
        if ($this->requiresInstitutionalEmail($user) && ! $this->hasInstitutionalEmail($user)) {
            throw ValidationException::withMessages([
                Fortify::username() => ['Solo puedes iniciar sesión con tu correo institucional @unjfsc.edu.pe.'],
            ]);
        }

        return $user;
    }

    /**
     * Determina si la cuenta pertenece a un docente o alumno.
     *
     * No basta con type_user_id: las cuentas administrativas creadas por los
     * seeders pueden tener type_user_id = 2, por lo que el rol es la fuente de verdad.
     */
    protected function requiresInstitutionalEmail(User $user): bool
    {
        if (in_array((int) $user->type_user_id, [self::ADMIN_TYPE_ID, self::COMPANY_TYPE_ID], true)) {
            return false;
        }

        $unrestrictedRoleIds = array_map(
            static fn (Role $role): int => $role->value,
            self::UNRESTRICTED_ROLE_IDS,
        );

        return ! $user->assignments()
            ->whereIn('role_id', $unrestrictedRoleIds)
            ->exists();
    }

    protected function hasInstitutionalEmail(User $user): bool
    {
        return Str::endsWith(
            Str::lower(trim((string) $user->email)),
            self::INSTITUTIONAL_EMAIL_DOMAIN,
        );
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
