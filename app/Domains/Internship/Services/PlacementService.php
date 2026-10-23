<?php

namespace App\Domains\Internship\Services;

use App\Domains\Company\Models\Area;
use App\Domains\Company\Services\CompanyService;
use App\Domains\Documents\Models\DocumentType;
use App\Domains\Documents\Services\DocumentService;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Internship\Models\Internship;
use App\Domains\Internship\Models\Placement;
use App\Domains\Notifications\Services\NotificationService;
use App\Shared\Enums\Role;
use Illuminate\Support\Facades\DB;

class PlacementService
{
    public function __construct(
        protected CompanyService $companyService,
        protected DocumentService $documentService,
        protected NotificationService $notificationService
    ) {}

    public function getSubmissionData(Assignment $assignment): array
    {
        // 1. Cargar relaciones necesarias del assignment
        $assignment->loadMissing([
            'section.school.faculty',
            'placement.company',
            'placement.area',
            'placement.documents.documentType',
        ]);

        $placement = $assignment->placement;

        $reqsConfig = [
            ['code' => 'fut', 'title' => 'FUT', 'locked' => false],
            ['code' => 'carta_presentacion', 'title' => 'Carta de Presentación', 'locked' => false],
            ['code' => 'carta_aceptacion', 'title' => 'Carta de Aceptación', 'locked' => false],
        ];

        if (! $placement) {
            return [
                'placement' => null,
                'requirements' => $reqsConfig,
                'isApproved' => false,
            ];
        }

        $allDocs = $placement->documents;

        return [
            'placement' => [
                'id' => $placement->id,
                'internship_type' => $placement->internship_type,
                'origin_type' => $placement->origin_type,
                'approval_status' => $placement->approval_status,
                'company' => $placement->company,
                'area_id' => $placement->area_id,
                'area_name' => $placement->area?->name,
                'boss_name' => $placement->boss_name,
                'boss_position' => $placement->boss_position,
                'boss_phone' => $placement->boss_phone,
                'boss_email' => $placement->boss_email,
                'position' => $placement->position,
                'description' => $placement->description,
                'start_date' => $placement->start_date,
                'end_date' => $placement->end_date,
            ],
            'requirements' => $this->mapRequirements($reqsConfig, $allDocs),
            'isApproved' => $placement->approval_status === 1 && $placement->validation_status === 1,
        ];
    }

    public function mapRequirements(array $config, $documentCollection): array
    {
        return collect($config)->map(function ($item) use ($documentCollection) {
            $docsOfType = $documentCollection->filter(fn ($doc) => $doc->documentType->code === $item['code']);
            $latest = $docsOfType->first();

            return [
                'code' => $item['code'],
                'title' => $item['title'],
                'locked' => $item['locked'] ?? false,
                'status' => $latest->approval_status ?? 0,
                'latest' => $latest ? [
                    'id' => $latest->id,
                    'name' => $latest->name,
                    'path' => $latest->signedFileUrl(),
                    'approval_status' => $latest->approval_status,
                    'comment' => $latest->comment,
                    'created_at' => $latest->created_at,
                ] : null,
                'history' => $docsOfType->map(fn ($d) => [
                    'id' => $d->id,
                    'name' => $d->name,
                    'approval_status' => $d->approval_status,
                    'comment' => $d->comment,
                    'created_at' => $d->created_at,
                ])->values()->all(),
            ];
        })->values()->all();
    }

    public function registerPlacement(array $data, Assignment $assignment): Placement
    {
        return DB::transaction(function () use ($data, $assignment) {
            $confirmation = app(\App\Domains\Company\Services\CompanyAcceptanceService::class)->accepted($assignment, isset($data['company']['id']) ? (int) $data['company']['id'] : null);
            $companyId = $confirmation->company_id;
            Assignment::whereKey($assignment->id)->lockForUpdate()->firstOrFail();
            $previous = Placement::where('assignment_id', $assignment->id)->first();
            abort_if($previous && ($previous->approval_status === 1 || $previous->validation_status === 1), 409, 'La formalización aprobada no se puede reemplazar.');
            if (! empty($data['placement']['area_id'])) {
                abort_unless(Area::whereKey($data['placement']['area_id'])->where('company_id', $companyId)->exists(), 422, 'El área no pertenece a la empresa confirmada.');
            }

            $areaId = $data['placement']['area_id'] ?? null;
            if (! $areaId && ! empty($data['placement']['area_name'])) {
                $area = $this->companyService->registerArea([
                    'name' => $data['placement']['area_name'],
                    'description' => $data['placement']['area_description'] ?? null,
                    'company_id' => $companyId,
                ]);
                $areaId = $area->id;
            }

            $placement = Placement::query()->updateOrCreate(
                ['assignment_id' => $assignment->id],
                [
                    'company_id' => $companyId,
                    'company_validation_request_id' => $confirmation->id,
                    'practice_declared_at' => now(),
                    'practice_declaration_text' => \App\Domains\Company\Services\CompanyAcceptanceService::PRACTICE_DECLARATION,
                    'area_id' => $areaId,
                    'boss_name' => $data['placement']['boss_name'] ?? null,
                    'boss_position' => $data['placement']['boss_position'] ?? null,
                    'boss_phone' => $data['placement']['boss_phone'] ?? null,
                    'boss_email' => $data['placement']['boss_email'] ?? null,
                    'position' => $data['placement']['position'],
                    'description' => $data['placement']['description'] ?? null,
                    'start_date' => $data['placement']['start_date'],
                    'end_date' => $data['placement']['end_date'] ?? null,
                    'internship_type' => $data['internship_type'],
                    'origin_type' => $data['origin_type'] ?? 'direct',
                    'status' => 1,
                    'approval_status' => 2, // 2: Pending (Data)
                    'validation_status' => 2, // 2: Pending (Global)
                ]
            );

            // La aceptación empresarial y los datos completos habilitan el expediente documental.
            // Esto no aprueba documentos ni califica la práctica.
            Internship::firstOrCreate(
                ['placement_id' => $placement->id, 'assignment_id' => $assignment->id],
                ['internship_step' => 1, 'status' => 1]
            );

            $this->notificationService->notify(
                type: 'PLACEMENT_REGISTER',
                actor: $assignment,
                subject: $placement,
                payload: [
                    'action' => [
                        'route' => 'internship.validation',
                        'params' => ['a' => $assignment->id],
                    ],
                    'meta' => [
                        'title' => 'Registro de Formalización',
                        'role' => $assignment->role->name,
                        'document' => 'Solicitud de Formalización',
                        'entity' => 'placement',
                    ],
                ],
                resolver: fn ($subject, $actor) => $this->notificationService->resolveAcademicRoles(
                    $actor->section_id,
                    [Role::ADMIN, Role::SUBADMIN, Role::DTITULAR]
                )
            );

            return $placement;
        });
    }

    public function updatePlacement(Placement $placement, array $data, Assignment $assignment): Placement
    {
        return DB::transaction(function () use ($placement, $data, $assignment) {
            // si el placemente ya esta aprobado, no se puede editar
            if ($placement->approval_status === 1 || $placement->validation_status === 1) {
                throw new \Exception('El placement ya esta aprobado, no se puede editar');
            }

            abort_unless($placement->assignment_id === $assignment->id, 403, 'La práctica no pertenece al estudiante.');
            app(\App\Domains\Company\Services\CompanyAcceptanceService::class)->accepted($assignment, $placement->company_id);
            if (isset($data['company']['id'])) {
                abort_unless((int) $data['company']['id'] === $placement->company_id, 422, 'La empresa confirmada no puede cambiarse.');
            }
            if (! empty($data['placement']['area_id'])) {
                abort_unless(Area::whereKey($data['placement']['area_id'])->where('company_id', $placement->company_id)->exists(), 422, 'El área no pertenece a la empresa.');
            }
            // El estudiante no puede modificar el catálogo de empresas al editar su práctica.

            // Guardamos el ID del área anterior para limpieza posterior
            $oldAreaId = $placement->area_id;

            // Actualizar datos del placement
            $placement->update([
                'boss_name' => $data['placement']['boss_name'] ?? $placement->boss_name,
                'boss_position' => $data['placement']['boss_position'] ?? $placement->boss_position,
                'boss_phone' => $data['placement']['boss_phone'] ?? $placement->boss_phone,
                'boss_email' => $data['placement']['boss_email'] ?? $placement->boss_email,
                'position' => $data['placement']['position'] ?? $placement->position,
                'description' => $data['placement']['description'] ?? $placement->description,
                'start_date' => $data['placement']['start_date'] ?? $placement->start_date,
                'end_date' => $data['placement']['end_date'] ?? $placement->end_date,
                'practice_declared_at' => now(),
                'practice_declaration_text' => \App\Domains\Company\Services\CompanyAcceptanceService::PRACTICE_DECLARATION,
                'approval_status' => 2, // Reset a Pendiente (Data)
                'validation_status' => 2, // Reset Global a Pendiente
            ]);

            // Gestión de área:
            $areaId = $data['placement']['area_id'] ?? null;

            // Si no viene ID pero sí nombre, buscamos o creamos el área
            if (! $areaId && ! empty($data['placement']['area_name'])) {
                $area = $this->companyService->registerArea([
                    'name' => $data['placement']['area_name'],
                    'company_id' => $placement->company_id,
                ]);
                $areaId = $area->id;
            }

            // Asociar el área (sea nueva o existente)
            if ($areaId) {
                $placement->area()->associate($areaId);
                $placement->save();
            }

            // Limpieza de área huérfana: Si el área cambió, verificamos si la anterior quedó vacía
            if ($oldAreaId && $oldAreaId != $areaId) {
                $oldArea = Area::find($oldAreaId);
                if ($oldArea && $oldArea->placements()->count() === 0) {
                    $oldArea->delete();
                }
            }

            $this->notificationService->notify(
                type: 'PLACEMENT_UPDATE',
                actor: $assignment,
                subject: $placement,
                payload: [
                    'action' => [
                        'route' => 'internship.validation',
                        'params' => ['a' => $assignment->id],
                    ],
                    'meta' => [
                        'title' => 'Actualización de Formalización',
                        'role' => $assignment->role->name,
                        'document' => 'Solicitud de Formalización',
                        'entity' => 'placement',
                    ],
                ],
                resolver: fn ($subject, $actor) => $this->notificationService->resolveAcademicRoles(
                    $actor->section_id,
                    [Role::ADMIN, Role::SUBADMIN, Role::DTITULAR]
                )
            );

            return $placement->fresh();
        });
    }

    public function updateDocument(Placement $placement, Assignment $assignment, array $data): void
    {
        $this->savePlacementDocument($placement, $assignment, $data['code'], $data['file']);
    }

    public function validatePlacementData(Placement $placement, array $data, Assignment $assignment): void
    {
        DB::transaction(function () use ($placement, $data, $assignment) {
            $placement->update([
                'approval_status' => $data['approval_status'],
                'observation' => $data['observation'] ?? null,
            ]);

            $status = (int) $data['approval_status'];
            $title = match ($status) {
                1 => 'Datos de formalización aprobados',
                3 => 'Datos de formalización observados',
                default => 'Datos de formalización evaluados',
            };

            $this->notificationService->notify(
                type: 'PLACEMENT_DATA_VALIDATION',
                actor: $assignment,
                subject: $placement,
                payload: [
                    'action' => [
                        'route' => 'internship.submission',
                        'params' => [],
                    ],
                    'meta' => [
                        'title' => $title,
                        'role' => $assignment->role->name,
                        'document' => 'Datos de Empresa y Jefe',
                        'status' => $status,
                        'comment' => $data['observation'] ?? null,
                        'entity' => 'placement',
                    ],
                ],
                resolver: function ($subject, $actor) {
                    return collect([$subject->assignment->user]);
                }
            );

            if ($status === 1) {
                $this->checkAndFinalizeValidation($placement, $placement->assignment);
            }
        });
    }

    public function validatePlacementDocument(array $data, \App\Domains\Documents\Models\Document $document, Assignment $assignment): \App\Domains\Documents\Models\Document
    {
        return DB::transaction(function () use ($data, $document, $assignment) {
            $result = $this->documentService->updateStatus($document, [
                'approval_status' => $data['approval_status'],
                'comment' => $data['comment'] ?? '',
            ]);

            $docType = $result->documentType->name;
            $status = (int) $data['approval_status'];
            $title = match ($status) {
                1 => 'Documento aprobado',
                2 => 'Documento con observación',
                3 => 'Documento rechazado',
                default => 'Documento evaluado',
            };

            $this->notificationService->notify(
                type: 'PLACEMENT_DOCUMENT_VALIDATION',
                actor: $assignment,
                subject: $document,
                payload: [
                    'action' => [
                        'route' => 'internship.submission',
                        'params' => [],
                    ],
                    'meta' => [
                        'title' => $title,
                        'role' => $assignment->role->name,
                        'document' => $docType,
                        'status' => $status,
                        'comment' => $data['comment'] ?? null,
                        'entity' => 'placement',
                    ],
                ],
                resolver: function ($subject, $actor) {
                    return collect([$subject->documentable->assignment->user]);
                }
            );

            if ($status === 1) {
                $filesV = ['fut', 'carta_presentacion', 'carta_aceptacion'];
                if (in_array($document->documentType->code, $filesV)) {
                    if ($document->documentable_type === (new Placement)->getMorphClass()) {
                        $this->checkAndFinalizeValidation($document->documentable, $document->documentable->assignment);
                    }
                }
            }

            return $result;
        });
    }

    public function checkAndFinalizeValidation(Placement $placement, Assignment $assignment): void
    {
        // 1. Verificar si los datos (empresa/jefe) están aprobados
        if ($placement->approval_status !== 1) {
            return;
        }

        // 2. Verificar si los 3 documentos obligatorios están aprobados
        $requiredCodes = ['fut', 'carta_presentacion', 'carta_aceptacion'];

        $approvedDocsCount = $placement->documents()
            ->whereHas('documentType', function ($q) use ($requiredCodes) {
                $q->whereIn('code', $requiredCodes);
            })
            ->where('approval_status', 1)
            ->get()
            ->unique('document_type_id')
            ->count();

        if ($approvedDocsCount < count($requiredCodes)) {
            return;
        }

        // 3. Si todo está aprobado, finalizar formalización y crear Internship
        DB::transaction(function () use ($placement, $assignment) {
            $placement->update(['validation_status' => 1]);

            // Crear el registro de Internship (Etapa 2)
            Internship::firstOrCreate(
                ['placement_id' => $placement->id, 'assignment_id' => $placement->assignment_id],
                [
                    'internship_step' => 1,
                    'status' => 1,
                ]
            );

            $this->notificationService->notify(
                type: 'PLACEMENT_FINALIZED',
                actor: $assignment,
                subject: $placement,
                payload: [
                    'action' => [
                        'route' => 'internship.submission',
                        'params' => [],
                    ],
                    'meta' => [
                        'title' => 'Formalización Aprobada',
                        'role' => $assignment->role->name,
                        'document' => 'Solicitud de Prácticas',
                        'status' => 1,
                        'entity' => 'placement',
                    ],
                ],
                resolver: function ($subject, $actor) {
                    return collect([$subject->assignment->user]);
                }
            );
        });
    }

    private function savePlacementDocument(Placement $placement, Assignment $assignment, string $code, $file): void
    {
        $docType = DocumentType::where('code', $code)->first();
        if ($docType) {
            $this->documentService->registerDocument([
                'file' => $file,
                'context' => 'placement',
                'target_id' => $placement->id,
                'document_type_id' => $docType->id,
                'comment' => '',
            ], $assignment, $placement);
        }
    }
}
