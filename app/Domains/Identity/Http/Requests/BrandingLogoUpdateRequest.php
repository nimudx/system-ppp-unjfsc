<?php

namespace App\Domains\Identity\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BrandingLogoUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * SVG no se acepta: puede llevar scripts incrustados.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'logo' => ['required', 'file', 'mimes:png,jpg,jpeg,webp', 'mimetypes:image/png,image/jpeg,image/webp', 'max:2048', 'dimensions:min_width=32,min_height=32,max_width=4000,max_height=4000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'logo.required' => 'Selecciona una imagen.',
            'logo.mimes' => 'El logo debe ser PNG, JPG o WebP.',
            'logo.mimetypes' => 'El logo debe ser PNG, JPG o WebP.',
            'logo.max' => 'El logo no puede pesar más de 2 MB.',
            'logo.dimensions' => 'El logo debe medir entre 32 y 4000 píxeles por lado.',
        ];
    }
}
