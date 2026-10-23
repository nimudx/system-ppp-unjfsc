<?php

namespace App\Domains\Supervision\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewPracticeSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // 1 = aprobado, 3 = observado
            'approval_status' => ['required', 'integer', 'in:1,3'],
            'grade' => ['nullable', 'numeric', 'min:0', 'max:20', 'required_if:approval_status,1'],
            'comment' => ['nullable', 'string', 'max:500', 'required_if:approval_status,3'],
        ];
    }

    public function messages(): array
    {
        return [
            'approval_status.required' => 'El estado de la revisión es requerido.',
            'approval_status.in' => 'El estado debe ser aprobado u observado.',
            'grade.required_if' => 'La nota es requerida para aprobar.',
            'grade.numeric' => 'La nota debe ser un número.',
            'grade.min' => 'La nota debe ser mayor o igual a 0.',
            'grade.max' => 'La nota debe ser menor o igual a 20.',
            'comment.required_if' => 'Escribe la observación para el estudiante.',
            'comment.max' => 'El comentario debe tener como máximo 500 caracteres.',
        ];
    }
}
