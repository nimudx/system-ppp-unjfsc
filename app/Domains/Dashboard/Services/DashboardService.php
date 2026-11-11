<?php

namespace App\Domains\Dashboard\Services;

use App\Domains\Academic\Models\School;
use App\Domains\Academic\Models\Section;
use App\Domains\Company\Enums\CompanyRequestState;
use App\Domains\Company\Models\Company;
use App\Domains\Company\Models\CompanyValidationRequest;
use App\Domains\Documents\Models\Document;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\FailedLogin;
use App\Domains\Identity\Models\Person;
use App\Domains\Identity\Models\User;
use App\Domains\Internship\Models\Placement;
use App\Domains\Notifications\Models\Notification;
use App\Domains\Notifications\Models\NotificationRecipient;
use App\Domains\Supervision\Enums\PracticeSubmissionStatus;
use App\Domains\Supervision\Enums\PracticeSubmissionType;
use App\Domains\Supervision\Models\Evaluation;
use App\Domains\Supervision\Models\InternshipGroup;
use App\Domains\Supervision\Models\PracticeSubmission;
use App\Domains\Supervision\Models\StudentGroup;
use App\Domains\Supervision\Models\Supervision;
use App\Shared\Enums\Role;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

/**
 * Indicadores reales de cada panel. Cada rol solo ve los datos de su alcance:
 * todo el sistema (administrador general), el semestre (admin) o su facultad (subadmin),
 * su sección (docente titular) o sus grupos (docente supervisor).
 */
class DashboardService
{
    public function forUser(User $user): ?array
    {
        if ($user->type_user_id === 1) {
            return $this->superAdmin();
        }

        $assignment = Assignment::with('section', 'semester')
            ->whereKey(session('assignment_id'))
            ->where('user_id', $user->id)
            ->first();

        return match ($assignment?->role_id) {
            Role::ADMIN->value, Role::SUBADMIN->value => $this->admin($assignment),
            Role::DTITULAR->value => $this->teacher($assignment, $user),
            Role::DSUPERVISOR->value => $this->supervisor($assignment),
            Role::ESTUDIANTE->value => $this->student($assignment, $user),
            default => null,
        };
    }

    public function superAdmin(): array
    {
        $users = User::count();
        $failedToday = FailedLogin::where('created_at', '>=', today())->count();
        $lockoutsToday = FailedLogin::where('created_at', '>=', today())->where('locked_out', true)->count();

        return [
            'companies' => [
                'total' => Company::count(),
                'thisMonth' => Company::where('created_at', '>=', now()->startOfMonth())->count(),
            ],
            'users' => [
                'total' => $users,
                'activePercent' => $this->percent(User::where('status', 1)->count(), $users),
            ],
            'security' => [
                'failedToday' => $failedToday,
                'lockoutsToday' => $lockoutsToday,
            ],
            'storage' => $this->storageUsage(),
            'server' => $this->serverLoad(),
            'recentActions' => $this->recentActions(),
        ];
    }

    public function admin(Assignment $assignment): array
    {
        $semesterId = $assignment->semester_id;
        // El subadmin solo ve su facultad; el administrador, todo el semestre.
        $facultyId = $assignment->role_id === Role::SUBADMIN->value ? $assignment->section?->faculty_id : null;

        $inScope = fn (Builder $query) => $query
            ->where('semester_id', $semesterId)
            ->where('status', 1)
            ->when($facultyId, fn ($q) => $q->whereHas('section', fn ($s) => $s->where('faculty_id', $facultyId)));

        $students = Assignment::where('role_id', Role::ESTUDIANTE->value)->tap($inScope);
        $studentIds = (clone $students)->pluck('id');
        $teachers = Assignment::whereIn('role_id', [Role::DTITULAR->value, Role::DSUPERVISOR->value])->tap($inScope);

        $withInternship = Assignment::whereIn('id', $studentIds)->whereHas('internship')->pluck('id');
        $withSupervisor = StudentGroup::whereIn('student_assignment_id', $withInternship)->where('status', 1)->distinct()->count('student_assignment_id');

        $pendingDocuments = Document::where('approval_status', 2)->where('status', 1)
            ->whereIn('uploaded_by', $studentIds)->count();

        $sectionsWithoutGroup = Section::where('semester_id', $semesterId)
            ->when($facultyId, fn ($q) => $q->where('faculty_id', $facultyId))
            ->whereHas('assignments', fn ($q) => $q->where('role_id', Role::ESTUDIANTE->value)->where('status', 1))
            ->whereDoesntHave('internshipGroups')
            ->with('school')
            ->get();

        $pendingCompanies = CompanyValidationRequest::where('semester_id', $semesterId)
            ->whereIn('state', ['pending_review', 'observed'])
            ->when($facultyId, fn ($q) => $q->whereIn('school_id', School::where('faculty_id', $facultyId)->select('id')))
            ->count();

        $pendingSubmissions = PracticeSubmission::whereIn('assignment_id', $studentIds)->where('approval_status', 2)->count();

        return [
            'students' => [
                'total' => $studentIds->count(),
                'thisMonth' => (clone $students)->where('created_at', '>=', now()->startOfMonth())->count(),
            ],
            'teachers' => [
                'total' => (clone $teachers)->count(),
                'schools' => Section::whereIn('id', (clone $teachers)->select('section_id'))->distinct()->count('school_id'),
            ],
            'internships' => [
                'total' => $withInternship->count(),
                'withSupervisorPercent' => $this->percent($withSupervisor, $withInternship->count()),
            ],
            'pendingDocuments' => $pendingDocuments,
            'bySchool' => $this->studentsBySchool($semesterId, $facultyId),
            'alerts' => array_values(array_filter([
                $sectionsWithoutGroup->isNotEmpty() ? [
                    'title' => 'Secciones sin grupo de supervisión',
                    'detail' => $sectionsWithoutGroup->take(3)->map(fn ($s) => $s->school?->name.' · Sección '.$s->name)->implode(', '),
                    'level' => 'warning',
                ] : null,
                $pendingCompanies > 0 ? [
                    'title' => 'Solicitudes de empresa por revisar',
                    'detail' => $pendingCompanies.' solicitud(es) pendientes u observadas',
                    'level' => 'warning',
                ] : null,
                $pendingDocuments > 0 ? [
                    'title' => 'Documentos de expediente sin revisar',
                    'detail' => $pendingDocuments.' documento(s) pendientes',
                    'level' => 'danger',
                ] : null,
                $pendingSubmissions > 0 ? [
                    'title' => 'Planes e informes en revisión',
                    'detail' => $pendingSubmissions.' entrega(s) esperando calificación',
                    'level' => 'info',
                ] : null,
            ])),
        ];
    }

    public function teacher(Assignment $assignment, User $user): array
    {
        $students = Assignment::where('role_id', Role::ESTUDIANTE->value)
            ->where('section_id', $assignment->section_id)
            ->where('semester_id', $assignment->semester_id)
            ->where('status', 1);
        $studentIds = (clone $students)->pluck('id');

        $supervisorIds = InternshipGroup::where('teacher_assignment_id', $assignment->id)
            ->orWhere('section_id', $assignment->section_id)
            ->pluck('supervisor_assignment_id');

        $pendingVisits = Evaluation::where('approval_status', 2)
            ->whereHas('supervision', fn ($q) => $q->whereIn('assignment_id', $supervisorIds))
            ->count();

        $submissions = PracticeSubmission::whereIn('assignment_id', $studentIds)->where('approval_status', 2);

        $unread = NotificationRecipient::where('user_id', $user->id)->whereNull('read_at')->count();

        return [
            'semester' => $assignment->semester?->code,
            'students' => $studentIds->count(),
            'pendingVisits' => $pendingVisits,
            'pendingReports' => [
                'total' => (clone $submissions)->count(),
                'plans' => (clone $submissions)->where('type', 'plan')->count(),
                'reports' => (clone $submissions)->where('type', 'report')->count(),
            ],
            'unreadMessages' => $unread,
            'agenda' => $this->agenda($studentIds),
            'recentStudents' => $this->studentRows((clone $students)->latest('id')->limit(5)->pluck('id')),
        ];
    }

    public function supervisor(Assignment $assignment): array
    {
        $groupIds = InternshipGroup::where('supervisor_assignment_id', $assignment->id)->pluck('id');
        $studentIds = StudentGroup::whereIn('internship_group_id', $groupIds)->where('status', 1)
            ->pluck('student_assignment_id')->unique()->values();

        $companies = Assignment::whereIn('id', $studentIds)->with('placement')->get()
            ->pluck('placement.company_id')->filter()->unique()->count();

        $evaluations = Evaluation::whereHas('supervision', fn ($q) => $q->where('assignment_id', $assignment->id));
        $validated = PracticeSubmission::where('reviewed_by', $assignment->id)->where('approval_status', 1);

        return [
            'students' => [
                'total' => $studentIds->count(),
                'companies' => $companies,
            ],
            'visits' => [
                'done' => (clone $evaluations)->count(),
                'approvedPercent' => $this->percent((clone $evaluations)->where('approval_status', 1)->count(), (clone $evaluations)->count()),
            ],
            'validatedReports' => [
                'total' => (clone $validated)->count(),
                'lastAt' => (clone $validated)->max('reviewed_at'),
            ],
            'incidents' => PracticeSubmission::whereIn('assignment_id', $studentIds)->where('approval_status', 3)->count(),
            'route' => $this->studentRows($studentIds->take(6), withAddress: true),
            'statuses' => $this->studentRows($studentIds->take(6)),
        ];
    }

    /**
     * Panel del estudiante: expediente, formalización, avance de la práctica,
     * plan e informe, módulos de supervisión, actividad y tareas pendientes.
     */
    public function student(Assignment $assignment, User $user): array
    {
        $assignment->loadMissing([
            'user.person',
            'section.school.faculty',
            'section.faculty',
            'semester',
            'placement.company',
            'placement.area',
            'placement.documents.documentType',
            'internship',
        ]);

        $placement = $assignment->placement;
        $person = $assignment->user?->person;

        // Expediente académico: ficha de matrícula y récord.
        $dossier = $assignment->dossiers()
            ->with(['documents.documentType'])
            ->first();

        $dossierDocuments = $dossier?->documents ?? collect();

        $dossierItems = collect([
            ['code' => 'ficha', 'title' => 'Ficha de matrícula'],
            ['code' => 'record', 'title' => 'Récord académico'],
        ])->map(fn (array $item) => $this->studentDocument($item, $dossierDocuments))
            ->values()
            ->all();

        // Currículum del estudiante (se guarda en su expediente).
        $cvDocument = $dossierDocuments
            ->filter(fn (Document $document) => $document->documentType?->code === 'cv')
            ->sortByDesc('id')
            ->first();
        $cvUploaded = $cvDocument !== null;

        // Documentos de formalización.
        $placementDocuments = $placement?->documents ?? collect();

        $placementItems = collect([
            ['code' => 'fut', 'title' => 'FUT'],
            ['code' => 'carta_presentacion', 'title' => 'Carta de presentación'],
            ['code' => 'carta_aceptacion', 'title' => 'Carta de aceptación'],
        ])->map(fn (array $item) => $this->studentDocument($item, $placementDocuments))
            ->values()
            ->all();

        $approvedDossier = collect($dossierItems)->where('status', 1)->count();
        $approvedPlacementDocs = collect($placementItems)->where('status', 1)->count();

        // Entregas de plan e informe, con la última vigente por tipo.
        $canUpload = app(\App\Domains\Company\Services\CompanyAcceptanceService::class)
            ->canUploadDocuments($assignment);

        $submissions = PracticeSubmission::where('assignment_id', $assignment->id)
            ->with(['document', 'reviewer.user.person'])
            ->orderByDesc('id')
            ->get();

        $submissionItems = collect(PracticeSubmissionType::cases())
            ->map(function (PracticeSubmissionType $type) use ($submissions, $canUpload) {
                /** @var PracticeSubmission|null $latest */
                $latest = $submissions->first(fn (PracticeSubmission $s) => $s->type === $type);
                $status = $latest?->approval_status?->value ?? 0;

                return [
                    'type' => $type->value,
                    'title' => $type->title(),
                    'status' => $status,
                    'status_label' => $this->practiceStatusLabel($status),
                    'grade' => $latest?->grade !== null ? (float) $latest->grade : null,
                    'comment' => $latest?->comment,
                    'submitted_at' => $latest?->created_at?->toIso8601String(),
                    'reviewed_at' => $latest?->reviewed_at?->toIso8601String(),
                    'reviewer' => $this->personName($latest?->reviewer?->user?->person) ?: null,
                    'file_url' => $latest?->document?->signedFileUrl(),
                    'attempts' => $submissions->filter(fn (PracticeSubmission $s) => $s->type === $type)->count(),
                    'can_submit' => $canUpload && ($latest === null || $status === PracticeSubmissionStatus::OBSERVED->value),
                ];
            })
            ->values()
            ->all();

        // Módulos de supervisión (1 a 4).
        $supervisions = Supervision::where('assignment_id', $assignment->id)
            ->whereIn('module_id', [1, 2, 3, 4])
            ->with(['evaluations' => fn ($q) => $q->latest('id')])
            ->get()
            ->keyBy('module_id');

        $modules = collect(range(1, 4))
            ->map(function (int $module) use ($supervisions) {
                $supervision = $supervisions->get($module);
                $status = (int) ($supervision?->approval_status ?? 0);
                $evaluation = $supervision?->evaluations?->first();

                return [
                    'module' => $module,
                    'status' => $status,
                    'status_label' => $this->supervisionStatusLabel($status),
                    'grade' => $evaluation?->grade !== null ? (float) $evaluation->grade : null,
                    'evaluated_at' => $evaluation?->updated_at?->toIso8601String(),
                ];
            })
            ->values()
            ->all();

        $approvedModules = collect($modules)->where('status', 1)->count();

        $companyRequest = CompanyValidationRequest::where('assignment_id', $assignment->id)
            ->latest('id')
            ->first();

        $formalization = $this->studentFormalization(
            $placement,
            $companyRequest,
            $placementItems,
            $approvedPlacementDocs,
        );

        // Notificaciones dirigidas al estudiante.
        $notificationQuery = NotificationRecipient::where('user_id', $user->id);
        $unread = (clone $notificationQuery)->whereNull('read_at')->count();

        $recentNotifications = (clone $notificationQuery)
            ->with('notification')
            ->latest('id')
            ->limit(6)
            ->get()
            ->filter(fn (NotificationRecipient $recipient) => $recipient->notification !== null)
            ->map(fn (NotificationRecipient $recipient) => [
                'id' => $recipient->id,
                'type' => $recipient->notification->type,
                'title' => $recipient->notification->payload['meta']['title'] ?? 'Nueva actualización',
                'document' => $recipient->notification->payload['meta']['document'] ?? null,
                'status' => $recipient->notification->payload['meta']['status'] ?? null,
                'comment' => $recipient->notification->payload['meta']['comment'] ?? null,
                'at' => $recipient->notification->created_at?->toIso8601String(),
                'read' => $recipient->read_at !== null,
            ])
            ->values()
            ->all();

        $practice = $this->studentPractice($placement);

        return [
            'meta' => [
                'name' => $this->personName($person) ?: ($assignment->user?->name ?? 'Estudiante'),
                'code' => $person?->dni,
                'school' => $assignment->section?->school?->name,
                'faculty' => $assignment->section?->school?->faculty?->name ?? $assignment->section?->faculty?->name,
                'semester' => $assignment->semester?->code,
                'company' => $placement?->company?->name,
                'position' => $placement?->position,
                'boss' => $placement?->boss_name,
                'start_date' => $placement?->start_date,
                'end_date' => $placement?->end_date,
                'internship_type' => $placement?->internship_type,
            ],
            'dossier' => [
                'approved' => $approvedDossier,
                'uploaded' => collect($dossierItems)->where('status', '!=', 0)->count(),
                'total' => count($dossierItems),
                'percent' => $this->percent($approvedDossier, count($dossierItems)),
                'items' => $dossierItems,
            ],
            'cv' => [
                'uploaded' => $cvUploaded,
                'updated_at' => $cvDocument?->updated_at?->toIso8601String(),
                'file_url' => $cvDocument?->signedFileUrl(),
            ],
            'formalization' => $formalization,
            'practice' => $practice,
            'submissions' => $submissionItems,
            'supervision' => [
                'approved' => $approvedModules,
                'total' => count($modules),
                'percent' => $this->percent($approvedModules, count($modules)),
                'modules' => $modules,
            ],
            'notifications' => [
                'unread' => $unread,
                'recent' => $recentNotifications,
            ],
            'activity' => $this->studentActivity(
                $placement,
                $dossierItems,
                $placementItems,
                $submissions,
                $supervisions,
            ),
            'tasks' => $this->studentTasks(
                $placement,
                $companyRequest,
                $dossierItems,
                $placementItems,
                $submissionItems,
                $canUpload,
                $cvUploaded,
            ),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $documents
     * @return array<string, mixed>
     */
    private function studentFormalization(
        ?Placement $placement,
        ?CompanyValidationRequest $request,
        array $documents,
        int $approvedDocuments,
    ): array {
        $total = count($documents);
        $companyState = $request?->state;
        $companyLabel = $this->companyStateLabel($companyState);
        $state = 'none';
        $label = 'Sin registrar';
        $percent = 0;

        if (! $placement) {
            if ($request) {
                $state = $companyState?->value ?? 'pending_review';
                $label = $companyLabel;
                $percent = match ($companyState) {
                    CompanyRequestState::ACCEPTED => 45,
                    CompanyRequestState::AWAITING_COMPANY => 30,
                    CompanyRequestState::OBSERVED,
                    CompanyRequestState::REJECTED,
                    CompanyRequestState::DECLINED => 15,
                    default => 10,
                };
            }
        } elseif ($placement->validation_status === 1) {
            $state = 'approved';
            $label = 'Formalización aprobada';
            $percent = 100;
        } elseif ($placement->approval_status === 3) {
            $state = 'observed';
            $label = 'Datos observados';
            $percent = 40;
        } elseif ($placement->approval_status === 1) {
            $state = 'documents';
            $label = 'Documentos pendientes';
            $percent = 50 + $this->percent($approvedDocuments, $total) / 2;
        } else {
            $state = 'data_review';
            $label = 'Datos en revisión';
            $percent = 35;
        }

        return [
            'state' => $state,
            'state_label' => $label,
            'percent' => (int) round($percent),
            'company_state' => $companyState?->value,
            'company_state_label' => $companyLabel,
            'data_status' => (int) ($placement?->approval_status ?? 0),
            'validation_status' => (int) ($placement?->validation_status ?? 0),
            'approved_documents' => $approvedDocuments,
            'total_documents' => $total,
            'documents' => $documents,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function studentPractice(?Placement $placement): array
    {
        $start = $placement?->start_date;
        $end = $placement?->end_date;

        if (! $start || ! $end) {
            return [
                'percent' => 0,
                'days_total' => 0,
                'days_elapsed' => 0,
                'days_left' => 0,
                'active' => false,
                'not_started' => false,
                'finished' => false,
                'start_date' => $start,
                'end_date' => $end,
            ];
        }

        $startTs = Carbon::parse($start)->startOfDay()->getTimestamp();
        $endTs = Carbon::parse($end)->startOfDay()->getTimestamp();
        $todayTs = now()->startOfDay()->getTimestamp();

        $total = max(1, (int) floor(($endTs - $startTs) / 86400) + 1);
        $elapsed = max(0, min($total, (int) floor(($todayTs - $startTs) / 86400) + 1));
        $left = max(0, (int) ceil(($endTs - $todayTs) / 86400));

        return [
            'percent' => $this->percent($elapsed, $total),
            'days_total' => $total,
            'days_elapsed' => $elapsed,
            'days_left' => $left,
            'active' => $todayTs >= $startTs && $todayTs <= $endTs,
            'not_started' => $todayTs < $startTs,
            'finished' => $todayTs > $endTs,
            'start_date' => $start,
            'end_date' => $end,
        ];
    }

    /**
     * @param  array{code: string, title: string}  $item
     * @param  Collection<int, Document>  $documents
     * @return array<string, mixed>
     */
    private function studentDocument(array $item, Collection $documents): array
    {
        /** @var Document|null $latest */
        $latest = $documents
            ->filter(fn (Document $document) => $document->documentType?->code === $item['code'])
            ->sortByDesc('id')
            ->first();

        $status = (int) ($latest?->approval_status ?? 0);

        return [
            'code' => $item['code'],
            'title' => $item['title'],
            'status' => $status,
            'status_label' => $this->documentStatusLabel($status),
            'comment' => $latest?->comment,
            'updated_at' => $latest?->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Actividad reciente construida con eventos reales del expediente,
     * la formalización, las entregas y las evaluaciones.
     *
     * @param  array<int, array<string, mixed>>  $dossierItems
     * @param  array<int, array<string, mixed>>  $placementItems
     * @param  Collection<int, PracticeSubmission>  $submissions
     * @param  Collection<int, Supervision>  $supervisions
     * @return array<int, array<string, mixed>>
     */
    private function studentActivity(
        ?Placement $placement,
        array $dossierItems,
        array $placementItems,
        Collection $submissions,
        Collection $supervisions,
    ): array {
        $events = collect();

        $push = function (string $title, ?string $detail, ?string $at, string $tone) use ($events) {
            if ($at) {
                $events->push(compact('title', 'detail', 'at', 'tone'));
            }
        };

        if ($placement) {
            $push('Formalización registrada', $placement->company?->name, $placement->created_at?->toIso8601String(), 'info');
        }

        foreach ([...$dossierItems, ...$placementItems] as $document) {
            if ($document['status'] === 0) {
                continue;
            }

            $push(
                "{$document['title']}: {$document['status_label']}",
                $document['comment'] ?? null,
                $document['updated_at'],
                $this->statusTone($document['status']),
            );
        }

        foreach ($submissions as $submission) {
            $title = $submission->type->title();
            $status = $submission->approval_status?->value ?? 0;

            $push("{$title} entregado", null, $submission->created_at?->toIso8601String(), 'info');

            if ($submission->reviewed_at) {
                $push(
                    "{$title}: {$this->practiceStatusLabel($status)}",
                    $submission->comment,
                    $submission->reviewed_at?->toIso8601String(),
                    $this->statusTone($status),
                );
            }
        }

        foreach ($supervisions as $supervision) {
            $evaluation = $supervision->evaluations->first();

            if ($evaluation) {
                $push(
                    "Módulo {$supervision->module_id} calificado",
                    $evaluation->grade !== null ? "Nota: {$evaluation->grade}" : null,
                    $evaluation->updated_at?->toIso8601String(),
                    'success',
                );
            }
        }

        return $events
            ->sortByDesc(fn (array $event) => strtotime($event['at']))
            ->take(8)
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $dossierItems
     * @param  array<int, array<string, mixed>>  $placementItems
     * @param  array<int, array<string, mixed>>  $submissions
     * @return array<int, array<string, mixed>>
     */
    private function studentTasks(
        ?Placement $placement,
        ?CompanyValidationRequest $request,
        array $dossierItems,
        array $placementItems,
        array $submissions,
        bool $canUpload,
        bool $cvUploaded,
    ): array {
        $tasks = [];

        $push = function (string $title, string $detail, string $href, string $priority) use (&$tasks) {
            $tasks[] = compact('title', 'detail', 'href', 'priority');
        };

        if (! $cvUploaded) {
            $push('Sube tu CV', 'Adjunta tu currículum para completar tu perfil de prácticas.', '/internship/cv', 'high');
        }

        if (! $placement) {
            if (! $request) {
                $push('Registra tu empresa de prácticas', 'Consulta el RUC y completa la solicitud de formalización.', '/internship', 'high');
            } elseif ($request->state === CompanyRequestState::ACCEPTED) {
                $push('Registra los datos de tu práctica', 'La empresa aceptó. Completa jefe inmediato, área y fechas.', '/internship', 'high');
            } elseif (in_array($request->state, [CompanyRequestState::OBSERVED, CompanyRequestState::REJECTED, CompanyRequestState::DECLINED], true)) {
                $push('Revisa tu solicitud de empresa', 'La solicitud tiene una observación o fue rechazada.', '/internship', 'high');
            } else {
                $push('Sigue el estado de tu empresa', 'Estamos esperando la validación o respuesta de la empresa.', '/internship', 'low');
            }
        } else {
            if ($placement->approval_status === 3) {
                $push('Corrige los datos de tu práctica', 'Los datos de formalización fueron observados.', '/internship', 'high');
            }

            foreach ($placementItems as $document) {
                if ($document['status'] === 3) {
                    $push("Corrige {$document['title']}", 'El documento fue observado. Vuelve a subirlo.', '/internship/formalization', 'high');
                } elseif ($document['status'] === 0) {
                    $push("Sube {$document['title']}", 'Documento obligatorio de formalización.', '/internship/formalization', 'medium');
                }
            }
        }

        foreach ($dossierItems as $document) {
            if ($document['status'] === 3) {
                $push("Corrige {$document['title']}", 'Tu expediente tiene una observación.', '/dossier', 'high');
            } elseif ($document['status'] === 0) {
                $push("Sube {$document['title']}", 'Documento obligatorio de tu expediente.', '/dossier', 'high');
            }
        }

        foreach ($submissions as $submission) {
            if ($submission['status'] === 3) {
                $push("Corrige {$submission['title']}", 'La entrega fue observada. Reenvíala.', '/internship/report-review', 'high');
            } elseif ($submission['status'] === 0) {
                $push(
                    "Entrega {$submission['title']}",
                    $canUpload ? 'Ya puedes subir tu documento.' : 'Se habilitará cuando se apruebe tu formalización.',
                    '/internship/report-review',
                    $canUpload ? 'medium' : 'low',
                );
            }
        }

        $order = ['high' => 0, 'medium' => 1, 'low' => 2];

        usort($tasks, fn (array $a, array $b) => $order[$a['priority']] <=> $order[$b['priority']]);

        return array_slice($tasks, 0, 6);
    }

    private function personName(?Person $person): string
    {
        return $person
            ? trim(($person->names ?? '').' '.($person->surnames ?? ''))
            : '';
    }

    private function documentStatusLabel(int $status): string
    {
        return match ($status) {
            1 => 'Aprobado',
            2 => 'En revisión',
            3 => 'Observado',
            default => 'Sin subir',
        };
    }

    private function practiceStatusLabel(int $status): string
    {
        return match ($status) {
            1 => 'Aprobado',
            2 => 'En revisión',
            3 => 'Observado',
            default => 'Sin entregar',
        };
    }

    private function supervisionStatusLabel(int $status): string
    {
        return match ($status) {
            1 => 'Aprobado',
            2 => 'Pendiente',
            3 => 'Observado',
            default => 'Sin iniciar',
        };
    }

    private function statusTone(int $status): string
    {
        return match ($status) {
            1 => 'success',
            3 => 'danger',
            2 => 'warning',
            default => 'muted',
        };
    }

    private function companyStateLabel(?CompanyRequestState $state): string
    {
        return match ($state) {
            CompanyRequestState::PENDING_REVIEW => 'Solicitud de empresa en revisión',
            CompanyRequestState::OBSERVED => 'Solicitud de empresa observada',
            CompanyRequestState::REJECTED => 'Solicitud de empresa rechazada',
            CompanyRequestState::AWAITING_COMPANY => 'Esperando respuesta de la empresa',
            CompanyRequestState::ACCEPTED => 'Empresa aceptada',
            CompanyRequestState::DECLINED => 'La empresa rechazó la solicitud',
            default => 'Sin solicitud de empresa',
        };
    }

    /**
     * @param  Collection<int, int>  $studentIds
     */
    private function studentRows(Collection $studentIds, bool $withAddress = false): array
    {
        return Assignment::whereIn('id', $studentIds)
            ->with(['user.person', 'placement.company', 'internship'])
            ->get()
            ->map(function (Assignment $student) use ($withAddress) {
                $person = $student->user?->person;
                $latest = PracticeSubmission::where('assignment_id', $student->id)->latest('id')->first();

                return [
                    'id' => $student->id,
                    'name' => trim(($person?->names ?? '').' '.($person?->surnames ?? '')) ?: $student->user?->name,
                    'company' => $student->placement?->company?->name ?? 'Sin empresa',
                    'address' => $withAddress ? $student->placement?->company?->address : null,
                    'status' => $this->studentStatus($student, $latest),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array{label: string, tone: string}
     */
    private function studentStatus(Assignment $student, ?PracticeSubmission $latest): array
    {
        if ($latest) {
            $what = $latest->type === PracticeSubmissionType::PLAN ? 'Plan' : 'Informe';

            return match ($latest->approval_status) {
                PracticeSubmissionStatus::OBSERVED => ['label' => "{$what} observado", 'tone' => 'danger'],
                PracticeSubmissionStatus::PENDING => ['label' => "{$what} en revisión", 'tone' => 'warning'],
                PracticeSubmissionStatus::APPROVED => ['label' => "{$what} aprobado", 'tone' => 'success'],
            };
        }

        return $student->placement
            ? ['label' => 'En práctica', 'tone' => 'info']
            : ['label' => 'Sin empresa', 'tone' => 'muted'];
    }

    /**
     * Próximas fechas de inicio y fin de práctica de los alumnos.
     *
     * @param  Collection<int, int>  $studentIds
     */
    private function agenda(Collection $studentIds): array
    {
        return Assignment::whereIn('id', $studentIds)
            ->whereHas('placement')
            ->with(['user.person', 'placement.company'])
            ->get()
            ->flatMap(function (Assignment $student) {
                $name = trim(($student->user?->person?->names ?? '').' '.($student->user?->person?->surnames ?? ''));

                return [
                    ['date' => $student->placement->start_date, 'event' => 'Inicio de práctica', 'name' => $name, 'company' => $student->placement->company?->name],
                    ['date' => $student->placement->end_date, 'event' => 'Fin de práctica', 'name' => $name, 'company' => $student->placement->company?->name],
                ];
            })
            ->filter(fn ($item) => $item['date'] && $item['date'] >= today()->toDateString())
            ->sortBy('date')
            ->take(6)
            ->map(fn ($item) => [...$item, 'date' => substr((string) $item['date'], 0, 10)])
            ->values()
            ->all();
    }

    private function studentsBySchool(int $semesterId, ?int $facultyId): array
    {
        return School::query()
            ->when($facultyId, fn ($q) => $q->where('faculty_id', $facultyId))
            ->withCount([
                'sections as students_count' => fn ($q) => $q->where('sections.semester_id', $semesterId)
                    ->join('assignments', 'assignments.section_id', '=', 'sections.id')
                    ->where('assignments.role_id', Role::ESTUDIANTE->value)
                    ->where('assignments.status', 1),
            ])
            ->get()
            ->filter(fn ($school) => $school->students_count > 0)
            ->sortByDesc('students_count')
            ->map(fn ($school) => ['school' => $school->name, 'students' => $school->students_count])
            ->values()
            ->all();
    }

    private function recentActions(): array
    {
        $labels = [
            'DOSSIER_UPLOAD' => 'Documento de expediente subido',
            'DOSSIER_VALIDATION' => 'Documento de expediente revisado',
            'EVALUATION_UPLOAD' => 'Evaluación de supervisión registrada',
            'EVALUATION_VALIDATION' => 'Evaluación de supervisión revisada',
            'PLACEMENT_REGISTER' => 'Datos de práctica registrados',
            'PLACEMENT_UPDATE' => 'Datos de práctica actualizados',
            'PLACEMENT_DATA_VALIDATION' => 'Datos de práctica revisados',
            'PLACEMENT_DOCUMENT_VALIDATION' => 'Documento de práctica revisado',
            'PLACEMENT_FINALIZED' => 'Formalización de práctica aprobada',
            'PRACTICE_REVIEW' => 'Plan o informe calificado',
            'VACANCY_SUBMITTED' => 'Vacante enviada a revisión',
            'VACANCY_REVIEWED' => 'Vacante revisada',
            'VACANCY_PUBLISHED' => 'Vacante publicada',
            'CANDIDATE_PROPOSED' => 'Candidato propuesto',
        ];

        return Notification::latest('id')->limit(5)->get()
            ->map(fn (Notification $n) => [
                'action' => $labels[$n->type] ?? 'Actividad en la plataforma',
                'at' => $n->created_at?->toIso8601String(),
            ])
            ->all();
    }

    private function storageUsage(): array
    {
        $root = Storage::disk('public')->path('');
        $used = 0;

        if (is_dir($root)) {
            foreach (File::allFiles($root) as $file) {
                $used += $file->getSize();
            }
        }

        $free = @disk_free_space(storage_path()) ?: null;
        $total = @disk_total_space(storage_path()) ?: null;

        return ['usedBytes' => $used, 'freeBytes' => $free, 'totalBytes' => $total];
    }

    /**
     * Uso actual de CPU y memoria del servidor (solo disponible en Linux, como en producción).
     */
    private function serverLoad(): array
    {
        $cpu = null;
        $memory = null;

        if (function_exists('sys_getloadavg') && ($load = @sys_getloadavg())) {
            $cpuinfo = is_readable('/proc/cpuinfo') ? (string) file_get_contents('/proc/cpuinfo') : '';
            $cores = max(1, substr_count($cpuinfo, 'processor'));
            $cpu = min(100, (int) round($load[0] / $cores * 100));
        }

        if (is_readable('/proc/meminfo')) {
            preg_match('/MemTotal:\s+(\d+)/', (string) file_get_contents('/proc/meminfo'), $total);
            preg_match('/MemAvailable:\s+(\d+)/', (string) file_get_contents('/proc/meminfo'), $available);

            if (! empty($total[1]) && ! empty($available[1])) {
                $memory = (int) round((1 - $available[1] / $total[1]) * 100);
            }
        }

        return ['cpuPercent' => $cpu, 'memoryPercent' => $memory];
    }

    private function percent(int|float $part, int|float $total): int
    {
        return $total > 0 ? (int) round($part / $total * 100) : 0;
    }
}
