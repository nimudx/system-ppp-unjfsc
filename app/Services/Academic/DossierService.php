<?php

namespace App\Services\Academic;

use App\Enums\Role;
use App\Models\Assignment;
use App\Models\Document;
use App\Models\DocumentType;
use App\Services\DocumentService;
use App\Services\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DossierService
{
    protected DocumentService $documentService;

    protected NotificationService $notificationService;

    public function __construct(DocumentService $documentService, NotificationService $notificationService)
    {
        $this->documentService = $documentService;
        $this->notificationService = $notificationService;
    }

    public function getDossierData(Assignment $assignment): Collection
    {
        $dossier = $assignment->dossiers()->firstOrCreate([
            'assignment_id' => $assignment->id,
        ]);

        $requerimentsConfig = $this->getRequirementsByRole($assignment->role_id);

        $allDocuments = $dossier->documents()
            ->with('documentType')
            ->latest()
            ->get();

        return collect($requerimentsConfig)->map(function ($item) use ($allDocuments) {
            $docsOfType = $allDocuments->filter(
                function ($doc) use ($item) {
                    return $doc->documentType->code === $item['code'];
                }
            );

            $transform = function ($doc) {
                if (! $doc) {
                    return null;
                }
                $data = $doc->toArray();
                // Transformamos el path a una URL pública
                $data['path'] = Storage::url($doc->path);

                return $data;
            };

            return [
                'code' => $item['code'],
                'title' => $item['title'],
                'has_template' => $item['has_template'] ?? false,
                'latest' => $transform($docsOfType->first()),
                'history' => $docsOfType->map(fn ($d) => $transform($d))->values()->all(),
                'status' => $docsOfType->first()->approval_status ?? 0,
            ];
        });
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function getRequirementsByRole(int $roleId): array
    {
        $configs = [
            3 => [
                ['code' => 'horario', 'title' => 'Horario'],
                ['code' => 'carga_lectiva', 'title' => 'Carga Lectiva'],
            ],
            4 => [
                ['code' => 'horario', 'title' => 'Horario'],
                ['code' => 'carga_lectiva', 'title' => 'Carga Lectiva'],
                ['code' => 'resolucion_designacion', 'title' => 'Resolución de designación'],

            ],
            5 => [
                ['code' => 'ficha', 'title' => 'Ficha de Matrícula'],
                ['code' => 'record', 'title' => 'Record Académico'],
            ],
        ];

        return $configs[$roleId] ?? [];
    }

    public function initDataValidation(?int $raId, int $roleId, Assignment $assignment, int $semesterId): array
    {
        $assignments = [
            'data' => [],
            'current_page' => 1,
            'last_page' => 1,
            'total' => 0,
            'links' => [],
        ];

        if ($raId) {
            $assignments = Assignment::with(['user.person', 'section.school.faculty', 'section.faculty', 'dossiers'])
                ->where('id', $raId)
                ->get()
                ->toArray();
        } else {
            if ($assignment && in_array($assignment->role_id, [3, 4])) {
                $assignments = Assignment::with(['user.person', 'section.school.faculty', 'section.faculty', 'dossiers'])
                    ->where('role_id', $roleId)
                    ->where('section_id', $assignment->section_id)
                    ->get()
                    ->toArray();
            }
        }

        return $assignments;
    }

    public function getAssignments(array $filters, int $semesterId): LengthAwarePaginator
    {
        $query = Assignment::with(['user.person', 'section.school.faculty', 'section.faculty', 'dossiers'])
            ->where('role_id', $filters['target_role_id'])
            ->where('semester_id', $semesterId);

        if (! empty($filters['faculty_id'])) {
            $query->whereHas('section.school.faculty', function ($q) use ($filters) {
                $q->where('id', $filters['faculty_id']);
            });
        }
        if (! empty($filters['school_id'])) {
            $query->whereHas('section.school', function ($q) use ($filters) {
                $q->where('id', $filters['school_id']);
            });
        }
        if (! empty($filters['section_id'])) {
            $query->where('section_id', $filters['section_id']);
        }
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        return $query->paginate(3);
    }

    /**
     * Store a document for a dossier.
     */
    public function storeDocumentDossier(array $data, Assignment $assignment): Document
    {
        return DB::transaction(function () use ($data, $assignment) {
            $model = $this->documentService->validateOwnership('dossier', $data['target_id'], $assignment);

            $data['context'] = 'dossier';
            $data['document_type_id'] = DocumentType::query()->where('code', $data['code'])->first()->id;

            $document = $this->documentService->registerDocument($data, $assignment, $model);

            // La ruta de destino y los roles receptores dependen del rol del actor
            [$route, $recipientRoles] = match ($assignment->role_id) {
                Role::DTITULAR->value => ['academic.dossiers.teacher', [Role::ADMIN, Role::SUBADMIN]],
                Role::DSUPERVISOR->value => ['academic.dossiers.supervisor', [Role::ADMIN, Role::SUBADMIN, Role::DTITULAR]],
                Role::ESTUDIANTE->value => ['academic.dossiers.student', [Role::ADMIN, Role::SUBADMIN, Role::DTITULAR, Role::DSUPERVISOR]],
                default => ['dashboard', []],
            };

            $docType = $document->documentType->name;

            $this->notificationService->notify(
                type: 'DOSSIER_UPLOAD',
                actor: $assignment,
                subject: $model,
                payload: [
                    'action' => [
                        'route' => $route,
                        'params' => ['a' => $assignment->id],
                    ],
                    'meta' => [
                        'title' => 'Nueva carga de archivo',
                        'role' => $assignment->role->name,
                        'document' => $docType,
                        'entity' => 'dossier',
                    ],
                ],
                resolver: fn ($subject, $actor) => $this->notificationService->resolveAcademicRoles(
                    $actor->section_id,
                    $recipientRoles
                )
            );

            return $document;
        });
    }

    /**
     * Update the status of a dossier document.
     */
    public function updateDossierStatus(array $data, Document $document, Assignment $assignment): Document
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
                default => 'Documento rechazado',
            };

            $this->notificationService->notify(
                type: 'DOSSIER_VALIDATION',
                actor: $assignment,
                subject: $document,
                payload: [
                    'action' => [
                        'route' => 'academic.dossiers.submission',
                        'params' => [],
                    ],
                    'meta' => [
                        'title' => $title,
                        'role' => $assignment->role->name,
                        'document' => $docType,
                        'status' => $status,
                        'comment' => $data['comment'] ?? null,
                        'entity' => 'dossier',
                    ],
                ],
                resolver: function ($subject, $actor) {
                    return collect([$subject->documentable->assignment->user]);
                }
            );

            return $result;
        });
    }
}
