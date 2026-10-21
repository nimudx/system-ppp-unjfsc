<?php

namespace App\Services\Academic;

use App\Exceptions\Document\DocumentAlreadyApprovedException;
use App\Exceptions\Internship\InternshipAlreadyActiveException;
use App\Exceptions\ResourceNotFoundException;
use App\Models\Assignment;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\Internship;
use App\Models\InternshipSetting;
use App\Models\Placement;
use App\Models\UserRequest;
use App\Services\DocumentService;
use App\Services\NotificationService;
use App\Services\RequestService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class InternshipService
{
    protected $documentService;

    protected $requestService;

    protected $placementService;

    protected $notificationService;

    public function __construct(DocumentService $documentService, RequestService $requestService, PlacementService $placementService, NotificationService $notificationService)
    {
        $this->documentService = $documentService;
        $this->requestService = $requestService;
        $this->placementService = $placementService;
        $this->notificationService = $notificationService;
    }

    public function getSubmissionData(Assignment $assignment, ?int $requestStep = null): array
    {
        $assignment->loadMissing([
            'placement.company',
            'placement.area',
            'placement.documents.documentType',
            'internship.documents.documentType',
            'section',
        ]);

        $placement = $assignment->placement;
        $internship = $assignment->internship;

        $this->syncStudentStep($internship);
        $internship->refresh();

        $currentStep = $internship->internship_step ?? 1;
        $viewStep = min($requestStep ?? $currentStep, $currentStep);

        $setting = InternshipSetting::query()->where('section_id', $assignment->section_id)->first();

        $steps = [];
        $requirements = [];

        if ($setting && ! empty($setting->workflow_schema)) {
            $schema = collect($setting->workflow_schema)->sortBy('step');
            $steps = $schema->map(fn ($s) => [
                'id' => $s['step'],
                'label' => $s['name'],
                'is_evaluation' => $s['is_evaluation'] ?? false,
            ])->values()->all();

            $viewStep = min($requestStep ?? $currentStep, $currentStep);
            $currentStage = $schema->firstWhere('step', $viewStep);

            if ($currentStage && ! ($currentStage['is_evaluation'] ?? false)) {
                $reqDocs = $currentStage['required_docs'][$placement->internship_type] ?? [];

                $requirements = $this->placementService->mapRequirements(
                    collect($reqDocs)->map(fn ($d) => ['code' => $d['code'], 'title' => $d['name']])->all(),
                    $internship->documents
                );
            }
        }

        return [
            'assignment' => $assignment, // Incluye placement
            'internship' => $internship,
            'steps' => $steps,
            'currentStep' => $currentStep,
            'requirements' => $requirements,
        ];
    }

    /**
     * Register a new internship for a user.
     *
     * @param  array  $data  The data for the internship.
     * @param  Assignment  $assignment  The assignment associated with the internship.
     * @return array The result of the operation.
     */
    public function registerInternship(array $data, Assignment $assignment): Internship
    {
        return DB::transaction(function () use ($assignment) {
            $activeInternship = Internship::query()->where('assignment_id', $assignment->id)->where('status', 1)->latest()->first();

            if ($activeInternship) {
                throw new InternshipAlreadyActiveException;
            }

            $placement = $assignment->placement;

            $internship = Internship::query()->create([
                'assignment_id' => $assignment->id,
                'placement_id' => $placement->id,
                'internship_type' => $placement->internship_type,
                'internship_step' => 1, // o 2 si ya se aprobó el placement
            ]);

            return $internship;
        });
    }

    public function uploadDocumentInternship(array $data, Assignment $assignment): Document
    {
        return DB::transaction(function () use ($data, $assignment) {
            $model = $this->documentService->validateOwnership('internship', $data['target_id'], $assignment);

            $documentType = DocumentType::where('code', $data['code'])->first();

            $this->validateCorrectDocument('internship', $documentType->id, $model);

            $data['context'] = 'internship';
            $data['document_type_id'] = $documentType->id;

            $document = $this->documentService->registerDocument($data, $assignment, $model);

            return $document;
        });
    }

    /**
     * Actualiza el estado de la práctica interna a la etapa 5.
     */
    public function stepFiveInternship(array $array, Internship $internship, Assignment $assignment): Internship
    {
        return DB::transaction(function () use ($array, $internship, $assignment) {
            $this->validateOwnership($internship, $assignment);
            $internship->update($array);

            return $internship;
        });
    }

    private function validateOwnership(Model $model, Assignment $assignment): void
    {
        if (in_array($assignment->role_id, [1, 2, 3])) {
            return;
        }

        if ($model->assignment_id !== $assignment->id) {
            throw new ResourceNotFoundException;
        }
    }

    private function validateCorrectDocument(string $context, int $documentTypeId, Internship $internship): void
    {

        $codeType = DocumentType::query()->find($documentTypeId)->code;

        // validad si es un tipo de documento válido para el internship y en esa etapa de internship
        /*$documentTypeDispStep = [
         2 => [
         'desarrollo' => ['fut', 'carta_presentacion'],
         'convalidacion' => ['fut', 'carta_presentacion', 'carta_aceptacion'],
         ],
         3 => [
         'desarrollo' => ['carta_aceptacion', 'plan_ppp'],
         'convalidacion' => ['plan_ppp', 'control_mensual', 'informe_final_ppp'],
         ],
         4 => [
         'desarrollo' => ['informe_final_ppp', 'constancia_ppp'],
         'convalidacion' => ['informe_final_ppp', 'constancia_ppp'],
         ],
         ];
         $step = $internship->internship_step;
         $type = $internship->internship_type;
         $documentTypes = $documentTypeDispStep[$step][$type];
         if (!in_array($codeType, $documentTypes)) {
         throw new \Exception('No es un tipo de documento válido para este internship en esta etapa.');
         }*/

        // validar si hay un document de ese tipo pendiente o ya aprobado
        $oldDocument = $internship->documents()->where('document_type_id', $documentTypeId)->latest()->first();

        if ($oldDocument && in_array($oldDocument->approval_status, [1, 2])) {
            throw new DocumentAlreadyApprovedException;
        }
    }

    /**
     * @return Request
     */
    public function requestTypeChange(array $data, Internship $internship, Assignment $sender): UserRequest
    {
        return DB::transaction(function () use ($internship, $data, $sender) {
            $this->validateOwnership($internship, $sender);

            if ($internship->internship_step >= 3) {
                throw new \Exception('No puede solicitar el cambio de tipo, no está en la etapa correcta.');
            }

            $this->hasPendingRequest($internship, 'CHANGE_INTERNSHIP_TYPE');

            $internship->application_status = 2;
            $internship->save();

            $request = $this->requestService->createRequest(
                $sender,
                $internship,
                'CHANGE_INTERNSHIP_TYPE',
                [
                    'new_type' => $data['new_type'],
                    'old_type' => $internship->internship_type,
                ],
                $data['reason'] ?? 'Solicitud de cambio de tipo de prácticas.'
            );

            return $request->load('requestable');
        });
    }

    /**
     * Request a grade change for an internship.
     */
    public function requestGradeChange(array $data, Internship $internship, Assignment $sender): UserRequest
    {
        return DB::transaction(function () use ($internship, $data, $sender) {
            $this->validateOwnership($internship, $sender);

            if ($internship->grade === null) {
                throw new \Exception('No puede solicitar el cambio de nota si aún no existe una calificación registrada.');
            }

            $this->hasPendingRequest($internship, 'CHANGE_INTERNSHIP_GRADE');

            $internship->application_status = 3;
            $internship->save();

            $request = $this->requestService->createRequest(
                $sender,
                $internship,
                'CHANGE_INTERNSHIP_GRADE',
                [
                    'new_grade' => $data['new_grade'],
                    'old_grade' => $internship->grade,
                ],
                $data['reason'] ?? 'Sin motivo especificado'
            );

            return $request->load('requestable');
        });
    }

    private function hasPendingRequest(Internship $internship, string $type): void
    {
        $exists = $internship->requests()->where('type', $type)->where('approval_status', 2)->latest()->exists();

        if ($exists) {
            throw new \Exception('Ya existe una solicitud pendiente.');
        }
    }

    /**
     * Sincroniza dinámicamente el paso (step) del estudiante inspeccionando el workflow (JSON)
     * y los documentos que actualmente tiene aprobados.
     * Patrón de máquina de estados de evaluación tardía (Lazy Evaluation).
     */
    public function syncStudentStep(Internship $internship): void
    {
        // 1. Obtener la práctica y el tipo (development | validation)
        // Se asume que $internship tiene la relación assignment y placement cargables.
        $internship->loadMissing(['assignment', 'placement']);
        $assignment = $internship->assignment;
        $placement = $internship->placement;

        if (! $assignment || ! $placement) {
            return;
        }

        $practiceType = $placement->internship_type; // 'development' o 'validation'

        // 2. Obtener el archivo de configuración JSON para la sección
        // Si no hay configuración definida en JSON, asumimos que no se puede calcular nada.
        $setting = InternshipSetting::where('section_id', $assignment->section_id)->first();

        if (! $setting || empty($setting->workflow_schema)) {
            return;
        }

        $schema = $setting->workflow_schema;

        // Limpiar y ordenar el schema por 'step' ascendentemente por seguridad
        usort($schema, function ($a, $b) {
            return $a['step'] <=> $b['step'];
        });

        // 3. Obtener el conjunto de 'codes' de documentos ya APROBADOS por este estudiante
        // approval_status = 1 significa APROBADO (2=pendiente, 3=observado)
        $approvedCodes = $internship->documents()
            ->where('approval_status', 1)
            ->join('document_types', 'documents.document_type_id', '=', 'document_types.id')
            ->pluck('document_types.code')
            ->toArray();

        $currentStep = 1;

        // 4. Recorrer etapa por etapa buscando el "minimo pendiente"
        foreach ($schema as $stage) {

            // Si la etapa en curso está declarada como de evaluación,
            // y hemos llegado hasta aquí sin que los pasos anteriores fallen,
            // el estudiante está formalmente en la etapa de evaluación / calificación.
            if (isset($stage['is_evaluation']) && $stage['is_evaluation']) {
                $currentStep = $stage['step'];
                break;
            }

            $requiredDocs = $stage['required_docs'][$practiceType] ?? [];
            $isStageComplete = true;

            foreach ($requiredDocs as $docReq) {
                // Chequear si el estudiante tiene este 'code' aprobado
                if (! in_array($docReq['code'], $approvedCodes)) {
                    $isStageComplete = false;
                    break; // Falta este documento, la etapa NO está completa
                }
            }

            if (! $isStageComplete) {
                // ¡Mínimo pendiente encontrado!
                // El estudiante no ha completado esta etapa, por ende esta es su etapa actual.
                $currentStep = $stage['step'];
                break;
            }

            // Si pasa aquí, significa que la etapa fue completada al 100%.
            // El ciclo continuará al siguiente step, y currentStep se actualizará solo si falla,
            // o si llega a la etapa de evaluación.
        }

        // 5. Guardar el nuevo paso solo si cambió
        if ($internship->internship_step !== $currentStep) {
            $internship->update(['internship_step' => $currentStep]);
        }
    }
}
