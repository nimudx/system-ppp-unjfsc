<?php

namespace App\Http\Requests\Internship;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePlacementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // La autenticación y el rol ya se validan en el middleware de la ruta.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->input('company.id');

        return [
            'internship_type' => 'required|in:development,validation',
            // origin: solo requerido y validado si el tipo es 'development'
            'origin_type' => [
                'nullable',
                Rule::requiredIf(fn () => $this->input('internship_type') === 'development'),
                Rule::when(
                    fn () => $this->input('internship_type') === 'development',
                    ['in:direct,application']
                ),
            ],

            // Si ya tenemos company.id, no crear ni validar RUC como único
            'company.id' => 'nullable|exists:companies,id',
            'company.ruc' => [
                'required_if:company.id,null',
                'string',
                'max:11',
                Rule::when(
                    ! $companyId,
                    [Rule::unique('companies', 'ruc')]
                ),
            ],
            'company.name' => 'required_if:company.id,null|string|max:255',
            'company.address' => 'nullable|string|max:255',
            'company.phone' => 'nullable|string|max:20',
            'company.email' => 'nullable|email|max:255',

            'placement.staff_id' => 'nullable|exists:staffs,id',
            'placement.boss_name' => 'required_if:placement.staff_id,null|string|max:255',
            'placement.boss_position' => 'nullable|string|max:255',
            'placement.boss_email' => 'nullable|email|max:255',
            'placement.boss_phone' => 'nullable|string|max:255',

            'placement.area_id' => 'nullable|exists:areas,id',
            'placement.area_name' => 'required_if:placement.area_id,null|string|max:255',
            'placement.area_description' => 'nullable|string|max:255',

            'placement.position' => 'required|string|max:255',
            'placement.description' => 'nullable|string|max:1000',
            'placement.start_date' => 'required|date',
            'placement.end_date' => 'nullable|date|after:placement.start_date',
        ];
    }

    public function messages(): array
    {
        return [
            'internship_type.required' => 'El tipo de pasantía es obligatorio.',
            'internship_type.in' => 'El tipo de pasantía debe ser desarrollo o convalidación.',
            'origin_type.required_if' => 'El origen de la pasantía es obligatorio.',
            'origin_type.in' => 'El origen de la pasantía debe ser directo o aplicación.',
            'company.id.exists' => 'La empresa no existe.',
            'company.ruc.required_if' => 'El RUC de la empresa es obligatorio.',
            'company.ruc.unique' => 'El RUC de la empresa ya existe.',
            'company.name.required_if' => 'El nombre de la empresa es obligatorio.',
            'company.address.required_if' => 'La dirección de la empresa es obligatoria.',
            'company.phone.required_if' => 'El teléfono de la empresa es obligatorio.',
            'company.email.required_if' => 'El correo de la empresa es obligatorio.',
            'company.email.email' => 'El correo de la empresa debe ser válido.',
            'placement.staff_id.exists' => 'El personal no existe.',
            'placement.boss_name.required_if' => 'El nombre del personal es obligatorio.',
            'placement.boss_position.required_if' => 'El cargo del personal es obligatorio.',
            'placement.boss_email.required_if' => 'El correo del personal es obligatorio.',
            'placement.boss_email.email' => 'El correo del personal debe ser válido.',
            'placement.boss_phone.required_if' => 'El teléfono del personal es obligatorio.',
            'placement.position.required' => 'El cargo es obligatorio.',
            'placement.description.required' => 'La descripción es obligatoria.',
            'placement.start_date.required' => 'La fecha de inicio es obligatoria.',
            'placement.start_date.date' => 'La fecha de inicio debe ser una fecha válida.',
            'placement.end_date.required' => 'La fecha de fin es obligatoria.',
            'placement.end_date.date' => 'La fecha de fin debe ser una fecha válida.',
            'placement.end_date.after' => 'La fecha de fin debe ser posterior a la fecha de inicio.',
            'files.fut.required' => 'El FUT es obligatorio.',
            'files.fut.file' => 'El FUT debe ser un archivo.',
            'files.fut.mimes' => 'El FUT debe ser un archivo PDF.',
            'files.fut.max' => 'El FUT no debe superar los 2MB.',
            'files.carta_presentacion.required_if' => 'La carta de presentación es obligatoria.',
            'files.carta_presentacion.file' => 'La carta de presentación debe ser un archivo.',
            'files.carta_presentacion.mimes' => 'La carta de presentación debe ser un archivo PDF.',
            'files.carta_presentacion.max' => 'La carta de presentación no debe superar los 2MB.',
            'files.carta_aceptacion.required_if' => 'La carta de aceptación es obligatoria.',
            'files.carta_aceptacion.file' => 'La carta de aceptación debe ser un archivo.',
            'files.carta_aceptacion.mimes' => 'La carta de aceptación debe ser un archivo PDF.',
            'files.carta_aceptacion.max' => 'La carta de aceptación no debe superar los 2MB.',
        ];
    }
}
