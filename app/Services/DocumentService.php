<?php

namespace App\Services;

use App\Exceptions\Document\DocumentInvalidContextException;
use App\Exceptions\Document\DocumentSizeLimitException;
use App\Exceptions\ResourceNotFoundException;
use App\Models\Assignment;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\Dossier;
use App\Models\Evaluation;
use App\Models\Internship;
use App\Models\Placement;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Storage;

class DocumentService
{
    protected array $contextMap = [
        'dossier' => Dossier::class,
        'evaluation' => Evaluation::class,
        'internship' => Internship::class,
        'placement' => Placement::class,
    ];

    /**
     * Register a new document.
     */
    public function registerDocument(array $data, Assignment $assignment, Model $model): Document
    {
        $maxSizeInBytes = 10 * 1024 * 1024;

        if (isset($data['file']) && $data['file']->getSize() > $maxSizeInBytes) {
            throw new DocumentSizeLimitException;
        }

        return DB::transaction(function () use ($data, $assignment, $model) {
            // $model = $this->validateOwnership($data['context'], $data['target_id'], $user);

            $filePath = $this->uploadPhysicalFile(
                $data['file'],
                $data['context'],
                $assignment->user->name,
                $data['document_type_id']
            );

            // añadir a $data el name : $data['file']->getClientOriginalName()
            $data['name'] = $data['file']->getClientOriginalName();

            return $this->saveToDatabase($model, $data, $filePath, $assignment);
        });
    }

    /**
     * Update the path of an existing document.
     */
    public function updatePathDocument(array $data, Assignment $assignment): Document
    {
        return DB::transaction(function () use ($data, $assignment) {
            $model = $this->validateOwnership($data['context'], $data['target_id'], $assignment);

            return $this->saveToDatabase($model, $data, $data['path'], $assignment);
        });
    }

    /**
     * Validate ownership of the target resource.
     */
    public function validateOwnership(string $context, int $targetId, Assignment $userAssignment): Model
    {
        if (! isset($this->contextMap[$context])) {
            throw new DocumentInvalidContextException;
        }

        // Implementation here
        $class = $this->contextMap[$context];
        $model = $class::find($targetId);

        if (! $model) {
            throw new ResourceNotFoundException;
        }

        /*$modelAssignmentId = $model->assignment_id ?? ($model->assignment->id ?? null);
         // Validamos: Si no es admin/subadmin (1,2) Y el ID no coincide, fuera.
         if (!in_array($userAssignment->role, [1, 2])) {
         if ($modelAssignmentId !== $userAssignment->id) {
         throw new AssignmentNotAllowedException();
         }
         }*/

        return $model;
    }

    /**
     * Upload a physical file to the storage.
     *
     * @param  string  $context
     * @param  string  $identifier
     * @param  int  $typeId
     */
    private function uploadPhysicalFile($file, $context, $identifier, $typeId): string
    {
        $semester = '2026-1'; // Semester temporal
        $typeDocument = DocumentType::query()->where('id', $typeId)->firstOrFail();

        $folder = "{$context}s/{$semester}/{$identifier}/{$typeDocument->code}";
        $filename = "type_{$typeDocument->code}_".time().".{$file->extension()}";

        return $file->storeAs($folder, $filename, 'public');
    }

    /**
     * Save the document to the database.
     *
     * @param  Dossier|Model  $model
     * @param  array  $data
     * @param  string  $path
     * @param  Assignment  $assignment
     */
    private function saveToDatabase($model, $data, $path, $assignment): Document
    {
        if (! $assignment) {
            abort(403, 'You are not authorized to perform this action. WAAA');
        }

        return $model->documents()->create([
            'document_type_id' => $data['document_type_id'],
            'path' => $path,
            'name' => $data['name'], // $data['file']->getClientOriginalName(),
            'uploaded_by' => $assignment->id,
            'approval_status' => 2,
            'comment' => $data['comment'] ?? '',
        ]);
    }

    /**
     * Update the status of a document.
     */
    public function updateStatus(Document $document, array $data): Document
    {
        $document->update($data);

        if ((int) ($data['approval_status'] ?? 0) === 1) {
            $this->handlePostApprovalLogic($document);
        }

        return $document;
    }

    public function removerDocument(Document $document): void
    {
        // remove phisical file
        Storage::disk('public')->delete($document->path);
        // remove document from database
        $document->delete();
    }

    private function handlePostApprovalLogic(Document $document): void
    {
        if ($document->documentable_type === Dossier::class) {
            $this->handleDossierCompletion($document->documentable);
        }

        /*if ($document->documentable_type === Evaluation::class) {
         // Lazy loading del service para evitar recursión infinita en el constructor
         app(\App\Services\SupervisionService::class)->processEvaluationProgress($document->documentable);
         }*/
    }

    /**
     * Handle the completion of a dossier.
     */
    private function handleDossierCompletion(Dossier $dossier): void
    {
        $roleId = $dossier->assignment->role_id;
        $required = match ((int) $roleId) {
            3 => 2,
            4 => 3,
            5 => 2,
            default => 99, // A value that is not possible to reach
        };
        $approvedCount = $dossier->documents()->where('approval_status', 1)->count();

        if ($approvedCount >= $required) {
            // 1. Update Dossier Approval Status
            $dossier->update(['approval_status' => 1]);

            // 2. Update Assignment Approval Status
            $dossier->assignment()->update([
                'approval_status' => 1,
                'access_status' => 1,
            ]);
        }
    }
}
