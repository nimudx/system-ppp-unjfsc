<?php

use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Models\VacancyCandidate;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Database\QueryException;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('un estudiante no puede ser propuesto dos veces para la misma vacante', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $student = jobBoardAcademicAssignment(5, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);

    jobBoardLogin($this, $teacher);

    $payload = ['student_ids' => [$student->id]];

    $this->post("/bolsa/vacantes/{$vacancy->id}/propuestas", $payload)->assertRedirect();
    $this->postJson("/bolsa/vacantes/{$vacancy->id}/propuestas", $payload)
        ->assertStatus(409)
        ->assertJsonPath('code', 'CANDIDATE_ALREADY_PROPOSED');

    expect(VacancyCandidate::count())->toBe(1);
});

test('el indice unico de la base impide duplicar candidatos', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $student = jobBoardAcademicAssignment(5, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);

    jobBoardCandidate($vacancy, $student, $teacher);

    expect(fn () => jobBoardCandidate($vacancy, $student, $teacher))
        ->toThrow(QueryException::class);
});

test('otro titular tampoco puede duplicar una propuesta existente', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $otherTeacher = jobBoardAcademicAssignment(3, $systems);
    $student = jobBoardAcademicAssignment(5, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);

    jobBoardCandidate($vacancy, $student, $teacher);

    jobBoardLogin($this, $otherTeacher);

    $this->postJson("/bolsa/vacantes/{$vacancy->id}/propuestas", [
        'student_ids' => [$student->id],
    ])
        ->assertStatus(409)
        ->assertJsonPath('code', 'CANDIDATE_ALREADY_PROPOSED');
});
