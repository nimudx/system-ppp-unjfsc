<?php

namespace App\Domains\Internship\Http\Controllers;

use App\Domains\Academic\Models\Faculty;
use App\Domains\Documents\Http\Requests\UpdateDocumentStatusRequest;
use App\Domains\Documents\Models\Document;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use App\Domains\Internship\Http\Requests\StoreGradeInternshipRequest;
use App\Domains\Internship\Http\Requests\StoreInternshipRequest;
use App\Domains\Internship\Http\Requests\StoreRequestGradeChangeInternshipRequest;
use App\Domains\Internship\Http\Requests\StoreRequestTypeChangeInternshipRequest;
use App\Domains\Internship\Http\Requests\UploadDocumentInternshipRequest;
use App\Domains\Internship\Models\Internship;
use App\Domains\Internship\Services\InternshipService;
use App\Domains\Internship\Services\PlacementService;
use App\Domains\Requests\Models\UserRequest;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InternshipController extends Controller
{
    protected $internshipService;

    protected $placementService;

    public function __construct(InternshipService $internshipService, PlacementService $placementService)
    {
        $this->internshipService = $internshipService;
        $this->placementService = $placementService;
    }

    public function SubmissionIndex(Request $request): Response
    {
        $assignment = Assignment::query()->findOrFail(session('assignment_id'));

        $placement = $assignment->placement;

        // Si NO tiene placement O si tiene uno pero NO está totalmente validado (validation_status !== 1)
        if (! $placement || $placement->validation_status !== 1) {
            $data = $this->placementService->getSubmissionData($assignment);

            return Inertia::render('internship/submission/placementIndex', [
                'data' => $data,
            ]);
        }

        // Usamos el servicio
        $internshipData = $this->internshipService->getSubmissionData(
            $assignment,
            $request->query('step')
        );

        return Inertia::render('internship/submission/internshipIndex', [
            'data' => $internshipData,
        ]);
    }

    public function ValidationIndex(): Response
    {
        $semesterId = session('semester_id');
        $assignment = Assignment::query()->findOrFail(session('assignment_id'));

        $faculties = Faculty::query()->forAssignmentContext($assignment, $semesterId)->get();

        $raId = request('a');

        $assignments = [];

        if ($raId) {
            $assignments = Assignment::with(['user.person', 'section.school.faculty', 'placement', 'internship'])
                ->where('role_id', 5)
                ->where('id', $raId)
                ->get();
        } else {
            if ($assignment && in_array($assignment->role_id, [3, 4])) {
                $assignments = Assignment::with(['user.person', 'section.school.faculty', 'placement', 'internship'])
                    ->where('role_id', 5)
                    ->where('section_id', $assignment->section_id)
                    ->get();
            }
        }

        return Inertia::render('internship/validation/index', [
            'assignments' => $assignments,
            'faculties' => $faculties,
            'title' => 'Validación de Prácticas',
        ]);
    }

    public function getAssignmentsByFilter(Request $request): JsonResponse
    {
        $request->validate([
            'faculty_id' => 'nullable|integer',
            'school_id' => 'nullable|integer',
            'section_id' => 'nullable|integer',
            'search' => 'nullable|string',
        ]);

        $semesterId = session('semester_id');

        $query = Assignment::with(['user.person', 'section.school.faculty', 'placement', 'internship'])
            ->where('role_id', 5)
            ->where('semester_id', $semesterId);

        if ($request->filled('faculty_id')) {
            $query->whereHas('section.school.faculty', fn ($q) => $q->where('id', $request->faculty_id));
        }
        if ($request->filled('school_id')) {
            $query->whereHas('section.school', fn ($q) => $q->where('id', $request->school_id));
        }
        if ($request->filled('section_id')) {
            $query->where('section_id', $request->section_id);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->whereHas('user', function ($q) use ($s) {
                $q->where('email', 'like', "%{$s}%")
                    ->orWhere('name', 'like', "%{$s}%");
            });
        }

        return response()->json(['assignments' => $query->paginate(5)]);
    }

    public function getDetailPlacement(Assignment $assignment, Request $request): JsonResponse
    {
        $placement = $assignment->placement;

        // Caso 1: Aún en Formalización (Placement no validado al 100%)
        if (! $placement || $placement->validation_status !== 1) {
            $data = $this->placementService->getSubmissionData($assignment);

            return response()->json(array_merge([
                'phase' => 'placement',
                'assignment' => $assignment->load(['user.person', 'section.school.faculty']),
            ], $data));
        }

        // Caso 2: Ya en Seguimiento (Internship activo)
        $internshipData = $this->internshipService->getSubmissionData(
            $assignment,
            $request->query('step')
        );

        $pendingRequest = null;
        if ($assignment->internship) {
            $pendingRequest = UserRequest::query()
                ->where('requestable_id', $assignment->internship->id)
                ->where('requestable_type', (new Internship)->getMorphClass())
                ->where('type', 'CHANGE_INTERNSHIP_GRADE')
                ->where('approval_status', 2) // PENDING
                ->with('senderable')
                ->first();
        }

        return response()->json(array_merge([
            'phase' => 'internship',
            'assignment' => $assignment->load(['user.person', 'section.school.faculty']),
            'placement' => $assignment->placement,
            'pending_request' => $pendingRequest,
        ], $internshipData));
    }

    public function store(StoreInternshipRequest $request, Assignment $assignment): JsonResponse
    {
        $data = $request->validated();

        $internship = $this->internshipService->registerInternship($data, $assignment);

        return response()->json([
            'message' => 'Tipo de práctica seleccionado. Por favor, complete la Etapa 1.',
            'data' => $internship,
        ], 201);
    }

    /**
     * Store a document for an internship.
     *
     * @return JsonResponse
     */
    public function storeDocumentInternship(UploadDocumentInternshipRequest $request): RedirectResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $this->internshipService->uploadDocumentInternship($data, $assignment);

        return back()->with('message', 'Documento registrado correctamente.');
    }

    /**
     * Update the status of a document for an internship.
     *
     * @return JsonResponse
     */
    public function updateInternshipStatus(UpdateDocumentStatusRequest $request, Document $document): RedirectResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $document = $this->placementService->validatePlacementDocument($data, $document, $assignment);

        return back()->with('message', 'Estado del documento actualizado correctamente.');
    }

    /**
     * Store a grade for an internship.
     */
    public function storeGradeInternship(StoreGradeInternshipRequest $request, Internship $internship): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $internship = $this->internshipService->stepFiveInternship($data, $internship, $assignment);

        return response()->json([
            'message' => 'Calificación registrada correctamente.',
            'data' => $internship,
        ], 201);
    }

    public function updateGrade(Request $request, Internship $internship): RedirectResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validate([
            'grade' => 'required|numeric|min:0|max:20',
        ]);

        $this->internshipService->stepFiveInternship($data, $internship, $assignment);

        return back()->with('message', 'Calificación registrada correctamente.');
    }

    /**
     * Store a request for changing the type of an internship.
     */
    public function storeRequestTypeChangeInternship(StoreRequestTypeChangeInternshipRequest $request, Internship $internship): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $internship = $this->internshipService->requestTypeChange($data, $internship, $assignment);

        return response()->json([
            'message' => 'Solicitud de cambio de tipo registrada correctamente.',
            'data' => $internship,
        ], 201);
    }

    /**
     * Store a request for changing the grade of an internship.
     *
     * @return JsonResponse
     */
    public function storeRequestGradeChangeInternship(StoreRequestGradeChangeInternshipRequest $request, Internship $internship): RedirectResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $internship = $this->internshipService->requestGradeChange($data, $internship, $assignment);

        return back()->with('message', 'Solicitud de cambio de calificación registrada correctamente.');
    }

    public function settings(): Response
    {
        return Inertia::render('internship/settings/index');
    }
}
