<?php

namespace App\Domains\Supervision\Http\Controllers;

use App\Domains\Identity\Models\Assignment;
use App\Domains\Supervision\Enums\PracticeSubmissionType;
use App\Domains\Supervision\Http\Requests\ReviewPracticeSubmissionRequest;
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
     * Docente supervisor: planes de prácticas de sus estudiantes.
     */
    public function practicePlans(): Response
    {
        return $this->supervisorIndex(PracticeSubmissionType::PLAN, 'supervision/practice-plans');
    }

    /**
     * Docente supervisor: informes de prácticas de sus estudiantes.
     */
    public function practiceReports(): Response
    {
        return $this->supervisorIndex(PracticeSubmissionType::REPORT, 'supervision/practice-reports');
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
