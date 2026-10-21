<?php

namespace App\Domains\Internship\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGradeInternshipRequest extends FormRequest
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
            'grade' => ['required', 'numeric', 'between:0,20'],
        ];
    }
}
