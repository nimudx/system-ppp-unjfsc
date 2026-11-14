<?php

namespace App\Domains\Dossier\Http\Controllers;

use App\Domains\Documents\Models\Document;
use App\Domains\Documents\Models\DocumentType;
use App\Domains\Documents\Services\DocumentService;
use App\Domains\Identity\Models\Assignment;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Currículum vitae del estudiante.
 *
 * El CV es un documento del expediente (dossier) y se usa también en la
 * Bolsa laboral, por eso vive en una ruta propia y no bajo /internship.
 */
class CvController extends Controller
{
    public function __construct(private readonly DocumentService $documentService) {}

    /** Estudiante: currículum vigente (un único archivo). */
    public function cv(): Response
    {
        $assignment = Assignment::query()->findOrFail(session('assignment_id'));
        $document = $this->cvDocument($assignment);

        return Inertia::render('dossier/cv', [
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
    public function store(Request $request): RedirectResponse
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
}
