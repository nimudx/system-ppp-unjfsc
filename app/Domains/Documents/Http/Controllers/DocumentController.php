<?php

namespace App\Domains\Documents\Http\Controllers;

use App\Domains\Documents\Http\Requests\UpdateDocumentStatusRequest;
use App\Domains\Documents\Http\Requests\UploadDocumentRequest;
use App\Domains\Documents\Models\Document;
use App\Domains\Documents\Services\DocumentService;
use App\Domains\Dossier\Models\Dossier;
use App\Domains\Identity\Models\User;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    public function __construct(protected DocumentService $documentService) {}

    public function store(UploadDocumentRequest $request): JsonResponse
    {
        $user = Auth::user() ?? User::first();

        $document = $this->documentService->registerDocument(
            $request->validated(), $user
        );

        return response()->json([
            'message' => 'Document uploaded successfully',
            'data' => $document,
        ], 201);
    }

    public function updateStatus(UpdateDocumentStatusRequest $request, Document $document): JsonResponse
    {
        $updated = $this->documentService->updateStatus($document, $request->validated());

        $message = $updated ? 'Estado actualizado correctamente' : 'No se pudo actualizar el estado';

        if ($updated->documentable_type == (new Dossier)->getMorphClass()) {
            if ($updated->documentable->approval_status == 1) {
                $message = '¡Felicidades! Todos los documentos han sido aprobados. El Dossier y la Asignación han sido habilitados.';
            }
        }

        return response()->json([
            'message' => $message,
            'data' => $updated->load('documentable'),
        ], 200);
    }
}
