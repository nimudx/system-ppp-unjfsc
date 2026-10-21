<?php

namespace App\Http\Requests\Academic;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSectionRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:sections,name,'.$this->route('section').',id',
            ],
            'faculty_id' => [
                'required',
                'integer',
                'exists:faculties,id',
            ],
            'school_id' => [
                'required',
                'integer',
                'exists:schools,id',
                'foreign:faculty_id,faculties,id',
            ],
            'status' => 'required|boolean',
        ];
    }
}
