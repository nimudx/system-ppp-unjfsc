<?php

namespace App\Http\Controllers;

use App\Http\Requests\Document\UpdateDocumentStatusRequest;
use App\Http\Requests\Document\UploadDocumentRequest;
use App\Models\Document;
use App\Models\Dossier;
use App\Models\User;
use App\Services\DocumentService;
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

        if ($updated->documentable_type == Dossier::class) {
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
