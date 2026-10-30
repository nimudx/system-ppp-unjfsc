<?php

namespace App\Domains\Dossier\Http\Requests;

use App\Domains\Dossier\Services\AcademicDocumentVerifier;
use App\Domains\Identity\Models\Assignment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UploadDocumentDossierRequest extends FormRequest
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
            'file' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'code' => 'required|exists:document_types,code',
            'target_id' => 'required|integer',
        ];
    }

    /**
     * Verifica que la Ficha de Matrícula o el Récord Académico del estudiante sean correctos antes de guardarlos.
     *
     * @return array<int, \Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $verifier = app(AcademicDocumentVerifier::class);
                $assignment = Assignment::query()->find(session('assignment_id'));

                if (! $verifier->applies((string) $this->input('code'), $assignment)) {
                    return;
                }

                $problem = $verifier->verify($this->file('file'), (string) $this->input('code'), $assignment);

                if ($problem) {
                    $validator->errors()->add('file', $problem);
                }
            },
        ];
    }
}
