<?php

namespace App\Domains\Identity\Http\Requests;

use App\Domains\Company\Models\Company;
use App\Domains\Identity\Models\Person;
use Illuminate\Foundation\Http\FormRequest;

class ProfileDetailsUpdateRequest extends FormRequest
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
        $authenticable = $this->user()->authenticable;

        if ($authenticable instanceof Person) {
            return [
                'names' => 'required|string|max:255',
                'surnames' => 'required|string|max:255',
                'phone' => 'required|string|max:255',
                'gender' => 'nullable|string|in:male,female',
            ];
        }

        if ($authenticable instanceof Company) {
            return [
                'razon' => 'required|string|max:255',
                'name' => 'required|string|max:255',
                'phone' => 'required|string|max:255',
                'address' => 'required|string|max:255',
                'website' => 'nullable|string|max:255',
            ];
        }
    }
}
