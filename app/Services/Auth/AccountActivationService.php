<?php

namespace App\Services\Auth;

use App\Enums\UserStatus;
use App\Mail\AccountActivationMail;
use App\Models\AccountActivation;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AccountActivationService
{
    /**
     * Duración del token de activación en horas.
     */
    private const TOKEN_EXPIRY_HOURS = 24;

    /**
     * Genera un token seguro y lo persiste en la base de datos.
     * Si el usuario ya tenía un token previo (no usado), lo invalida
     * generando uno nuevo, garantizando que solo haya un token activo.
     */
    public function createActivationToken(User $user): AccountActivation
    {
        // Invalidar tokens previos no usados para este usuario
        AccountActivation::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->delete();

        return AccountActivation::create([
            'user_id'    => $user->id,
            'token'      => Str::random(64),
            'expires_at' => now()->addHours(self::TOKEN_EXPIRY_HOURS),
        ]);
    }

    /**
     * Envía el correo de activación al usuario recién registrado.
     */
    public function sendActivationEmail(User $user, AccountActivation $activation): void
    {
        // Cargamos la relación person para tener el nombre completo disponible en el Mailable
        $user->loadMissing('person');

        Mail::to($user->email)->send(new AccountActivationMail($user, $activation));
    }

    /**
     * Busca un token de activación válido (no expirado y no usado).
     *
     * @return AccountActivation|null  null si el token no existe o es inválido.
     */
    public function findValidToken(string $token): ?AccountActivation
    {
        return AccountActivation::query()
            ->where('token', $token)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->with('user')
            ->first();
    }

    /**
     * Activa la cuenta del usuario:
     * - Establece la contraseña con Hash::make()
     * - Marca el token como usado (used_at = now)
     * - Cambia el status del usuario a ACTIVE
     *
     * Toda la operación se ejecuta dentro de la transacción del llamante
     * o puede usarse de forma independiente.
     */
    public function activateAccount(AccountActivation $activation, string $password): User
    {
        $user = $activation->user;

        // 1. Establecer contraseña real elegida por el usuario
        $user->password = Hash::make($password);

        // 2. Activar la cuenta
        $user->status = UserStatus::ACTIVE;

        $user->save();

        // 3. Invalidar el token marcándolo como usado
        $activation->used_at = now();
        $activation->save();

        return $user;
    }
}
