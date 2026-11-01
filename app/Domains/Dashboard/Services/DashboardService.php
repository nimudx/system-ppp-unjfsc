<?php

namespace App\Domains\Dashboard\Services;

use App\Domains\Academic\Models\School;
use App\Domains\Academic\Models\Section;
use App\Domains\Company\Models\Company;
use App\Domains\Company\Models\CompanyValidationRequest;
use App\Domains\Documents\Models\Document;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\FailedLogin;
use App\Domains\Identity\Models\User;
use App\Domains\Notifications\Models\Notification;
use App\Domains\Notifications\Models\NotificationRecipient;
use App\Domains\Supervision\Enums\PracticeSubmissionStatus;
use App\Domains\Supervision\Enums\PracticeSubmissionType;
use App\Domains\Supervision\Models\Evaluation;
use App\Domains\Supervision\Models\InternshipGroup;
use App\Domains\Supervision\Models\PracticeSubmission;
use App\Domains\Supervision\Models\StudentGroup;
use App\Shared\Enums\Role;
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
