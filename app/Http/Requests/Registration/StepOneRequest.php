<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class StepOneRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'role_id' => 'required|integer|exists:roles,id',
            'section_id' => 'required|exists:sections,id',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El email debe ser un email valido.',
            'email.unique' => 'El email ya esta registrado.',
            'role_id.required' => 'El rol es obligatorio.',
            'role_id.exists' => 'El rol no existe.',
            'section_id.required' => 'La seccion es obligatoria.',
            'section_id.exists' => 'La seccion no existe.',
        ];
    }
}
