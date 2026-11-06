<?php

namespace App\Domains\Internship\Http\Controllers;

use App\Domains\Company\Services\CompanyAcceptanceService;
use App\Domains\Documents\Models\Document;
use App\Domains\Documents\Models\DocumentType;
use App\Domains\Documents\Services\DocumentService;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Internship\Services\PlacementService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Documentos complementarios del estudiante: anexos 1-3 y currículum.
 */
class StudentDocumentController extends Controller
{
    public function __construct(
        private readonly PlacementService $placementService,
        private readonly DocumentService $documentService,
    ) {}

    /** Estudiante: anexos 1, 2 y 3 con historial. */
    public function annexes(): Response
    {
        $assignment = Assignment::query()->findOrFail(session('assignment_id'));
        $assignment->loadMissing('placement.documents.documentType');

        $data = $this->placementService->getSubmissionData($assignment);
        $data['requirements'] = $this->placementService->mapRequirements(
            $this->annexRequirements(),
            $assignment->placement?->documents ?? collect(),
        );

        $canUpload = $assignment->placement !== null
            && app(CompanyAcceptanceService::class)->canUploadDocuments($assignment);

        return Inertia::render('internship/annexes', [
            'data' => $data,
            'canUploadDocuments' => $canUpload,
        ]);
    }

    /** Estudiante: subir o reemplazar un anexo de la práctica. */
    public function storeAnnex(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|in:anexo_1,anexo_2,anexo_3',
            'file' => 'required|file|mimes:pdf|max:2048',
        ], [
            'code.in' => 'El anexo seleccionado no es válido.',
            'file.mimes' => 'El anexo debe ser un archivo PDF.',
            'file.max' => 'El anexo no debe superar los 2 MB.',
        ]);

        $assignment = Assignment::query()->findOrFail(session('assignment_id'));
        $placement = $assignment->placement;

        abort_unless($placement, 409, 'Primero registra los datos de tu práctica.');

        $this->placementService->updateDocument($placement, $assignment, [
            'code' => (string) $request->input('code'),
            'file' => $request->file('file'),
        ]);

        return back()->with('message', 'Anexo subido correctamente.');
    }

    /** Estudiante: currículum vigente (un único archivo). */
    public function cv(): Response
    {
        $assignment = Assignment::query()->findOrFail(session('assignment_id'));
        $document = $this->cvDocument($assignment);

        return Inertia::render('internship/cv', [
            'cv' => $document ? [
                'id' => $document->id,
                'name' => $document->name,
                'path' => $document->signedFileUrl(),
                'approval_status' => (int) $document->approval_status,
                'comment' => $document->comment,
                'created_at' => $document->created_at,
                'updated_at' => $document->updated_at,
            ] : null,
        ]);
    }

    /** Estudiante: agregar o reemplazar el currículum (sin historial). */
    public function storeCv(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ], [
            'file.required' => 'Selecciona tu CV antes de enviarlo.',
            'file.mimes' => 'El CV debe ser un archivo PDF, DOC o DOCX.',
            'file.max' => 'El CV no debe superar los 10 MB.',
        ]);

        $assignment = Assignment::query()->findOrFail(session('assignment_id'));
        $dossier = $assignment->dossiers()->firstOrCreate([
            'assignment_id' => $assignment->id,
        ]);
        $type = DocumentType::query()->where('code', 'cv')->firstOrFail();

        // El CV es único: se guarda el nuevo y luego se elimina el anterior.
        $previous = $dossier->documents()
            ->where('document_type_id', $type->id)
            ->get();

        $this->documentService->registerDocument([
            'file' => $request->file('file'),
            'context' => 'dossier',
            'target_id' => $dossier->id,
            'document_type_id' => $type->id,
            'comment' => '',
        ], $assignment, $dossier);

        foreach ($previous as $document) {
            Storage::disk(Document::DISK)->delete($document->path);
            $document->delete();
        }

        return back()->with('message', 'CV actualizado correctamente.');
    }

    private function cvDocument(Assignment $assignment): ?Document
    {
        $dossier = $assignment->dossiers()->firstOrCreate([
            'assignment_id' => $assignment->id,
        ]);

        return $dossier->documents()
            ->whereHas('documentType', fn ($query) => $query->where('code', 'cv'))
            ->with('documentType')
            ->latest('id')
            ->first();
    }

    /**
     * @return array<int, array{code: string, title: string}>
     */
    private function annexRequirements(): array
    {
        return [
            ['code' => 'anexo_1', 'title' => 'Anexo 1'],
            ['code' => 'anexo_2', 'title' => 'Anexo 2'],
            ['code' => 'anexo_3', 'title' => 'Anexo 3'],
        ];
    }
}
