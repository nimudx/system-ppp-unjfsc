<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ActivateAccountRequest extends FormRequest
{
    /**
     * Las rutas de activación son públicas; cualquiera con el token válido puede activar.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
            'password_confirmation' => ['required', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'password.required'              => 'La contraseña es obligatoria.',
            'password.min'                   => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed'             => 'Las contraseñas no coinciden.',
            'password_confirmation.required' => 'Debes confirmar tu contraseña.',
        ];
    }
}
