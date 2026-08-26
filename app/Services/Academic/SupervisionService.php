<?php
namespace App\Services\Academic;

use App\Enums\Role as RoleEnum;
use App\Exceptions\EvaluationAlreadyApprovedException;
use App\Models\Assignment;
use App\Models\DocumentType;
use App\Models\Evaluation;
use App\Models\InternshipGroup;
use App\Models\StudentGroup;
use App\Models\Supervision;
use Illuminate\Support\Facades\DB;
use App\Services\DocumentService;
use App\Services\NotificationService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class SupervisionService
{

    private $documentService;
    private $notificationService;

    public function __construct(DocumentService $documentService, NotificationService $notificationService)
    {
        $this->documentService = $documentService;
        $this->notificationService = $notificationService;
    }

    public function initializeStudentProgress(int $studentAssignmentId): void
    {
        for ($i = 1; $i <= 4; $i++) {
            Supervision::query()->firstOrCreate([
                'assignment_id' => $studentAssignmentId,
                'module_id' => $i,
            ]);
        }
    }

    public function syncGroupModule(int $groupId): int
    {
        $group = InternshipGroup::query()->findOrFail($groupId);

        $studentIds = StudentGroup::query()
            ->where('internship_group_id', $groupId)
            ->pluck('student_assignment_id');

        if ($studentIds->isEmpty()) {
            $group->update(['module_id' => 1]);
            return 1;
        }

        $studentProgress = [];

        foreach ($studentIds as $id) {
            // Buscamos el PRIMER módulo que este estudiante NO tiene aprobado.
            // Si aprobó el 1, este query devolverá el 2.
            // Si aprobó todo, devolverá null.
            $nextPendingModule = Supervision::query()
                ->where('assignment_id', $id)
                ->where('approval_status', '!=', 1)
                ->orderBy('module_id', 'asc')
                ->value('module_id');

            // Si es null, significa que el estudiante ya terminó todo (completó el 4),
            // así que le asignamos 5 simbólicamente para que no baje el promedio del grupo.
            $studentProgress[] = $nextPendingModule ?? 5;
        }

        // El módulo del grupo es el mínimo de lo que les falta a los alumnos.
        // Si todos terminaron el Mod 1, el min será 2.
        $calculatedModule = min($studentProgress);

        // No podemos exceder el módulo 4 (limite académico)
        $finalModule = $calculatedModule > 4 ? 4 : $calculatedModule;

        $group->update(['module_id' => $finalModule]);

        return $finalModule;
    }

    /**
     * Registra una evaluación y un documento asociado.
     *
     * @param array $data Datos de la evaluación.
     * @return array Resultado de la operación.
     */
    public function registerEvaluation(array $data, Assignment $assignment, Supervision $supervision): void
    {
        DB::transaction(function () use ($data, $assignment, $supervision) {
            $document_type_id = DocumentType::query()->where('code', $data['code'])->first()->id;

            $oldEvaluation = Evaluation::query()
                ->where('supervision_id', $supervision->id)
                ->whereHas(
                    'documents',
                    function ($query) use ($document_type_id) {
                        $query->where('document_type_id', $document_type_id);
                    }
                )
                ->latest()
                ->first();

            if ($oldEvaluation && in_array($oldEvaluation->approval_status, [1, 2])) {
                throw new EvaluationAlreadyApprovedException();
            }

            $evaluation = Evaluation::query()->create([
                'supervision_id' => $supervision->id,
                'grade' => $data['grade'],
                'comment' => $data['comment'] ?? '',
            ]);

            $documentData = [
                'context' => 'evaluation',
                'target_id' => $evaluation->id,
                'document_type_id' => $document_type_id,
            ];

            if ($oldEvaluation) {
                $oldDocument = $supervision->documents()->where('document_type_id', $document_type_id)->latest()->first();

                switch ($oldEvaluation->approval_status) {
                    case 3: // AMBOS
                        if (isset($data['file'])) {
                            $documentData['file'] = $data['file'];
                            $document = $this->documentService->registerDocument($documentData, $assignment, $evaluation);
                        }
                        break;
                    case 4: // CALIFICACIÓN
                        if ($oldDocument) {
                            $documentData['path'] = $oldDocument->path;
                            $documentData['name'] = $oldDocument->name;
                            $document = $this->documentService->updatePathDocument($documentData, $assignment);
                        }
                        break;
                    case 5: // ARCHIVO
                        $evaluation->update(['grade' => $oldEvaluation->grade]);
                        if (isset($data['file'])) {
                            $documentData['file'] = $data['file'];
                            $document = $this->documentService->registerDocument($documentData, $assignment, $evaluation);
                        }
                        break;
                }
            } else {
                $documentData['file'] = $data['file'];
                $document = $this->documentService->registerDocument($documentData, $assignment, $evaluation);
            }

            $this->notificationService->notify(
                type: 'EVALUATION_UPLOAD',
                actor: $assignment,
                subject: $supervision,
                payload: [
                    'action' => [
                        'route' => 'academic.supervision.validation',
                        'params' => [
                            'a' => $supervision->assignment_id,
                            'm' => $supervision->module_id,
                        ],
                    ],
                    'meta' => [
                        'message' => 'Se ha calificado una evaluación',
                        'sender' => $assignment->user->name ?? 'Usuario',
                        'entity' => 'supervisión',
                    ],
                ],
                resolver: fn($subject, $actor) => $this->notificationService->resolveAcademicRoles(
                    $actor->section_id,
                    [RoleEnum::ADMIN, RoleEnum::SUBADMIN, RoleEnum::DTITULAR]
                )
            );
        });
    }

    /**
     * Actualiza el estado de evaluación y procesa el progreso de la evaluación.
     *
     * @param Evaluation $evaluation La evaluación a actualizar.
     * @param array $data Los datos de la evaluación.
     * @return void
     */
    public function updateEvaluationStatus(Evaluation $evaluation, array $data, Assignment $assignment): void
    {

        DB::transaction(function () use ($evaluation, $data, $assignment) {
            $evaluation->update([
                'approval_status' => $data['approval_status'],
                //'comment' => $data['comment']
            ]);

            $documentStatus = ($data['approval_status'] >= 3) ? 3 : $data['approval_status'];

            $document = $evaluation->documents()->first();
            if ($document) {
                $this->documentService->updateStatus($document, [
                    'approval_status' => $documentStatus,
                    'comment' => $data['comment']
                ]);
            }

            if ((int) $data['approval_status'] === 1)
                $this->processEvaluationProgress($evaluation);

            $msj = '';
            if ($data['approval_status'] == 1) {
                $msj = 'La evaluación ha sido aprobada';
            } else if ($data['approval_status'] == 3) {
                $msj = 'La evaluación ha sido observada';
            }

            $this->notificationService->notify(
                type: 'EVALUATION_VALIDATION',
                actor: $assignment,
                subject: $document,
                payload: [
                    'action' => [
                        'route' => 'academic.supervision.submission',
                        'params' => [
                            'a' => $document->documentable->supervision->assignment_id,
                            'm' => $document->documentable->supervision->module_id,
                        ],
                    ],
                    'meta' => [
                        'message' => $msj,
                        'entity' => 'supervisión',
                    ],
                ],
                resolver: function ($subject, $actor) {
                    // 1. Roles institucionales (Admin, Subadmin, Docente Titular)
                    $recipients = $this->notificationService->resolveAcademicRoles(
                        $actor->section_id,
                        [RoleEnum::ADMIN, RoleEnum::SUBADMIN, RoleEnum::DTITULAR]
                    );

                    // 2. Supervisor específico del estudiante
                    // Seguimos el camino: Documento -> Evaluación -> Supervisión -> Alumno (Assignment)
                    $studentAssignment = $subject->documentable->supervision->assignment;

                    // Buscamos el grupo de este estudiante
                    $studentGroup = $studentAssignment->studentGroups()->first();

                    if ($studentGroup && $studentGroup->internshipGroup) {
                        $supervisor = $studentGroup->internshipGroup->supervisorAssignment;
                        if ($supervisor && $supervisor->user) {
                            $recipients->push($supervisor->user);
                        }
                    }

                    // 3. También notificamos al Estudiante dueño del expediente
                    if ($studentAssignment->user) {
                        $recipients->push($studentAssignment->user);
                    }

                    return $recipients->unique('id');
                }
            );
        });
    }

    public function processEvaluationProgress(Evaluation $evaluation): void
    {
        $required = 2;
        $supervision = $evaluation->supervision;

        if (!$supervision) {
            return;
        }

        $approvedCount = $supervision->documents()->where('documents.approval_status', 1)->count();

        if ($approvedCount >= $required) {
            $supervision->update(['approval_status' => 1]);

            $groupId = StudentGroup::query()->where('student_assignment_id', $supervision->assignment_id)
                ->value('internship_group_id');

            if ($groupId) {
                $this->syncGroupModule($groupId);
            }
        }
    }

    /**
     *
     * @@param array $filters
     */
    public function getGroupsByFilter(array $filters, int $semesterId): Collection
    {
        $query = InternshipGroup::with([
            'section.school.faculty',
            'module',
            'teacher.user.person',
            'supervisor.user.person',
        ])->where('status', 1);

        if ($semesterId) {
            $query->whereHas('section', function ($q) use ($semesterId) {
                $q->where('semester_id', $semesterId);
            });
        }

        if (!empty($filters['section_id'])) {
            $query->where('section_id', $filters['section_id']);
        } elseif (!empty($filters['school_id'])) {
            $query->whereHas('section', fn($q) => $q->where('school_id', $filters['school_id']));
        } elseif (!empty($filters['faculty_id'])) {
            $query->whereHas('section.school', fn($q) => $q->where('faculty_id', $filters['faculty_id']));
        }

        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhereHas('teacher.user.person', function ($q2) use ($s) {
                        $q2->where('names', 'like', "%{$s}%")
                            ->orWhere('surnames', 'like', "%{$s}%");
                    })
                    ->orWhereHas('supervisor.user.person', function ($q2) use ($s) {
                        $q2->where('names', 'like', "%{$s}%")
                            ->orWhere('surnames', 'like', "%{$s}%");
                    });
            });
        }

        return $query->get()->map(fn($group) => [
            'id' => $group->id,
            'name' => $group->name,
            'module_id' => $group->module_id,
            'module' => $group->module ? ['id' => $group->module->id, 'name' => $group->module->name] : null,
            'teacher' => [
                'user' => [
                    'person' => [
                        'names' => $group->teacher?->user?->person?->names,
                        'surnames' => $group->teacher?->user?->person?->surnames,
                    ]
                ]
            ],
            'supervisor' => [
                'user' => [
                    'person' => [
                        'names' => $group->supervisor?->user?->person?->names,
                        'surnames' => $group->supervisor?->user?->person?->surnames,
                    ]
                ]
            ],
            'section' => [
                'id' => $group->section->id,
                'name' => $group->section->name,
                'school' => [
                    'name' => $group->section->school->name,
                    'faculty' => ['name' => $group->section->school->faculty->name],
                ],
            ],
        ]);
    }

    /**
     * Global search for students by their user code (users.name field).
     * Returns 4 records per student, one per supervision module.
     */
    public function searchStudentsGlobal(string $code)
    {
        $query = Assignment::query()
            ->where('role_id', 5)
            ->with(['user.person', 'section.school.faculty'])
            ->whereHas('user', fn($q) => $q->where('name', 'like', "%{$code}%"));

        $paginator = $query->paginate(15);

        // Expand each student into 4 rows, one per supervision module
        $expandedResults = [];
        foreach ($paginator->getCollection() as $assignment) {
            for ($m = 1; $m <= 4; $m++) {
                $supervision = Supervision::where('assignment_id', $assignment->id)
                    ->where('module_id', $m)
                    ->first();

                $expandedResults[] = [
                    'id' => $assignment->id,
                    'search_module' => $m, // Signals this is a global-search result
                    'user' => [
                        'email' => $assignment->user->email,
                        'person' => [
                            'names' => $assignment->user->person->names,
                            'surnames' => $assignment->user->person->surnames,
                        ],
                    ],
                    'section' => [
                        'id' => $assignment->section_id,
                        'name' => $assignment->section->name,
                        'school' => [
                            'name' => $assignment->section->school->name,
                            'faculty' => ['name' => $assignment->section->school->faculty->name],
                        ],
                    ],
                    'supervision' => [
                        'id' => $supervision?->id,
                        'module_id' => $m,
                        'approval_status' => $supervision?->approval_status ?? 0,
                    ],
                ];
            }
        }

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $expandedResults,
            $paginator->total() * 4,
            $paginator->perPage() * 4,
            $paginator->currentPage(),
            ['path' => \Illuminate\Support\Facades\Request::url()]
        );
    }


    public function getStudentsByFilter(InternshipGroup $group, int $moduleId, bool $paginate = true)
    {
        // Get student assignment IDs from the group
        $studentIds = $group->studentGroups()->pluck('student_assignment_id');

        // Build query for assignments
        $query = Assignment::whereIn('id', $studentIds)
            ->with(['user.person', 'section.school.faculty']);

        $result = $paginate ? $query->paginate(15) : $query->get();
        $items = $paginate ? $result->getCollection() : $result;

        // Transform results to include supervision data
        $items->transform(function ($assignment) use ($moduleId) {
            $supervision = Supervision::where('assignment_id', $assignment->id)
                ->where('module_id', $moduleId)
                ->first();

            return [
                'id' => $assignment->id,
                'user' => [
                    'email' => $assignment->user->email,
                    'person' => [
                        'names' => $assignment->user->person->names,
                        'surnames' => $assignment->user->person->surnames,
                    ],
                ],
                'section' => [
                    'name' => $assignment->section->name,
                    'school' => [
                        'name' => $assignment->section->school->name,
                        'faculty' => ['name' => $assignment->section->school->faculty->name],
                    ],
                ],
                'supervision' => $supervision ? [
                    'id' => $supervision->id,
                    'module_id' => $supervision->module_id,
                    'approval_status' => $supervision->approval_status,
                ] : null,
            ];
        });

        return $result;
    }

    public function getSupervisionAnnexes(Assignment $assignment, int $moduleId): array
    {
        $supervision = Supervision::where('assignment_id', $assignment->id)
            ->where('module_id', $moduleId)
            ->first();

        $annexCodes = ['anexo_7', 'anexo_8'];
        $result = [];

        foreach ($annexCodes as $code) {
            $docType = DocumentType::where('code', $code)->first();

            if (!$docType || !$supervision) {
                $result[] = [
                    'code' => $code,
                    'title' => $docType->name ?? strtoupper(str_replace('_', ' ', $code)),
                    'status' => 0,
                    'latest' => null,
                    'history' => [],
                    'supervision_id' => $supervision?->id,
                ];
                continue;
            }

            // All evaluations for this supervision that have a document of this type
            $evaluations = $supervision->evaluations()
                ->with(['documents' => fn($q) => $q->where('document_type_id', $docType->id)])
                ->get()
                ->filter(fn($e) => $e->documents->isNotEmpty());

            $history = $evaluations->map(fn($e) => [
                'id' => $e->id,
                'approval_status' => $e->documents->first()?->approval_status,
                'comment' => $e->documents->first()?->comment,
                'name' => $e->documents->first()?->name,
                'path' => $e->documents->first() ? Storage::url($e->documents->first()->path) : null,
                'created_at' => $e->created_at,
            ])->values();

            $latest = $evaluations->sortByDesc('created_at')->first();
            $latestDoc = $latest?->documents->first();

            $result[] = [
                'code' => $code,
                'title' => $docType->name ?? strtoupper(str_replace('_', ' ', $code)),
                'status' => $latest?->approval_status ?? 0,
                'latest' => $latestDoc ? [
                    'id' => $latestDoc->id,
                    'name' => $latestDoc->name,
                    'path' => Storage::url($latestDoc->path),
                    'comment' => $latest->comment,
                    'justification' => $latestDoc->comment,
                ] : null,
                'history' => $history,
                'evaluation_id' => $latest?->id,
                'grade' => $latest?->grade,
                'supervision_id' => $supervision->id,
            ];
        }

        return $result;
    }
}
