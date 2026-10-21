<?php

namespace App\Http\Requests\Internship;

use Illuminate\Foundation\Http\FormRequest;

class UploadDocumentInternshipRequest extends FormRequest
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
            'file' => 'required|file|mimes:pdf,doc,docx|max:10240', // Maximum file size is 10MB
            'code' => 'required|exists:document_types,code|string',
            'target_id' => 'required|integer',
            // 'context' => 'required|in:dossier,internship,resource',
        ];
    }
}
