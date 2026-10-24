<?php

namespace App\Domains\Supervision\Http\Requests;

use App\Domains\Supervision\Enums\PracticeSubmissionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitPracticeDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(PracticeSubmissionType::class)],
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Indica qué documento vas a enviar.',
            'type.enum' => 'El tipo de documento no es válido.',
            'file.required' => 'Selecciona un archivo.',
            'file.file' => 'El archivo no es válido.',
            'file.mimes' => 'El archivo debe ser PDF, DOC o DOCX.',
            'file.max' => 'El archivo debe pesar como máximo 10 MB.',
        ];
    }
}
