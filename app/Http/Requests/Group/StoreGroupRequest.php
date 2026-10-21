<?php

namespace App\Http\Requests\Group;

use Illuminate\Foundation\Http\FormRequest;

class StoreGroupRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'teacher_assignment_id' => 'required|exists:assignments,id',
            'supervisor_assignment_id' => 'required|exists:assignments,id',
            'section_id' => 'required|exists:sections,id',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:assignments,id',
        ];
    }
}
