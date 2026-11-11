<?php

namespace App\Domains\JobBoard\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCandidateStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:contacted,hired,discarded'],
            'status_note' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Selecciona el nuevo estado del candidato.',
            'status.in' => 'El estado seleccionado no es válido.',
            'status_note.max' => 'La nota no debe superar los 500 caracteres.',
        ];
    }
}
