<?php

use App\Domains\Academic\Models\Semester;
use App\Domains\Identity\Enums\AssignmentApprovalStatus;
use App\Domains\Identity\Enums\AssignmentStatus;
use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Models\VacancyCandidate;
use Database\Seeders\DatabaseSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('el titular solo ve las vacantes publicadas para su escuela', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $biology = jobBoardSection('Biología');
    $teacher = jobBoardAcademicAssignment(3, $systems);

    $own = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);
    $other = jobBoardVacancy($company, [$biology->school_id], ['status' => VacancyStatus::PUBLISHED]);

    jobBoardLogin($this, $teacher);

    $this->get('/bolsa/vacantes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('jobboard/teacher/index')
            ->has('vacancies', 1)
            ->where('vacancies.0.id', $own->id)
        );

    $this->getJson("/bolsa/vacantes/{$other->id}/detalle")->assertForbidden();
});

test('el detalle del titular no expone los datos de contacto de la empresa', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);

    jobBoardLogin($this, $teacher);

    $this->getJson("/bolsa/vacantes/{$vacancy->id}/detalle")
        ->assertOk()
        ->assertJsonPath('contact', null)
        ->assertJsonStructure(['students', 'candidates', 'schools']);
});

test('el titular propone un estudiante elegible de su seccion y semestre', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $student = jobBoardAcademicAssignment(5, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);

    jobBoardLogin($this, $teacher);

    $this->post("/bolsa/vacantes/{$vacancy->id}/propuestas", [
        'student_ids' => [$student->id],
        'note' => 'Buen rendimiento académico.',
    ])->assertRedirect();

    $this->assertDatabaseHas('vacancy_candidates', [
        'vacancy_id' => $vacancy->id,
        'student_assignment_id' => $student->id,
        'proposed_by_assignment_id' => $teacher->id,
        'status' => 'proposed',
    ]);
});

test('el titular no puede proponer estudiantes inelegibles', function (string $case) {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);

    $student = match ($case) {
        'otra_seccion' => jobBoardAcademicAssignment(5, jobBoardSection('Biología')),
        'inactivo' => jobBoardAcademicAssignment(5, $systems, ['status' => AssignmentStatus::INACTIVE]),
        'no_aprobado' => jobBoardAcademicAssignment(5, $systems, ['approval_status' => AssignmentApprovalStatus::PENDING]),
        'otro_rol' => jobBoardAcademicAssignment(4, $systems),
        'otro_semestre' => (function () use ($systems) {
            $semester = Semester::query()->create([
                'code' => '2025-II',
                'cycle' => 'II',
                'status' => 0,
            ]);

            return jobBoardAcademicAssignment(5, $systems, ['semester_id' => $semester->id]);
        })(),
    };

    jobBoardLogin($this, $teacher);

    $this->postJson("/bolsa/vacantes/{$vacancy->id}/propuestas", [
        'student_ids' => [$student->id],
    ])
        ->assertStatus(422)
        ->assertJsonPath('code', 'CANDIDATE_NOT_ELIGIBLE');

    expect(VacancyCandidate::count())->toBe(0);
})->with(['otra_seccion', 'inactivo', 'no_aprobado', 'otro_rol', 'otro_semestre']);

test('el titular no puede proponer sobre una vacante no publicada', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $student = jobBoardAcademicAssignment(5, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id]);

    jobBoardLogin($this, $teacher);

    $this->post("/bolsa/vacantes/{$vacancy->id}/propuestas", [
        'student_ids' => [$student->id],
    ])->assertForbidden();

    expect(VacancyCandidate::count())->toBe(0);
});

test('un estudiante inexistente es rechazado por la validacion', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);

    jobBoardLogin($this, $teacher);

    $this->postJson("/bolsa/vacantes/{$vacancy->id}/propuestas", [
        'student_ids' => [999999],
    ])->assertUnprocessable()->assertJsonValidationErrors(['student_ids.0']);
});
