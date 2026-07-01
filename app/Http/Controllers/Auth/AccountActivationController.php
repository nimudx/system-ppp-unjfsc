<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ActivateAccountRequest;
use App\Services\Auth\AccountActivationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class AccountActivationController extends Controller
{
    public function __construct(
        protected AccountActivationService $activationService,
    ) {}

    /**
     * Muestra el formulario para crear la contraseña.
     * GET /activate/{token}
     */
    public function show(string $token): View|RedirectResponse
    {
        $activation = $this->activationService->findValidToken($token);

        if (! $activation) {
            return redirect()->route('home')
                ->with('error', 'El enlace de activación no es válido o ha expirado. Contacta al administrador.');
        }

        $user   = $activation->user;
        $person = $user->person;
        $fullName = $person
            ? trim($person->names . ' ' . $person->surnames)
            : $user->name;

        return view('auth.activate', [
            'token'    => $token,
            'userName' => $fullName,
            'email'    => $user->email,
        ]);
    }

    /**
     * Procesa el formulario, activa la cuenta y redirige al login.
     * POST /activate/{token}
     */
    public function activate(ActivateAccountRequest $request, string $token): RedirectResponse
    {
        $activation = $this->activationService->findValidToken($token);

        if (! $activation) {
            return redirect()->route('home')
                ->with('error', 'El enlace de activación no es válido o ha expirado. Contacta al administrador.');
        }

        $this->activationService->activateAccount($activation, $request->validated('password'));

        return redirect()->route('activation.success')
            ->with('success', '¡Cuenta activada exitosamente! Ya puedes iniciar sesión.');
    }

    /**
     * Página de éxito tras activar la cuenta.
     * GET /activate/success
     */
    public function success(): View
    {
        // Evitar acceso directo sin el mensaje de sesión
        if (! session()->has('success')) {
            return redirect()->route('home');
        }

        return view('auth.activation-success');
    }
}
