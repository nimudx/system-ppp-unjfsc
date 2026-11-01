<?php

namespace App\Domains\Identity\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssignmentManageRequest extends FormRequest
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
            // 1 eliminar, 2 deshabilitar, 3 habilitar, 4 cambiar rol (titular ↔ supervisor)
            'action' => 'required|in:1,2,3,4',
            'reason' => 'required|string|max:255',
            'new_role_id' => 'required_if:action,4|nullable|integer|in:3,4',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'new_role_id.required_if' => 'Selecciona el nuevo rol.',
            'new_role_id.in' => 'Solo se puede cambiar entre Docente Titular y Docente Supervisor.',
        ];
    }
}
