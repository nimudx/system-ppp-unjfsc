<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class ProfileMediaUpdateRequest extends FormRequest
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
            'photo' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    if ($value === 'deleted') {
                        return;
                    }

                    if (! ($value instanceof UploadedFile)) {
                        $fail('La foto debe ser una imagen válida o la instrucción de eliminación.');

                        return;
                    }

                    if ($value->getSize() > 2048 * 1024) {
                        $fail('La foto no debe pesar más de 2MB.');
                    }
                },
            ],
            'banner' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    if ($value === 'deleted') {
                        return;
                    }

                    if (! ($value instanceof UploadedFile)) {
                        $fail('El fondo debe ser una imagen válida o la instrucción de eliminación.');

                        return;
                    }

                    if ($value->getSize() > 2048 * 1024) {
                        $fail('El fondo no debe pesar más de 2MB.');
                    }
                },
            ],
        ];
    }
}
