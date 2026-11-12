<?php

namespace App\Domains\Internship\Http\Controllers;

use App\Domains\Company\Services\CompanyAcceptanceService;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Internship\Services\PlacementService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Anexos 1-3 de la práctica: documentos propios del proceso de pasantía.
 */
class StudentDocumentController extends Controller
{
    public function __construct(
        private readonly PlacementService $placementService,
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
