<?php

namespace App\Http\Requests\Supervision;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluationRequest extends FormRequest
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
            'grade' => 'required|numeric|min:0|max:20',
            'comment' => 'nullable|string|max:255',
            'code' => 'required|exists:document_types,code',
            'module_id' => 'required|integer|exists:modules,id',
            'file' => 'nullable|file|mimes:pdf|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'grade.required' => 'La nota es requerida.',
            'grade.numeric' => 'La nota debe ser un número.',
            'grade.min' => 'La nota debe ser mayor o igual a 0.',
            'grade.max' => 'La nota debe ser menor o igual a 20.',
            'comment.required' => 'El comentario es requerido.',
            'comment.string' => 'El comentario debe ser una cadena de texto.',
            'comment.max' => 'El comentario debe tener como máximo 255 caracteres.',
            'code.required' => 'El código es requerido.',
            'code.exists' => 'El código no existe.',
            'module_id.required' => 'El módulo es requerido.',
            'module_id.exists' => 'El módulo no existe.',
            'file.required' => 'El archivo es requerido.',
            'file.file' => 'El archivo debe ser un archivo.',
            'file.mimes' => 'El archivo debe ser un PDF.',
            'file.max' => 'El archivo debe tener como máximo 10240 KB.',
        ];
    }
}