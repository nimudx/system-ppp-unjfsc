<?php

namespace App\Domains\JobBoard\Http\Requests;

use App\Domains\JobBoard\Enums\VacancyCloseReason;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CloseVacancyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', Rule::enum(VacancyCloseReason::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Indica el motivo de cierre.',
            'reason.enum' => 'El motivo de cierre no es válido.',
        ];
    }
}
