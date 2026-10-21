<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class StorePersonMassiveRequest extends FormRequest
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
            'role_id' => 'required|exists:roles,id',
            'section_id' => 'required|exists:sections,id',
            'rows' => 'required|array',
            'rows.*.email' => 'required|string|max:255',
            'rows.*.dni' => 'required|string|max:8|min:8',
            'rows.*.names' => 'required|string|max:255',
            'rows.*.surnames' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'role_id.required' => 'El rol es requerido',
            'role_id.exists' => 'El rol no existe',
            'section_id.required' => 'La sección es requerida',
            'section_id.exists' => 'La sección no existe',
            'rows.required' => 'Las filas son requeridas',
            'rows.array' => 'Las filas deben ser un array',
            'rows.*.email.required' => 'El email es requerido',
            'rows.*.email.string' => 'El email debe ser un string',
            'rows.*.email.max' => 'El email debe tener como máximo 255 caracteres',
            'rows.*.dni.required' => 'El DNI es requerido',
            'rows.*.dni.string' => 'El DNI debe ser un string',
            'rows.*.dni.max' => 'El DNI debe tener como máximo 8 caracteres',
            'rows.*.dni.min' => 'El DNI debe tener como mínimo 8 caracteres',
            'rows.*.names.required' => 'El nombre es requerido WAAA',
            'rows.*.names.string' => 'El nombre debe ser un string',
            'rows.*.names.max' => 'El nombre debe tener como máximo 255 caracteres',
            'rows.*.surnames.required' => 'Los apellidos son requeridos',
            'rows.*.surnames.string' => 'Los apellidos deben ser un string',
            'rows.*.surnames.max' => 'Los apellidos deben tener como máximo 255 caracteres',
        ];
    }
}
