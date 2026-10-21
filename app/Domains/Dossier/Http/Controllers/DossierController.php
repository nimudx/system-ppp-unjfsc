<?php

namespace App\Domains\Dossier\Http\Controllers;

use App\Domains\Academic\Models\Faculty;
use App\Domains\Documents\Http\Requests\UpdateDocumentStatusRequest;
use App\Domains\Documents\Models\Document;
use App\Domains\Dossier\Http\Requests\UploadDocumentDossierRequest;
use App\Domains\Dossier\Models\Dossier;
use App\Domains\Dossier\Services\DossierService;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DossierController extends Controller
{
    protected DossierService $dossierService;

    public function __construct(DossierService $dossierService)
    {
        $this->dossierService = $dossierService;
    }

    /**
     * Store a document for a dossier.
     *
     * @return JsonResponse
     */
    public function storeDocumentDossier(UploadDocumentDossierRequest $request): RedirectResponse
    {
        $assignmentId = session('assignment_id');
        $assignment = Assignment::query()->find($assignmentId);

        $data = $request->validated();

        $this->dossierService->storeDocumentDossier($data, $assignment);

        return back()->with('message', 'Documento del dossier registrado correctamente.');
    }

    /**
     * Update the status of a document for a dossier.
     *
     * @return JsonResponse
     */
    public function updateDossierStatus(UpdateDocumentStatusRequest $request, Document $document): RedirectResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $document = $this->dossierService->updateDossierStatus($data, $document, $assignment);

        return back()->with('message', 'Estado del documento del dossier actualizado correctamente.');
    }

    /**
     * Render the view for the user's submission.
     */
    public function SubmissionIndex(): Response
    {
        $assignmentId = session('assignment_id');
        $assignment = Assignment::with(['role'])->findOrFail($assignmentId);

        $requirements = $this->dossierService->getDossierData($assignment);

        return Inertia::render('dossier/submission/index', [
            'assignment' => $assignment,
            'requirements' => $requirements,
            'dossier' => $assignment->dossiers->first()?->id,
        ]);
    }

    public function TeacherDossierIndex(): Response
    {
        return $this->renderValidationView(3, 'Validación de Docentes Titulares');
    }

    public function SupervisorDossierIndex(): Response
    {
        return $this->renderValidationView(4, 'Validación de Supervisores');
    }

    public function StudentDossierIndex(): Response
    {
        return $this->renderValidationView(5, 'Validación de Estudiantes');
    }

    /**
     * Helper para renderizar la vista de validación con los filtros correctos.
     */
    private function renderValidationView(int $roleId, string $title): Response
    {
        $semesterId = session('semester_id');
        $currentAssignmentId = session('assignment_id');
        $assignment = Assignment::query()->find($currentAssignmentId);

        $raId = request('a') ? (int) request('a') : null;
        $assignments = $this->dossierService->initDataValidation($raId, $roleId, $assignment, $semesterId);

        $faculties = Faculty::query()->forAssignmentContext($assignment, $semesterId)->get();

        return Inertia::render('dossier/validation/index', [
            'assignments' => $assignments,
            'title' => $title,
            'faculties' => $faculties,
            'target_role_id' => $roleId,
        ]);
    }

    public function getAssignmentsByFilter(Request $request): JsonResponse
    {
        $request->validate([
            'target_role_id' => 'required|integer',
            'faculty_id' => 'nullable|integer',
            'school_id' => 'nullable|integer',
            'section_id' => 'nullable|integer',
            'search' => 'nullable|string',
        ]);

        $semesterId = session('semester_id');
        $data = $this->dossierService->getAssignments($request->all(), $semesterId);

        return response()->json(['assignments' => $data]);
    }

    public function getDetailDossier(Assignment $assignment): JsonResponse
    {
        // Cargar las relaciones necesarias para el frontend
        $assignment->load(['user.person', 'section.school.faculty', 'section.faculty']);

        // Usamos el servicio exacto que ya da la estructura con history, latest, etc.
        $requirements = $this->dossierService->getDossierData($assignment);

        return response()->json([
            'assignment' => $assignment,
            'requirements' => $requirements,
            'dossier' => $assignment->dossiers->first()?->id,
        ]);
    }

    /**
     * Render the detailed view for validating a specific dossier.
     */
    public function showValidation(Dossier $dossier): Response
    {
        $dossier->load(['assignment.user', 'assignment.role', 'documents.type']);

        return Inertia::render('dossier/validation/details', [
            'dossier' => $dossier,
        ]);
    }
}
