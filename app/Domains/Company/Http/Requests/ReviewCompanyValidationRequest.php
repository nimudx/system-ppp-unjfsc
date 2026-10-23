<?php

namespace App\Domains\Company\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewCompanyValidationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return ['decision' => 'required|in:approve,observe,reject', 'comment' => 'nullable|required_if:decision,observe,reject|string|max:2000'];
    }
}
