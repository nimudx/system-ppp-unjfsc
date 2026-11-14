<?php

namespace App\Domains\JobBoard\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewVacancyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'decision' => ['required', 'in:approve,observe,reject'],
            'comment' => ['nullable', 'required_if:decision,observe,reject', 'string', 'max:2000'],
            'notify_teachers' => ['nullable', 'boolean'],
            'school_ids' => ['nullable', 'array', 'min:1', 'required_if:decision,approve'],
            'school_ids.*' => ['integer', 'distinct', 'exists:schools,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'decision.required' => 'Selecciona una decisión.',
            'decision.in' => 'La decisión seleccionada no es válida.',
            'comment.required_if' => 'El comentario es obligatorio al observar o rechazar.',
            'comment.max' => 'El comentario no debe superar los 2000 caracteres.',
            'school_ids.required_if' => 'Confirma al menos una escuela destino antes de publicar.',
            'school_ids.array' => 'Las escuelas destino no tienen un formato válido.',
            'school_ids.min' => 'Confirma al menos una escuela destino antes de publicar.',
            'school_ids.*.integer' => 'Una de las escuelas seleccionadas no es válida.',
            'school_ids.*.distinct' => 'No repitas la misma escuela destino.',
            'school_ids.*.exists' => 'Una de las escuelas seleccionadas no existe.',
        ];
    }
}
