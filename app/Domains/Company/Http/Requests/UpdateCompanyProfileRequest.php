<?php

namespace App\Domains\Company\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->type_user_id === 3;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'razon' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'representative_name' => ['required', 'string', 'max:255'],
            'representative_phone' => ['required', 'string', 'max:30'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'remove_photo' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'razon.required' => 'La razón social es obligatoria.',
            'name.required' => 'El nombre comercial es obligatorio.',
            'phone.required' => 'El teléfono de la empresa es obligatorio.',
            'address.required' => 'La dirección legal es obligatoria.',
            'representative_name.required' => 'El nombre del representante es obligatorio.',
            'representative_phone.required' => 'El teléfono del representante es obligatorio.',
            'photo.image' => 'El logo debe ser una imagen válida.',
            'photo.max' => 'El logo no debe pesar más de 2 MB.',
        ];
    }
}
