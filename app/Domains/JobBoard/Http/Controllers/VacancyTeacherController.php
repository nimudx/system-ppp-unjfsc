<?php

namespace App\Domains\JobBoard\Http\Controllers;

use App\Domains\Identity\Enums\AssignmentApprovalStatus;
use App\Domains\Identity\Models\Assignment;
use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Http\Requests\ProposeCandidatesRequest;
use App\Domains\JobBoard\Models\Vacancy;
use App\Domains\JobBoard\Models\VacancyCandidate;
use App\Domains\JobBoard\Services\CandidateProposalService;
use App\Domains\JobBoard\Services\VacancyNewBadgeService;
use App\Domains\JobBoard\Support\JobBoardAccess;
use App\Domains\JobBoard\Support\VacancyPresenter;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VacancyTeacherController extends Controller
{
    public function __construct(
        private JobBoardAccess $access,
        private VacancyPresenter $presenter,
        private CandidateProposalService $candidates,
        private VacancyNewBadgeService $badges,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Vacancy::class);

        $teacher = $this->access->assignment($request->user(), [3]);

        if (! $teacher || ! $teacher->section) {
            abort(403, 'Se requiere un perfil de docente titular con sección activa.');
        }

        $vacancies = Vacancy::query()
            ->where('status', VacancyStatus::PUBLISHED)
            ->whereHas('schools', fn ($schools) => $schools->where('school_id', $teacher->section->school_id))
            ->with(['company', 'schools.faculty'])
            ->latest('published_at')
            ->get();

        $newIds = $this->badges->newIds($vacancies, $request->user(), 'teacher');

        return Inertia::render('jobboard/teacher/index', [
            'vacancies' => $vacancies
                ->map(fn (Vacancy $vacancy) => $this->presenter->summary(
                    $vacancy,
                    in_array((int) $vacancy->id, $newIds, true),
                ))
                ->values()
                ->all(),
            'teacher' => [
                'assignment_id' => $teacher->id,
                'section' => $teacher->section->name,
                'school' => $teacher->section->school?->name,
                'semester' => $teacher->semester?->code,
            ],
        ]);
    }

    public function detail(Request $request, Vacancy $vacancy): JsonResponse
    {
        Gate::authorize('view', $vacancy);

        $teacher = $this->access->assignment($request->user(), [3]);

        if (! $teacher || ! $teacher->section) {
            abort(403, 'Se requiere un perfil de docente titular con sección activa.');
        }

        $this->badges->markSeen($vacancy, $request->user());

        return response()->json(
            $this->presenter->teacherDetail($vacancy, $this->eligibleStudents($vacancy, $teacher))
        );
    }

    public function propose(ProposeCandidatesRequest $request, Vacancy $vacancy): RedirectResponse
    {
        Gate::authorize('propose', $vacancy);

        $this->candidates->propose(
            $request->user(),
            $vacancy,
            $request->validated('student_ids'),
            $request->validated('note'),
        );

        return back()->with('message', 'Candidatos propuestos al administrador.');
    }

    public function withdraw(Request $request, Vacancy $vacancy, VacancyCandidate $candidate): RedirectResponse
    {
        abort_unless((int) $candidate->vacancy_id === (int) $vacancy->id, 404);

        Gate::authorize('withdraw', $candidate);

        $this->candidates->withdraw($candidate);

        return back()->with('message', 'Propuesta retirada.');
    }

    /**
     * Estudiantes de la misma sección y semestre que el titular, con expediente aprobado.
     *
     * @return array<int, array<string, mixed>>
     */
    private function eligibleStudents(Vacancy $vacancy, Assignment $teacher): array
    {
        $proposed = $vacancy->candidates()
            ->pluck('student_assignment_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        return Assignment::query()
            ->where('role_id', 5)
            ->where('status', 1)
            ->where('section_id', $teacher->section_id)
            ->where('semester_id', $teacher->semester_id)
            ->where('approval_status', AssignmentApprovalStatus::APPROVED)
            ->with(['user.person', 'section.school', 'semester'])
            ->orderBy('id')
            ->get()
            ->map(fn (Assignment $student) => [
                ...$this->presenter->student($student),
                'already_proposed' => in_array((int) $student->id, $proposed, true),
            ])
            ->values()
            ->all();
    }
}
