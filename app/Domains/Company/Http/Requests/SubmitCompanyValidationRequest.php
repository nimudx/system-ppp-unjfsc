<?php

namespace App\Domains\Company\Http\Requests;

use App\Domains\Company\Models\Company;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SubmitCompanyValidationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['ruc' => trim((string) $this->input('ruc'))]);
        if ($this->has('email')) {
            $this->merge(['email' => Str::lower(trim((string) $this->input('email')))]);
        }
    }

    public function rules(): array
    {
        $new = ! Company::where('ruc', $this->input('ruc'))->exists();

        return [
            'ruc' => ['required', 'string', 'regex:/^[0-9]{11}$/'],
            'name' => [Rule::requiredIf($new), 'string', 'max:255'],
            'razon' => ['nullable', 'string', 'max:255'],
            'address' => [Rule::requiredIf($new), 'string', 'max:255'],
            'phone' => [Rule::requiredIf($new), 'string', 'max:30'],
            'email' => [Rule::requiredIf($new), 'email', 'max:255'],
            'declaration_accepted' => ['required', 'accepted'],
            'ruc_document' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
        ];
    }
}
