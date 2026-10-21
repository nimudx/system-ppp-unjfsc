<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class StepThreeRequest extends FormRequest
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
        /*
         "email": "usuario@example.com",
         "role_id": 2,
         "section_id": 5,
         "user_id": null,
         "person": {
         "id": null,
         "dni": "12345678",
         "names": "Juan Angel",
         "surnames": "Perez Gonzales"
         } */
        return [
            'email' => 'required|email|unique:users,email,'.$this->user_id,
            'role_id' => 'required|exists:roles,id',
            'section_id' => 'required|exists:sections,id',
            'user_id' => 'nullable|exists:users,id',
            'type_user_id' => 'nullable|exists:type_users,id',
            'person.id' => 'nullable|exists:people,id',
            'person.dni' => [
                'required_if:user_id,null',
                'string',
                'digits:8',
                'unique:people,dni,'.($this->input('person.id') ?? 'NULL').',id',
            ],
            'person.names' => 'required_if:user_id,null|string|max:100',
            'person.surnames' => 'required_if:user_id,null|string|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El email debe ser un email valido.',
            'email.unique' => 'El email ya esta registrado.',
            'role_id.required' => 'El rol es obligatorio.',
            'role_id.exists' => 'El rol no existe.',
            'section_id.required' => 'La seccion es obligatoria.',
            'section_id.exists' => 'La seccion no existe.',
            'user_id.exists' => 'El usuario no existe.',
            'type_user_id.exists' => 'El tipo de usuario no existe.',
            'person.id.exists' => 'La persona no existe.',
            'person.dni.required_if' => 'El DNI es obligatorio.',
            'person.dni.string' => 'El DNI debe ser un string.',
            'person.dni.digits' => 'El DNI debe tener 8 digitos.',
            'person.dni.unique' => 'El DNI ya esta registrado.',
            'person.names.required_if' => 'El nombre es obligatorio.',
            'person.names.string' => 'El nombre debe ser un string.',
            'person.names.max' => 'El nombre debe tener maximo 100 caracteres.',
            'person.surnames.required_if' => 'El apellido es obligatorio.',
            'person.surnames.string' => 'El apellido debe ser un string.',
            'person.surnames.max' => 'El apellido debe tener maximo 100 caracteres.',
        ];
    }
}
