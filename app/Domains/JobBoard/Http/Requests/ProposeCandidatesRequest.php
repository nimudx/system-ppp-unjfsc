<?php

namespace App\Domains\JobBoard\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProposeCandidatesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['integer', 'exists:assignments,id'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'student_ids.required' => 'Selecciona al menos un estudiante.',
            'student_ids.min' => 'Selecciona al menos un estudiante.',
            'student_ids.*.exists' => 'Uno de los estudiantes seleccionados no existe.',
            'note.max' => 'La nota no debe superar los 500 caracteres.',
        ];
    }
}
