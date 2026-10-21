<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResourceRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'file' => 'required|file|mimes:pdf,doc,docx|max:2048',
            'document_type_id' => 'required|exists:document_types,id',
            'role_id' => 'nullable|exists:roles,id',
            'level' => 'required|in:1,2,3,4,5',
            'location_id' => 'nullable',
            'location_type' => 'nullable|string|max:255',
            'semester_id' => 'nullable|exists:semesters,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es requerido',
            'name.string' => 'El nombre debe ser una cadena de texto',
            'name.max' => 'El nombre debe tener como máximo 255 caracteres',
            'description.required' => 'La descripción es requerida',
            'description.string' => 'La descripción debe ser una cadena de texto',
            'description.max' => 'La descripción debe tener como máximo 255 caracteres',
            'file.required' => 'El archivo es requerido',
            'file.file' => 'El archivo debe ser un archivo',
            'file.mimes' => 'El archivo debe ser un archivo de tipo pdf, doc o docx',
            'file.max' => 'El archivo debe tener como máximo 2048 kilobytes',
            'document_type_id.required' => 'El tipo de documento es requerido',
            'document_type_id.exists' => 'El tipo de documento no existe',
            'role_id.exists' => 'El rol no existe',
            'level.required' => 'El alcance es requerido',
            'level.in' => 'El alcance seleccionado no es válido',
            'location_id.required' => 'La ubicación es requerida',
            'location_id.exists' => 'La ubicación no existe',
            'location_type.required' => 'El tipo de ubicación es requerido',
            'location_type.string' => 'El tipo de ubicación debe ser una cadena de texto',
            'location_type.max' => 'El tipo de ubicación debe tener como máximo 255 caracteres',
            'semester_id.required' => 'El semestre es requerido',
            'semester_id.exists' => 'El semestre no existe',
        ];
    }
}
