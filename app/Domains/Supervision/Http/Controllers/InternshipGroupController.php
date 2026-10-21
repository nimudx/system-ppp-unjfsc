<?php

namespace App\Domains\Supervision\Http\Controllers;

use App\Domains\Academic\Models\Faculty;
use App\Domains\Academic\Models\Section;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Supervision\Http\Requests\AttachStudentsRequest;
use App\Domains\Supervision\Http\Requests\DetachStudentsRequest;
use App\Domains\Supervision\Http\Requests\MoveStudentsRequest;
use App\Domains\Supervision\Http\Requests\StoreGroupRequest;
use App\Domains\Supervision\Http\Requests\UpdateGroupRequest;
use App\Domains\Supervision\Models\InternshipGroup;
use App\Domains\Supervision\Services\InternshipGroupService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InternshipGroupController extends Controller
{
    protected InternshipGroupService $groupService;

    public function __construct(InternshipGroupService $groupService)
    {
        $this->groupService = $groupService;
    }

    /**
     * Display a listing of internship groups (By Practice).
     * - Roles 1/2 (Admin): empty state, load via API filter
     * - Roles 3/4 (Docente/Supervisor): their section's groups pre-loaded
     */
    public function indexByInternship(): Response
    {
        $currentAssignmentId = session('assignment_id');
        $currentAssignment = Assignment::query()->find($currentAssignmentId);

        $groups = [];
        if ($currentAssignment && in_array($currentAssignment->role_id, [3, 4])) {
            $groups = $this->groupService->getInternshipGroupsBySection($currentAssignment->section_id);
        }

        $faculties = Faculty::query()->forAssignmentContext($currentAssignment, session('semester_id'))->get();

        return Inertia::render('supervision/groups/internship/index', [
            'groups' => $groups,
            'faculties' => $faculties,
        ]);
    }

    public function getDependencies(Section $section): JsonResponse
    {
        return response()->json($this->groupService->getSectionDependencies($section));
    }

    /**
     * API: Filter/search internship groups for Admin roles.
     */
    public function getGroupsByFilter(Request $request): JsonResponse
    {
        $request->validate([
            'faculty_id' => 'nullable|integer',
            'school_id' => 'nullable|integer',
            'section_id' => 'nullable|integer',
            'search' => 'nullable|string',
        ]);

        $semesterId = session('semester_id');

        $query = InternshipGroup::with([
            'section.school.faculty',
            'teacher.user.person',
            'supervisor.user.person',
            'module',
        ]);

        if ($semesterId) {
            $query->whereHas('section', function ($q) use ($semesterId) {
                $q->where('semester_id', $semesterId);
            });
        }

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
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhereHas('teacher.user', fn ($q2) => $q2->where('email', 'like', "%{$s}%")->orWhere('name', 'like', "%{$s}%"))
                    ->orWhereHas('supervisor.user', fn ($q2) => $q2->where('email', 'like', "%{$s}%")->orWhere('name', 'like', "%{$s}%"));
            });
        }

        // Transformamos cada grupo con el mismo mapper del service
        // para garantizar la misma estructura que reciben los roles 3/4
        $paginator = $query->paginate(15);
        $paginator->getCollection()->transform(
            fn ($group) => $this->groupService->formatGroupData($group)
        );

        return response()->json(['groups' => $paginator]);
    }

    /**
     * Display a listing of students and their groups (By Student).
     * - Roles 1/2: empty state, load via filter
     * - Roles 3/4: their section pre-loaded
     */
    public function indexByStudent(): Response
    {
        $currentAssignmentId = session('assignment_id');
        $currentAssignment = Assignment::query()->find($currentAssignmentId);

        $groups = [];
        $students = [];

        if ($currentAssignment && in_array($currentAssignment->role_id, [3, 4])) {
            $groups = $this->groupService->getInternshipGroupsBySection($currentAssignment->section_id);
            $students = $this->groupService->getStudentsAndGroupsBySection($currentAssignment->section_id);
        }

        $faculties = Faculty::query()->forAssignmentContext($currentAssignment, session('semester_id'))->get();

        return Inertia::render('supervision/groups/student/index', [
            'groups' => $groups,
            'students' => $students,
            'faculties' => $faculties,
        ]);
    }

    /**
     * API: Filter/search students by academic location for Admin roles.
     */
    public function getStudentsByFilter(Request $request): JsonResponse
    {
        $request->validate([
            'faculty_id' => 'nullable|integer',
            'school_id' => 'nullable|integer',
            'section_id' => 'nullable|integer',
            'search' => 'nullable|string',
        ]);

        $semesterId = session('semester_id');

        $query = Assignment::with(['user.person', 'internshipGroup.module', 'section.school.faculty'])
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
            $query->whereHas('user', fn ($q) => $q->where('email', 'like', "%{$s}%")->orWhere('name', 'like', "%{$s}%"));
        }

        return response()->json(['students' => $query->paginate(15)]);
    }

    public function getStudents(Section $section): JsonResponse
    {
        return response()->json([
            'students' => $this->groupService->getAvailableStudents($section, session('semester_id')),
        ]);
    }

    public function getGroupStudents(InternshipGroup $group): JsonResponse
    {
        return response()->json([
            'students' => $this->groupService->getGroupStudents($group),
        ]);
    }

    public function store(StoreGroupRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $this->groupService->createGroup($data);

        return back()->with([
            'message' => 'Grupo creado correctamente.',
        ]);
    }

    public function update(UpdateGroupRequest $request, InternshipGroup $group): RedirectResponse
    {
        $data = $request->validated();
        $this->groupService->updateGroup($group->id, $data);

        return back()->with([
            'message' => 'Grupo actualizado correctamente.',
        ]);
    }

    public function delete(InternshipGroup $group): RedirectResponse
    {
        $this->groupService->deleteGroup($group->id);

        return back()->with([
            'message' => 'Grupo eliminado correctamente.',
        ]);
    }

    public function attachStudents(AttachStudentsRequest $request, InternshipGroup $group): RedirectResponse
    {
        $data = $request->validated();
        $this->groupService->attachStudents($group->id, $data['student_assignment_ids']);

        return back()->with('message', 'Estudiantes agregados correctamente.');
    }

    public function detachStudents(DetachStudentsRequest $request, InternshipGroup $group): RedirectResponse
    {
        $data = $request->validated();
        $this->groupService->detachStudents($group->id, $data['student_assignment_ids']);

        return back()->with('message', 'Estudiantes retirados correctamente.');
    }

    public function moveStudents(MoveStudentsRequest $request, InternshipGroup $group): RedirectResponse
    {
        $data = $request->validated();
        $this->groupService->moveStudents(
            $group->id,
            $data['target_group_id'],
            $data['student_assignment_ids']
        );

        return back()->with('message', 'Estudiantes movidos correctamente.');
    }

    public function indexBySupervision(): Response
    {
        $currentAssignmentId = session('assignment_id');
        $currentAssignment = Assignment::query()->find($currentAssignmentId);

        $groups = [];
        if ($currentAssignment && in_array($currentAssignment->role_id, [3, 4])) {
            $groups = $this->groupService->getInternshipGroupsBySection($currentAssignment->section_id);
        }

        $faculties = Faculty::query()->forAssignmentContext($currentAssignment, session('semester_id'))->get();

        return Inertia::render('supervision/groups/supervision/index', [
            'groups' => $groups,
            'faculties' => $faculties,
        ]);
    }

    public function getGroupStudentsDetails(InternshipGroup $group): JsonResponse
    {
        $students = $this->groupService->getGroupStudentsWithPlacement($group->id);

        return response()->json([
            'students' => $students,
        ]);
    }
}
