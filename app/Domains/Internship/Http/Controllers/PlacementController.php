<?php

namespace App\Domains\Internship\Http\Controllers;

use App\Domains\Company\Services\CompanyService;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Internship\Http\Requests\StorePlacementRequest;
use App\Domains\Internship\Models\Placement;
use App\Domains\Internship\Services\PlacementService;
use App\Domains\Internship\Support\PracticeDuration;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PlacementController extends Controller
{
    public function __construct(
        protected PlacementService $placementService,
        protected CompanyService $companyService,
    ) {}

    public function SubmissionIndex(Request $request): Response
    {
        $assignment = Assignment::findOrFail(session('assignment_id'));

        return Inertia::render('internship/submission/placement', [
            'assignment' => $assignment,
        ]);
    }

    public function ValidationIndex(Request $request): Response
    {
        $assignment = Assignment::findOrFail(session('assignment_id'));

        return Inertia::render('internship/validation/placement', [
            'assignment' => $assignment,
        ]);
    }

    /**
     * Verificar empresa por RUC y devolver datos + áreas como JSON.
     */
    public function verifyCompany(string $ruc): JsonResponse
    {
        try {
            $data = $this->companyService->verifyCompany($ruc);

            if (! $data) {
                return response()->json(['found' => false, 'company' => null, 'areas' => []]);
            }

            return response()->json([
                'message' => 'Empresa encontrada exitosamente.',
                'found' => true,
                'company' => [
                    'id' => $data['id'],
                    'ruc' => $data['ruc'],
                    'name' => $data['name'],
                    'address' => $data['address'],
                    'phone' => $data['phone'],
                    'email' => $data['email'],
                ],
                'areas' => $data['areas']->map(fn ($a) => ['id' => $a->id, 'name' => $a->name]),
            ]);
        } catch (\Throwable $e) {
            return response()->json(['found' => false, 'company' => null, 'areas' => [], 'error' => $e->getMessage()]);
        }
    }

    /**
     * Registrar la formalización de prácticas (Placement).
     * El Assignment activo se extrae de la sesión del usuario.
     */
    public function store(StorePlacementRequest $request): RedirectResponse
    {
        $assignment = Assignment::findOrFail(session('assignment_id'));

        $this->placementService->registerPlacement(
            $request->validated(),
            $assignment
        );

        return back()->with('message', 'Formalización registrada exitosamente.');
    }

    public function updateStatus(Request $request, Placement $placement): RedirectResponse
    {
        $assignment = Assignment::findOrFail(session('assignment_id'));

        $data = $request->validate([
            'approval_status' => 'required|in:1,3',
            'observation' => 'required_if:approval_status,3|string',
        ]);

        $this->placementService->validatePlacementData($placement, $data, $assignment);

        return back()->with('message', 'Dictamen registrado correctamente.');
    }

    public function update(Request $request, Placement $placement): RedirectResponse
    {
        $data = $request->validate([
            'practice_declaration_accepted' => ['required', 'accepted'],
            'company.id' => 'nullable|integer|exists:companies,id',
            'company.name' => 'nullable|string',
            'company.address' => 'nullable|string',
            'company.phone' => 'nullable|string',
            'company.email' => 'nullable|email',
            'placement.area_id' => 'nullable|exists:areas,id',
            'placement.area_name' => 'required_if:placement.area_id,null|string',
            'placement.boss_name' => 'required|string',
            'placement.boss_position' => 'nullable|string',
            'placement.boss_phone' => 'nullable|string',
            'placement.boss_email' => 'nullable|email',
            'placement.position' => 'required|string',
            'placement.description' => 'required|string',
            'placement.start_date' => 'required|date',
            'placement.end_date' => 'required|date|after:placement.start_date',
        ]);

        $days = PracticeDuration::businessDays(
            $data['placement']['start_date'] ?? null,
            $data['placement']['end_date'] ?? null,
        );
        $requiredDays = PracticeDuration::minimumBusinessDays();

        if ($days < $requiredDays) {
            throw ValidationException::withMessages([
                'placement.end_date' => sprintf(
                    'La práctica debe cubrir al menos %d horas. Con un máximo de %d horas diarias necesitas al menos %d días hábiles; el rango elegido tiene %d días hábiles (%d horas estimadas).',
                    PracticeDuration::MINIMUM_HOURS,
                    PracticeDuration::MAX_HOURS_PER_DAY,
                    $requiredDays,
                    $days,
                    PracticeDuration::estimatedHours($days),
                ),
            ]);
        }

        $assignment = Assignment::findOrFail(session('assignment_id'));

        $this->placementService->updatePlacement($placement, $data, $assignment);

        return back()->with('message', 'Datos de formalización actualizados correctamente.');
    }

    public function storeDocument(Request $request, Placement $placement)
    {
        $request->validate([
            'code' => 'required|string|in:fut,carta_presentacion,carta_aceptacion,anexo_1,anexo_2,anexo_3',
            'file' => 'required|file|mimes:pdf|max:2048',
        ], [
            'code.in' => 'El tipo de documento no es válido.',
            'file.mimes' => 'El documento debe ser un archivo PDF.',
            'file.max' => 'El documento no debe superar los 2 MB.',
        ]);

        $assignment = Assignment::findOrFail(session('assignment_id'));

        $this->placementService->updateDocument($placement, $assignment, [
            'code' => $request->code,
            'file' => $request->file('file'),
        ]);

        return back()->with('message', 'Documento registrado correctamente.');
    }
}
