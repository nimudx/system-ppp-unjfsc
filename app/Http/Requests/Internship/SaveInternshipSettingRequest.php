<?php

namespace App\Http\Requests\Internship;

use Illuminate\Foundation\Http\FormRequest;

class SaveInternshipSettingRequest extends FormRequest
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
            'section_id' => 'required|exists:sections,id',
            'workflow_schema' => 'required|array',
            'workflow_schema.*.id' => 'required|string',
            'workflow_schema.*.step' => 'required|integer',
            'workflow_schema.*.name' => 'required|string',
            'workflow_schema.*.is_evaluation' => 'required|boolean',
            'workflow_schema.*.required_docs' => 'required|array',
            'workflow_schema.*.required_docs.development' => 'present|array',
            'workflow_schema.*.required_docs.development.*.name' => 'required|string',
            'workflow_schema.*.required_docs.development.*.code' => 'required|exists:document_types,code|string',
            'workflow_schema.*.required_docs.validation' => 'present|array',
            'workflow_schema.*.required_docs.validation.*.name' => 'required|string',
            'workflow_schema.*.required_docs.validation.*.code' => 'required|exists:document_types,code|string',
        ];
    }

    public function messages(): array
    {
        return [
            'section_id.required' => 'La sección es obligatoria.',
            'section_id.exists' => 'La sección seleccionada no existe.',
            'workflow_schema.required' => 'El esquema del flujo es obligatorio.',
            'workflow_schema.array' => 'El esquema del flujo debe ser un array.',
            'workflow_schema.*.id.required' => 'El ID de la etapa es obligatorio.',
            'workflow_schema.*.id.string' => 'El ID de la etapa debe ser una cadena de texto.',
            'workflow_schema.*.step.required' => 'El paso de la etapa es obligatorio.',
            'workflow_schema.*.step.integer' => 'El paso de la etapa debe ser un número entero.',
            'workflow_schema.*.name.required' => 'El nombre de la etapa es obligatorio.',
            'workflow_schema.*.name.string' => 'El nombre de la etapa debe ser una cadena de texto.',
            'workflow_schema.*.is_evaluation.required' => 'El campo is_evaluation es obligatorio.',
            'workflow_schema.*.is_evaluation.boolean' => 'El campo is_evaluation debe ser un booleano.',
            'workflow_schema.*.required_docs.required' => 'El campo required_docs es obligatorio.',
            'workflow_schema.*.required_docs.array' => 'El campo required_docs debe ser un array.',
            'workflow_schema.*.required_docs.development.present' => 'El campo desarrollo es obligatorio.',
            'workflow_schema.*.required_docs.development.array' => 'El campo desarrollo debe ser un array.',
            'workflow_schema.*.required_docs.development.*.name.required' => 'El nombre del documento es obligatorio.',
            'workflow_schema.*.required_docs.development.*.name.string' => 'El nombre del documento debe ser una cadena de texto.',
            'workflow_schema.*.required_docs.development.*.code.required' => 'El código del documento es obligatorio.',
            'workflow_schema.*.required_docs.development.*.code.exists' => 'El código del documento no existe.',
            'workflow_schema.*.required_docs.development.*.code.string' => 'El código del documento debe ser una cadena de texto.',
            'workflow_schema.*.required_docs.validation.present' => 'El campo convalidacion es obligatorio.',
            'workflow_schema.*.required_docs.validation.array' => 'El campo convalidacion debe ser un array.',
            'workflow_schema.*.required_docs.validation.*.name.required' => 'El nombre del documento es obligatorio.',
            'workflow_schema.*.required_docs.validation.*.name.string' => 'El nombre del documento debe ser una cadena de texto.',
            'workflow_schema.*.required_docs.validation.*.code.required' => 'El código del documento es obligatorio.',
            'workflow_schema.*.required_docs.validation.*.code.exists' => 'El código del documento no existe.',
            'workflow_schema.*.required_docs.validation.*.code.string' => 'El código del documento debe ser una cadena de texto.',
        ];
    }
}
