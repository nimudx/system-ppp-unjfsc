<?php

namespace App\Http\Requests\Academic;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSchoolRequest extends FormRequest
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
                'unique:schools,name,'.$this->school->id,
            ],
            'faculty_id' => 'required|exists:faculties,id',
            'status' => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'The school name has already been taken.',
            'faculty_id.exists' => 'The selected faculty does not exist.',
        ];
    }
}
