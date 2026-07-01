<?php

namespace App\Http\Controllers;

use App\Http\Requests\Assignment\StoreAssignmentManageRequest;
use App\Models\Assignment;
use App\Models\Faculty;
use App\Services\AssignmentService;
use App\Services\UserAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Models\UserRequest;
use Inertia\Inertia;
use Inertia\Response;

class UserAssignmentController extends Controller
{
    public function __construct(protected UserAssignmentService $assignmentService)
    {
    }

    /**
     * Listar Sub-Administradores (Role 2)
     */
    public function listSubAdmins(Request $request): Response
    {
        return $this->renderList($request, 2, 'Sub-Administradores');
    }

    /**
     * Listar Docentes Titulares (Role 3)
     */
    public function listTeachers(Request $request): Response
    {
        return $this->renderList($request, 3, 'Docentes Titulares');
    }

    /**
     * Listar Docentes Supervisores (Role 4)
     */
    public function listSupervisors(Request $request): Response
    {
        return $this->renderList($request, 4, 'Docentes Supervisores');
    }

    /**
     * Listar Estudiantes (Role 5)
     */
    public function listStudents(Request $request): Response
    {
        return $this->renderList($request, 5, 'Estudiantes');
    }

    /**
     * Método centralizado para renderizar la lista por rol.
     */
    private function renderList(Request $request, int $roleId, string $title): Response
    {
        $semesterId = session('semester_id');
        $assignment = Assignment::find(session('assignment_id'));

        // Lógica Híbrida:
        // Admin/Subadmin (1, 2) o Estudiantes (5) -> Cargamos data inicial (Server-side paginated)
        // Docentes/Supervisores (3, 4) -> Cargamos data de su sección (Local-side)
        if ($assignment && in_array($assignment->role_id, [3, 4])) {
            $assignments = $this->assignmentService->getAssignmentsByRole($roleId, $semesterId, ['section_id' => $assignment->section_id], false);
        } else {
            $assignments = $this->assignmentService->getAssignmentsByRole($roleId, $semesterId, [], true);
        }

        $faculties = Faculty::query()->forAssignmentContext($assignment, $semesterId)->get();

        return Inertia::render('academic/user/management/index', [
            'assignments' => $assignments,
            'faculties' => $faculties,
            'roleId' => $roleId,
            'title' => $title,
        ]);
    }

    /**
     * Endpoint API para filtrado de usuarios (Estilo Dossier).
     */
    public function getAssignmentsByFilter(Request $request): JsonResponse
    {
        $semesterId = session('semester_id');
        $roleId = $request->input('target_role_id');
        $filters = $request->only(['faculty_id', 'school_id', 'section_id', 'search']);

        $assignments = $this->assignmentService->getAssignmentsByRole($roleId, $semesterId, $filters, true);

        return response()->json(['assignments' => $assignments]);
    }

    public function storeAssignmentManage(StoreAssignmentManageRequest $request, Assignment $assignment, AssignmentService $assignmentService): RedirectResponse
    {
        $assignmentId = session('assignment_id');

        $sender = Assignment::query()->findOrFail($assignmentId);

        $data = $request->validated();

        $assignmentService->requestAssignmentManage($data, $assignment, $sender);

        return back()->with('message', 'Solicitud generada y enviada correctamente.');
    }

    /**
     * API: Obtener la solicitud pendiente para una asignación.
     */
    public function getAssignmentRequest(Assignment $assignment): JsonResponse
    {
        $request = UserRequest::query()
            ->where('requestable_id', $assignment->id)
            ->where('requestable_type', Assignment::class)
            ->where('approval_status', 2) // PENDING
            ->latest()
            ->first();

        return response()->json(['data' => $request]);
    }

    /**
     * API: Actualizar el estado de una solicitud de asignación.
     */
    public function updateAssignmentRequestStatus(Request $httpRequest, UserRequest $userRequest, AssignmentService $assignmentService): RedirectResponse
    {
        $assignmentId = session('assignment_id');
        $reviewer = Assignment::query()->findOrFail($assignmentId);

        $data = $httpRequest->validate([
            'approval_status' => 'required|in:1,3',
            'justification' => 'nullable|string'
        ]);

        $assignmentService->updateAssignmentRequestStatus($data, $userRequest, $reviewer);

        return back()->with('message', 'Solicitud procesada correctamente.');
    }
}