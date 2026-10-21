<?php

namespace App\Http\Controllers\Academic\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Internship\SaveInternshipSettingRequest;
use App\Models\Assignment;
use App\Models\Faculty;
use App\Models\DocumentType;
use App\Services\Academic\InternshipSettingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class InternshipSettingController extends Controller
{
    public function __construct(
        protected InternshipSettingService $internshipSettingService
    ) {
    }

    public function index(Request $request): Response
    {
        $assignmentId = session('assignment_id');
        $assignment = Assignment::find($assignmentId);

        $faculties = Faculty::query()->forAssignmentContext($assignment, session('semester_id'))->get();

        $sectionId = $request->query('section_id');

        if ($assignment->role_id == 3) {
            $sectionId = $assignment->section_id;
        }

        $setting = null;
        if ($sectionId) {
            $setting = $this->internshipSettingService->getSettingForSection((int) $sectionId);
        }

        // Obtener documentos permitidos para estudiantes (Rol 5)
        $availableDocuments = DocumentType::whereHas('roles', function ($q) {
            $q->where('roles.id', 5);
        })->where('status', 1)->get(['id', 'name', 'code']);

        return Inertia::render('internship/settings/index', [
            'faculties' => $faculties,
            'setting' => $setting,
            'currentSectionId' => $sectionId ? (int) $sectionId : null,
            'availableDocuments' => $availableDocuments,
        ]);
    }

    public function update(SaveInternshipSettingRequest $request): RedirectResponse
    {
        $sectionId = $request->input('section_id');

        $this->internshipSettingService->saveSetting(
            $sectionId,
            $request->validated('workflow_schema')
        );

        return back()->with('message', 'Configuración de prácticas guardada correctamente.');
    }
}