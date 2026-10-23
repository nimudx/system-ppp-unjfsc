<?php

namespace App\Domains\Company\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ActivateCompanyAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'representative_name' => 'required|string|max:255',
            'representative_phone' => ['required', 'string', 'regex:/^(?=(?:\D*\d){7,})[+0-9 ()-]{7,30}$/'],
            'password' => ['required', 'string', 'confirmed', Password::defaults(), 'max:255'],
            'terms_accepted' => ['required', 'accepted'],
        ];
    }
}
