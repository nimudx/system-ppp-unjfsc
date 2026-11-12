<?php

namespace App\Domains\Internship\Http\Controllers;

use App\Domains\Identity\Models\Assignment;
use App\Domains\Supervision\Enums\PracticeSubmissionType;
use App\Domains\Supervision\Http\Requests\SubmitPracticeDocumentRequest;
use App\Domains\Supervision\Services\PracticeSubmissionService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Revisión del plan y del informe de prácticas desde el lado del estudiante.
 *
 * La pantalla forma parte del proceso de la pasantía (por eso vive bajo
 * /internship), pero reutiliza el servicio de entregas de Supervisión.
 */
class PracticeReportController extends Controller
{
    public function __construct(private readonly PracticeSubmissionService $service) {}

    /** Estudiante: pantalla Rev. Informe (plan e informe de prácticas). */
    public function reportReview(): Response
    {
        $assignment = Assignment::query()->findOrFail(session('assignment_id'));

        return Inertia::render('internship/report-review', $this->service->getStudentData($assignment));
    }

    /** Estudiante: entregar o reenviar plan / informe. */
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
}
