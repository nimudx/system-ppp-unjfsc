<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Supervision\StoreEvaluationRequest;
use App\Http\Requests\Supervision\UpdateEvaluationStatusRequest;
use App\Models\Assignment;
use App\Models\Faculty;
use App\Models\InternshipGroup;
use App\Models\Supervision;
use App\Models\Evaluation;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Services\Academic\SupervisionService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class SupervisionController extends Controller
{
    protected $supervisionService;

    public function __construct(SupervisionService $supervisionService)
    {
        $this->supervisionService = $supervisionService;
    }

    public function submissionIndex(): Response
    {
        $assignment = Assignment::query()->find(session('assignment_id'));
        $role = $assignment?->role_id;

        $raId = request('a');
        $rmId = request('m');

        $faculties = Faculty::query()->forAssignmentContext($assignment, session('semester_id'))->get();

        $students = [];
        $groups = [];
        if (in_array($role, [3, 4]) && $assignment) {
            $groups = $this->supervisionService->getGroupsByFilter([
                'section_id' => $assignment->section_id,
            ], session('semester_id'));
        }

        if ($raId && $rmId) {
            $rsa = Assignment::query()->find($raId);
            $students = Supervision::query()->where('assignment_id', $rsa->id)
                ->where('module_id', $rmId)
                ->get()
                ->map(function ($supervision) use ($rsa) {
                    return [
                        'id' => $supervision->id,
                        'user' => [
                            'email' => $rsa->user->email,
                            'person' => [
                                'names' => $rsa->user->person->names,
                                'surnames' => $rsa->user->person->surnames,
                            ],
                        ],
                        'section' => [
                            'name' => $rsa->section->name,
                            'school' => [
                                'name' => $rsa->section->school->name,
                                'faculty' => ['name' => $rsa->section->school->faculty->name],
                            ],
                        ],
                        'supervision' => [
                            'id' => $supervision->id,
                            'module_id' => $supervision->module_id,
                            'approval_status' => $supervision->approval_status,
                        ],
                    ];
                });
        }

        return Inertia::render('academic/supervision/submission/index', [
            'faculties' => $faculties,
            'groups' => $groups,
            'students' => $students,
            'role' => $role
        ]);
    }

    public function validationIndex(): Response
    {
        $assignment = Assignment::query()->find(session('assignment_id'));
        $role = $assignment->role_id;

        $raId = request('a');
        $rmId = request('m');

        $faculties = Faculty::query()->forAssignmentContext($assignment, session('semester_id'))->get();

        $students = [];
        $groups = [];
        if (in_array($role, [3]) && $assignment) {
            $groups = $this->supervisionService->getGroupsByFilter([
                'section_id' => $assignment->section_id,
            ], session('semester_id'));
        }

        if ($raId && $rmId) {
            $rsa = Assignment::query()->find($raId);
            $students = Supervision::query()->where('assignment_id', $rsa->id)
                ->where('module_id', $rmId)
                ->get()
                ->map(function ($supervision) use ($rsa) {
                    return [
                        'id' => $supervision->id,
                        'user' => [
                            'email' => $rsa->user->email,
                            'person' => [
                                'names' => $rsa->user->person->names,
                                'surnames' => $rsa->user->person->surnames,
                            ],
                        ],
                        'section' => [
                            'name' => $rsa->section->name,
                            'school' => [
                                'name' => $rsa->section->school->name,
                                'faculty' => ['name' => $rsa->section->school->faculty->name],
                            ],
                        ],
                        'supervision' => [
                            'id' => $supervision->id,
                            'module_id' => $supervision->module_id,
                            'approval_status' => $supervision->approval_status,
                        ],
                    ];
                });
        }

        return Inertia::render('academic/supervision/validation/index', [
            'faculties' => $faculties,
            'groups' => $groups,
            'students' => $students,
        ]);
    }

    /**
     * API: Returns internship groups filtered by academic structure.
     * Params: faculty_id, school_id (optional), section_id (optional)
     */
    public function getGroupsByFilter(Request $request): JsonResponse
    {
        $request->validate([
            'faculty_id' => 'required|integer|exists:faculties,id',
            'school_id' => 'nullable|integer|exists:schools,id',
            'section_id' => 'nullable|integer|exists:sections,id',
            'search' => 'nullable|string',
        ]);

        $semesterId = session('semester_id');

        $groups = $this->supervisionService->getGroupsByFilter($request->all(), $semesterId);

        return response()->json(['groups' => $groups]);
    }

    /**
     * API: Returns students of a group with their supervision status for a given module (Paginated).
     * GET /supervision/api/groups/{group}/students/filter
     */
    public function getStudentsByFilter(InternshipGroup $group, Request $request): JsonResponse
    {
        $request->validate([
            'module_id' => 'required|integer|min:1|max:4',
        ]);

        $assignment = Assignment::query()->find(session('assignment_id'));
        $paginate = $assignment && in_array($assignment->role_id, [1, 2]);

        $students = $this->supervisionService->getStudentsByFilter(
            $group,
            (int) $request->module_id,
            $paginate
        );

        return response()->json(['students' => $students]);
    }

    /**
     * API: Global student search by user code.
     * GET /supervision/api/students/search?code=xxx
     */
    public function searchStudents(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|min:2',
        ]);

        $students = $this->supervisionService->searchStudentsGlobal($request->code);

        return response()->json(['students' => $students]);
    }

    /**
     * API: Returns the Anexo 7 & Anexo 8 for a given supervision with evaluation history.
     * GET /supervision/api/supervisions/{supervision}/annexes
     */
    public function getSupervisionAnnexes(Assignment $assignment, Request $request): JsonResponse
    {
        $moduleId = (int) $request->query('module_id');
        $annexes = $this->supervisionService->getSupervisionAnnexes($assignment, $moduleId);

        return response()->json(['annexes' => $annexes]);
    }

    public function storeEvaluation(StoreEvaluationRequest $request, Assignment $assignment): RedirectResponse
    {
        $reviewerAssignment = Assignment::find(session('assignment_id'));

        $data = $request->validated();

        $supervision = Supervision::firstOrCreate([
            'assignment_id' => $assignment->id,
            'module_id' => $data['module_id'],
        ]);

        $this->supervisionService->registerEvaluation($data, $reviewerAssignment, $supervision);

        return back()->with([
            'message' => 'Evaluación registrada correctamente.',
        ]);
    }

    public function updateEvaluationStatus(UpdateEvaluationStatusRequest $request, Evaluation $evaluation): RedirectResponse
    {
        $assignmentId = session('assignment_id');
        $assignment = Assignment::find($assignmentId);

        $data = $request->validated();
        $this->supervisionService->updateEvaluationStatus($evaluation, $data, $assignment);

        return back()->with([
            'message' => 'Evaluación actualizada correctamente.',
        ]);
    }

    public function studentIndex(): Response
    {
        return Inertia::render('academic/supervision/student/index', []);
    }
}
