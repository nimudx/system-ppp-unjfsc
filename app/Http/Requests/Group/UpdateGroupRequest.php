<?php

namespace App\Http\Requests\Group;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGroupRequest extends FormRequest
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
            'supervisor_id' => 'nullable|exists:assignments,id',
            'name' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'supervisor_id.exists' => 'El supervisor seleccionado no existe.',
            'name.required' => 'El nombre del grupo es obligatorio.',
            'name.max' => 'El nombre del grupo no puede exceder los 255 caracteres.',
        ];
    }
}
