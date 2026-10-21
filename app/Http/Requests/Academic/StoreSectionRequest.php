<?php

namespace App\Http\Requests\Academic;

use Illuminate\Foundation\Http\FormRequest;

class StoreSectionRequest extends FormRequest
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
        $school = $this->route('school');
        $semesterId = session('semester_id');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                \Illuminate\Validation\Rule::unique('sections')->where(function ($query) use ($school, $semesterId) {
                    return $query->where('school_id', $school->id)
                        ->where('semester_id', $semesterId);
                }),
            ],
        ];
    }
}
