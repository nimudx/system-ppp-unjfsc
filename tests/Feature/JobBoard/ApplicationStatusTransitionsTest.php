<?php

use App\Domains\JobBoard\Enums\CandidateStatus;
use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Models\VacancyCandidate;
use Database\Seeders\DatabaseSeeder;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('el admin actualiza el estado de un candidato propuesto', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $admin = jobBoardAcademicAssignment(1);
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $student = jobBoardAcademicAssignment(5, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);
    $candidate = jobBoardCandidate($vacancy, $student, $teacher);

    jobBoardLogin($this, $admin);

    $this->patch("/bolsa/administracion/{$vacancy->id}/candidatos/{$candidate->id}", [
        'status' => 'contacted',
        'status_note' => 'Se contactó por teléfono.',
    ])->assertRedirect();

    $candidate->refresh();
    expect($candidate->status)->toBe(CandidateStatus::CONTACTED)
        ->and($candidate->status_note)->toBe('Se contactó por teléfono.');

    $this->patch("/bolsa/administracion/{$vacancy->id}/candidatos/{$candidate->id}", [
        'status' => 'hired',
    ])->assertRedirect();

    expect($candidate->fresh()->status)->toBe(CandidateStatus::HIRED);

    $this->patch("/bolsa/administracion/{$vacancy->id}/candidatos/{$candidate->id}", [
        'status' => 'discarded',
    ])->assertRedirect();

    expect($candidate->fresh()->status)->toBe(CandidateStatus::DISCARDED);
});

test('el admin no puede volver un candidato al estado propuesto', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $admin = jobBoardAcademicAssignment(1);
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $student = jobBoardAcademicAssignment(5, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);
    $candidate = jobBoardCandidate($vacancy, $student, $teacher);

    jobBoardLogin($this, $admin);

    $this->patchJson("/bolsa/administracion/{$vacancy->id}/candidatos/{$candidate->id}", [
        'status' => 'proposed',
    ])->assertUnprocessable()->assertJsonValidationErrors(['status']);

    expect($candidate->fresh()->status)->toBe(CandidateStatus::PROPOSED);
});

test('el titular retira su propuesta mientras sigue propuesta', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $student = jobBoardAcademicAssignment(5, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);
    $candidate = jobBoardCandidate($vacancy, $student, $teacher);

    jobBoardLogin($this, $teacher);

    $this->delete("/bolsa/vacantes/{$vacancy->id}/propuestas/{$candidate->id}")
        ->assertRedirect();

    expect(VacancyCandidate::find($candidate->id))->toBeNull();
});

test('el titular no puede retirar una propuesta ya contactada', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $student = jobBoardAcademicAssignment(5, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);
    $candidate = jobBoardCandidate($vacancy, $student, $teacher, [
        'status' => CandidateStatus::CONTACTED,
    ]);

    jobBoardLogin($this, $teacher);

    $this->delete("/bolsa/vacantes/{$vacancy->id}/propuestas/{$candidate->id}")
        ->assertForbidden();

    expect(VacancyCandidate::find($candidate->id))->not->toBeNull();
});

test('no se puede gestionar un candidato que pertenece a otra vacante', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $admin = jobBoardAcademicAssignment(1);
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $student = jobBoardAcademicAssignment(5, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);
    $otherVacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);
    $candidate = jobBoardCandidate($vacancy, $student, $teacher);

    jobBoardLogin($this, $admin);

    $this->patch("/bolsa/administracion/{$otherVacancy->id}/candidatos/{$candidate->id}", [
        'status' => 'contacted',
    ])->assertNotFound();
});

test('el titular no puede usar los endpoints de administracion', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $student = jobBoardAcademicAssignment(5, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);
    $candidate = jobBoardCandidate($vacancy, $student, $teacher);

    jobBoardLogin($this, $teacher);

    $this->patch("/bolsa/administracion/{$vacancy->id}/candidatos/{$candidate->id}", [
        'status' => 'contacted',
    ])->assertRedirect(route('dashboard'));

    expect($candidate->fresh()->status)->toBe(CandidateStatus::PROPOSED);
});
