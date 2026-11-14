<?php

namespace App\Domains\JobBoard\Http\Requests;

use App\Domains\JobBoard\Enums\VacancyModality;
use App\Domains\JobBoard\Enums\VacancyType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVacancyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:5000'],
            'type' => ['required', Rule::enum(VacancyType::class)],
            'modality' => ['required', Rule::enum(VacancyModality::class)],
            'area_name' => ['nullable', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:150'],
            'positions_count' => ['required', 'integer', 'min:1', 'max:999'],
            'requirements' => ['nullable', 'string', 'max:5000'],
            'deadline_at' => ['nullable', 'date'],
            'school_ids' => ['required', 'array', 'min:1'],
            'school_ids.*' => ['integer', Rule::exists('schools', 'id')->where('status', 1)],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Escribe un título para la vacante.',
            'description.required' => 'Describe la vacante.',
            'type.enum' => 'El tipo de vacante no es válido.',
            'modality.enum' => 'La modalidad seleccionada no es válida.',
            'positions_count.min' => 'Debe haber al menos una posición.',
            'school_ids.required' => 'Selecciona al menos una escuela destino.',
            'school_ids.min' => 'Selecciona al menos una escuela destino.',
            'school_ids.*.exists' => 'Una de las escuelas seleccionadas no es válida.',
        ];
    }
}
