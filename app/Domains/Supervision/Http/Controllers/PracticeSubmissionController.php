<?php

namespace App\Domains\Supervision\Http\Controllers;

use App\Domains\Identity\Models\Assignment;
use App\Domains\Supervision\Enums\PracticeSubmissionType;
use App\Domains\Supervision\Http\Requests\ReviewPracticeSubmissionRequest;
use App\Domains\Supervision\Http\Requests\SubmitPracticeDocumentRequest;
use App\Domains\Supervision\Models\PracticeSubmission;
use App\Domains\Supervision\Services\PracticeSubmissionService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PracticeSubmissionController extends Controller
{
    public function __construct(private readonly PracticeSubmissionService $service) {}

    /**
     * Estudiante: pantalla Rev. Informe (plan e informe de prácticas).
     */
    public function reportReview(): Response
    {
        $assignment = Assignment::query()->findOrFail(session('assignment_id'));

        return Inertia::render('internship/report-review', $this->service->getStudentData($assignment));
    }

    /**
     * Estudiante: entregar o reenviar plan / informe.
     */
    public function store(SubmitPracticeDocumentRequest $request): RedirectResponse
    {
        $assignment = Assignment::query()->findOrFail(session('assignment_id'));

        $this->service->submit(
            $assignment,
            PracticeSubmissionType::from($request->validated('type')),
            $request->file('file'),
        );

        return back()->with('message', 'Documento enviado correctamente.');
    }

    /**
     * Docente supervisor: planes de prácticas de sus estudiantes.
     */
    public function plansIndex(): Response
    {
        return $this->supervisorIndex(PracticeSubmissionType::PLAN, 'internship/practice-plans');
    }

    /**
     * Docente supervisor: informes de prácticas de sus estudiantes.
     */
    public function reportsIndex(): Response
    {
        return $this->supervisorIndex(PracticeSubmissionType::REPORT, 'internship/practice-reports');
    }

    private function supervisorIndex(PracticeSubmissionType $type, string $page): Response
    {
        $supervisor = Assignment::query()->findOrFail(session('assignment_id'));

        return Inertia::render($page, $this->service->getSupervisorData($supervisor, $type));
    }

    /**
     * Docente supervisor: calificar u observar una entrega.
     */
    public function review(ReviewPracticeSubmissionRequest $request, PracticeSubmission $submission): RedirectResponse
    {
        $reviewer = Assignment::query()->findOrFail(session('assignment_id'));

        $this->service->review($submission, $request->validated(), $reviewer);

        return back()->with('message', 'Revisión registrada correctamente.');
    }
}
