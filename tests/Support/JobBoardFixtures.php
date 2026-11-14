<?php

use App\Domains\Academic\Models\Section;
use App\Domains\Academic\Models\Semester;
use App\Domains\Company\Models\Company;
use App\Domains\Identity\Enums\AssignmentAccessStatus;
use App\Domains\Identity\Enums\AssignmentApprovalStatus;
use App\Domains\Identity\Enums\AssignmentReviewStatus;
use App\Domains\Identity\Enums\AssignmentStatus;
use App\Domains\Identity\Enums\PersonStatus;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\Person;
use App\Domains\Identity\Models\User;
use App\Domains\JobBoard\Enums\CandidateStatus;
use App\Domains\JobBoard\Enums\VacancyModality;
use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Enums\VacancyType;
use App\Domains\JobBoard\Models\Vacancy;
use App\Domains\JobBoard\Models\VacancyCandidate;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Fixtures compartidos de la Bolsa Laboral
|--------------------------------------------------------------------------
|
| Las pruebas del módulo parten del catálogo real (DatabaseSeeder) y crean
| actores adicionales con estos helpers. Se evita depender de factories que
| todavía no existen para el módulo.
|
*/

if (! function_exists('jobBoardSequence')) {
    function jobBoardSequence(): int
    {
        static $sequence = 0;

        return ++$sequence;
    }
}

if (! function_exists('jobBoardSemester')) {
    function jobBoardSemester(): Semester
    {
        return Semester::query()->where('code', '2026-I')->firstOrFail();
    }
}

if (! function_exists('jobBoardSection')) {
    function jobBoardSection(string $schoolName = 'Ingeniería de Sistemas'): Section
    {
        return Section::query()
            ->whereHas('school', fn ($query) => $query->where('name', $schoolName))
            ->where('semester_id', jobBoardSemester()->id)
            ->firstOrFail();
    }
}

if (! function_exists('jobBoardAcademicAssignment')) {
    /**
     * Persona + usuario + asignación académica completa para un rol del sistema.
     *
     * @param  array<string, mixed>  $assignmentOverrides
     */
    function jobBoardAcademicAssignment(
        int $roleId,
        ?Section $section = null,
        array $assignmentOverrides = [],
        ?User $user = null,
    ): Assignment {
        $section ??= jobBoardSection();

        if ($user === null) {
            $sequence = jobBoardSequence();

            $person = Person::query()->create([
                'dni' => (string) (81000000 + $sequence),
                'names' => 'Usuario',
                'surnames' => "Prueba {$sequence}",
                'phone' => '9'.(70000000 + $sequence),
                'gender' => 'male',
                'status' => PersonStatus::ACTIVE,
            ]);

            $user = User::query()->create([
                'person_id' => $person->id,
                'name' => "usuario.prueba.{$sequence}",
                'email' => "usuario.prueba.{$sequence}@unjfsc.edu.pe",
                'password' => 'password',
                'type_user_id' => 2,
                'status' => 1,
            ]);
        }

        return Assignment::query()->create([
            'user_id' => $user->id,
            'role_id' => $roleId,
            'semester_id' => $section->semester_id,
            'section_id' => $section->id,
            'access_status' => AssignmentAccessStatus::FULL,
            'approval_status' => AssignmentApprovalStatus::APPROVED,
            'review_status' => AssignmentReviewStatus::NONE,
            'status' => AssignmentStatus::ACTIVE,
            'is_select' => false,
            ...$assignmentOverrides,
        ]);
    }
}

if (! function_exists('jobBoardCompany')) {
    /**
     * Cuenta de empresa activable con su registro Company.
     *
     * @param  array<string, mixed>  $companyOverrides
     * @return array{0: User, 1: Company}
     */
    function jobBoardCompany(array $companyOverrides = [], ?User $user = null): array
    {
        $sequence = jobBoardSequence();

        if ($user === null) {
            $user = User::query()->create([
                'person_id' => null,
                'name' => "empresa.prueba.{$sequence}",
                'email' => "empresa.prueba.{$sequence}@example.test",
                'password' => 'password',
                'type_user_id' => 3,
                'status' => 1,
            ]);
        }

        $company = Company::query()->create([
            'name' => "Empresa Prueba {$sequence}",
            'ruc' => (string) (20900000000 + $sequence),
            'razon' => "Empresa Prueba {$sequence} S.A.C.",
            'address' => 'Dirección de prueba 123',
            'phone' => '999888777',
            'email' => "empresa.prueba.{$sequence}@example.test",
            'status' => 1,
            'account_user_id' => $user->id,
            'representative_name' => 'Representante de prueba',
            'representative_phone' => '999777666',
            'activated_at' => now(),
            ...$companyOverrides,
        ]);

        return [$user, $company];
    }
}

if (! function_exists('jobBoardVacancy')) {
    /**
     * @param  array<int, int>  $schoolIds
     * @param  array<string, mixed>  $overrides
     */
    function jobBoardVacancy(Company $company, array $schoolIds, array $overrides = []): Vacancy
    {
        $status = $overrides['status'] ?? VacancyStatus::DRAFT;
        $statusValue = $status instanceof VacancyStatus ? $status : VacancyStatus::from((string) $status);

        $data = [
            'company_id' => $company->id,
            'semester_id' => jobBoardSemester()->id,
            'title' => 'Vacante de prueba',
            'description' => 'Descripción de la vacante de prueba.',
            'type' => VacancyType::PRACTICAS,
            'modality' => VacancyModality::REMOTO,
            'area_name' => 'Tecnología',
            'location' => 'Huacho',
            'positions_count' => 2,
            'requirements' => 'Conocimientos básicos de desarrollo.',
            'status' => $statusValue,
            'published_at' => $statusValue === VacancyStatus::PUBLISHED ? now() : null,
            ...$overrides,
        ];

        $vacancy = Vacancy::query()->create($data);
        $vacancy->schools()->sync($schoolIds);

        return $vacancy->refresh()->load('schools');
    }
}

if (! function_exists('jobBoardVacancyPayload')) {
    /**
     * @param  array<int, int>  $schoolIds
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    function jobBoardVacancyPayload(array $schoolIds, array $overrides = []): array
    {
        return [
            'title' => 'Desarrollador backend',
            'description' => 'Buscamos un practicante para el área de desarrollo.',
            'type' => VacancyType::PRACTICAS->value,
            'modality' => VacancyModality::HIBRIDO->value,
            'area_name' => 'Tecnología',
            'location' => 'Huacho',
            'positions_count' => 2,
            'requirements' => 'Conocimientos de PHP y SQL.',
            'school_ids' => $schoolIds,
            ...$overrides,
        ];
    }
}

if (! function_exists('jobBoardCandidate')) {
    /**
     * @param  array<string, mixed>  $overrides
     */
    function jobBoardCandidate(
        Vacancy $vacancy,
        Assignment $student,
        Assignment $teacher,
        array $overrides = [],
    ): VacancyCandidate {
        return VacancyCandidate::query()->create([
            'vacancy_id' => $vacancy->id,
            'student_assignment_id' => $student->id,
            'proposed_by_assignment_id' => $teacher->id,
            'note' => 'Candidato de prueba.',
            'status' => CandidateStatus::PROPOSED,
            ...$overrides,
        ]);
    }
}

if (! function_exists('jobBoardLogin')) {
    /**
     * Autentica al usuario de una asignación y fija su contexto académico.
     */
    function jobBoardLogin(TestCase $test, Assignment $assignment): void
    {
        $test->actingAs($assignment->user)->withSession([
            'assignment_id' => $assignment->id,
            'semester_id' => $assignment->semester_id,
        ]);
    }
}

if (! function_exists('jobBoardLoginCompany')) {
    function jobBoardLoginCompany(TestCase $test, User $user): void
    {
        $test->actingAs($user);
    }
}
