<?php

namespace App\Domains\JobBoard\Http\Controllers;

use App\Domains\JobBoard\Enums\CandidateStatus;
use App\Domains\JobBoard\Enums\VacancyCloseReason;
use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Http\Requests\CloseVacancyRequest;
use App\Domains\JobBoard\Http\Requests\ReviewVacancyRequest;
use App\Domains\JobBoard\Http\Requests\UpdateCandidateStatusRequest;
use App\Domains\JobBoard\Models\Vacancy;
use App\Domains\JobBoard\Models\VacancyCandidate;
use App\Domains\JobBoard\Services\CandidateProposalService;
use App\Domains\JobBoard\Services\VacancyNewBadgeService;
use App\Domains\JobBoard\Services\VacancyReviewService;
use App\Domains\JobBoard\Support\JobBoardAccess;
use App\Domains\JobBoard\Support\SchoolOptions;
use App\Domains\JobBoard\Support\VacancyPresenter;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VacancyAdminController extends Controller
{
    public function __construct(
        private JobBoardAccess $access,
        private VacancyPresenter $presenter,
        private VacancyReviewService $reviews,
        private CandidateProposalService $candidates,
        private VacancyNewBadgeService $badges,
        private SchoolOptions $schoolOptions,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Vacancy::class);

        $assignment = $this->access->assignment($request->user(), [1, 2]);

        if (! $assignment) {
            abort(403, 'Se requiere un perfil administrativo activo.');
        }

        $query = Vacancy::query()
            ->with(['company', 'schools.faculty'])
            ->latest('updated_at');

        if ($this->access->isSubadmin($assignment)) {
            $facultyId = $assignment->section?->school?->faculty_id;
            $query->whereHas('schools', fn ($schools) => $schools->where('faculty_id', $facultyId));
        }

        if ($request->filled('status')) {
            $status = VacancyStatus::tryFrom((string) $request->input('status'));

            if ($status) {
                $query->where('status', $status);
            }
        }

        $vacancies = $query->get();
        $newIds = $this->badges->newIds($vacancies, $request->user(), 'admin');

        return Inertia::render('jobboard/admin/index', [
            'vacancies' => $vacancies
                ->map(fn (Vacancy $vacancy) => $this->presenter->summary(
                    $vacancy,
                    in_array((int) $vacancy->id, $newIds, true),
                ))
                ->values()
                ->all(),
            'statuses' => collect(VacancyStatus::cases())
                ->map(fn (VacancyStatus $status) => ['value' => $status->value, 'label' => $status->label()])
                ->all(),
            'candidate_statuses' => collect(CandidateStatus::cases())
                ->map(fn (CandidateStatus $status) => ['value' => $status->value, 'label' => $status->label()])
                ->all(),
            'schools' => $this->schoolOptions->all(),
            'filters' => [
                'status' => $request->input('status'),
            ],
        ]);
    }

    public function detail(Request $request, Vacancy $vacancy): JsonResponse
    {
        Gate::authorize('view', $vacancy);

        $this->badges->markSeen($vacancy, $request->user());

        return response()->json($this->presenter->adminDetail($vacancy));
    }

    public function review(ReviewVacancyRequest $request, Vacancy $vacancy): RedirectResponse
    {
        Gate::authorize('review', $vacancy);

        $this->reviews->review(
            $request->user(),
            $vacancy,
            $request->validated('decision'),
            $request->validated('comment'),
            $request->boolean('notify_teachers', true),
            $request->validated('school_ids'),
        );

        return back()->with('message', 'Revisión de la vacante registrada.');
    }

    public function notifyTeachers(Request $request, Vacancy $vacancy): RedirectResponse
    {
        Gate::authorize('notifyTeachers', $vacancy);

        $this->reviews->notifyTeachers($request->user(), $vacancy);

        return back()->with('message', 'Aviso enviado a los docentes titulares.');
    }

    public function close(CloseVacancyRequest $request, Vacancy $vacancy): RedirectResponse
    {
        Gate::authorize('close', $vacancy);

        $this->reviews->close(
            $request->user(),
            $vacancy,
            VacancyCloseReason::from($request->validated('reason')),
        );

        return back()->with('message', 'Vacante cerrada.');
    }

    public function updateCandidate(
        UpdateCandidateStatusRequest $request,
        Vacancy $vacancy,
        VacancyCandidate $candidate,
    ): RedirectResponse {
        abort_unless((int) $candidate->vacancy_id === (int) $vacancy->id, 404);

        Gate::authorize('updateStatus', $candidate);

        $this->candidates->updateStatus(
            $candidate,
            $request->validated('status'),
            $request->validated('status_note'),
        );

        return back()->with('message', 'Estado del candidato actualizado.');
    }
}
