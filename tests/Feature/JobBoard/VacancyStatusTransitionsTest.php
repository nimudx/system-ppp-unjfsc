<?php

use App\Domains\JobBoard\Enums\VacancyCloseReason;
use App\Domains\JobBoard\Enums\VacancyStatus;
use Database\Seeders\DatabaseSeeder;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('el flujo completo de una vacante respeta sus transiciones', function () {
    [$companyUser, $company] = jobBoardCompany();
    $admin = jobBoardAcademicAssignment(1);
    $schoolId = jobBoardSection()->school_id;

    $vacancy = jobBoardVacancy($company, [$schoolId]);

    // Empresa: borrador -> en revisión.
    jobBoardLoginCompany($this, $companyUser);
    $this->post("/empresa/bolsa/{$vacancy->id}/enviar")->assertRedirect();
    expect($vacancy->fresh()->status)->toBe(VacancyStatus::PENDING_REVIEW);

    // No se puede reenviar una vacante que ya está en revisión.
    $this->post("/empresa/bolsa/{$vacancy->id}/enviar")->assertForbidden();

    // Admin: en revisión -> observada (con comentario obligatorio).
    jobBoardLogin($this, $admin);
    $this->patch("/bolsa/administracion/{$vacancy->id}/revision", [
        'decision' => 'observe',
        'comment' => 'Falta precisar los requisitos.',
    ])->assertRedirect();

    $vacancy->refresh();
    expect($vacancy->status)->toBe(VacancyStatus::OBSERVED)
        ->and($vacancy->review_comment)->toBe('Falta precisar los requisitos.')
        ->and($vacancy->reviewed_by_assignment_id)->toBe($admin->id)
        ->and($vacancy->reviewed_at)->not->toBeNull();

    // Empresa: observada -> edición -> en revisión.
    jobBoardLoginCompany($this, $companyUser);
    $this->patch("/empresa/bolsa/{$vacancy->id}", jobBoardVacancyPayload(
        [$schoolId],
        ['title' => 'Desarrollador backend senior'],
    ))->assertRedirect();

    expect($vacancy->fresh()->title)->toBe('Desarrollador backend senior');

    $this->post("/empresa/bolsa/{$vacancy->id}/enviar")->assertRedirect();

    $vacancy->refresh();
    expect($vacancy->status)->toBe(VacancyStatus::PENDING_REVIEW)
        ->and($vacancy->review_comment)->toBeNull()
        ->and($vacancy->reviewed_at)->toBeNull();

    // Admin: en revisión -> publicada.
    jobBoardLogin($this, $admin);
    $this->patch("/bolsa/administracion/{$vacancy->id}/revision", [
        'decision' => 'approve',
        'school_ids' => [$schoolId],
    ])->assertRedirect();

    $vacancy->refresh();
    expect($vacancy->status)->toBe(VacancyStatus::PUBLISHED)
        ->and($vacancy->published_at)->not->toBeNull();

    // Empresa: ya no puede editar una vacante publicada.
    jobBoardLoginCompany($this, $companyUser);
    $this->get("/empresa/bolsa/{$vacancy->id}/editar")->assertForbidden();
    $this->patch("/empresa/bolsa/{$vacancy->id}", jobBoardVacancyPayload([$schoolId]))
        ->assertForbidden();

    // Admin: publicada -> cerrada.
    jobBoardLogin($this, $admin);
    $this->post("/bolsa/administracion/{$vacancy->id}/cerrar", ['reason' => 'filled'])
        ->assertRedirect();

    $vacancy->refresh();
    expect($vacancy->status)->toBe(VacancyStatus::CLOSED)
        ->and($vacancy->closed_reason)->toBe(VacancyCloseReason::FILLED)
        ->and($vacancy->closed_at)->not->toBeNull();
});

test('la empresa puede cerrar su propia vacante publicada', function () {
    [$companyUser, $company] = jobBoardCompany();
    $schoolId = jobBoardSection()->school_id;
    $vacancy = jobBoardVacancy($company, [$schoolId], ['status' => VacancyStatus::PUBLISHED]);

    jobBoardLoginCompany($this, $companyUser);

    $this->post("/empresa/bolsa/{$vacancy->id}/cerrar", ['reason' => 'withdrawn'])
        ->assertRedirect();

    expect($vacancy->fresh()->status)->toBe(VacancyStatus::CLOSED)
        ->and($vacancy->fresh()->closed_reason)->toBe(VacancyCloseReason::WITHDRAWN);
});

test('una vacante en borrador no se puede cerrar', function () {
    [$companyUser, $company] = jobBoardCompany();
    $vacancy = jobBoardVacancy($company, [jobBoardSection()->school_id]);

    jobBoardLoginCompany($this, $companyUser);

    $this->post("/empresa/bolsa/{$vacancy->id}/cerrar", ['reason' => 'filled'])
        ->assertForbidden();

    expect($vacancy->fresh()->status)->toBe(VacancyStatus::DRAFT);
});

test('el admin confirma y ajusta las escuelas destino al aprobar', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $biology = jobBoardSection('Biología');
    $admin = jobBoardAcademicAssignment(1);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], [
        'status' => VacancyStatus::PENDING_REVIEW,
        'published_at' => null,
    ]);

    jobBoardLogin($this, $admin);
    $this->patch("/bolsa/administracion/{$vacancy->id}/revision", [
        'decision' => 'approve',
        'school_ids' => [$biology->school_id],
    ])->assertRedirect();

    $vacancy->refresh();

    expect($vacancy->status)->toBe(VacancyStatus::PUBLISHED)
        ->and($vacancy->schools()->pluck('schools.id')->all())->toBe([$biology->school_id]);
});

test('aprobar exige confirmar al menos una escuela destino', function () {
    [, $company] = jobBoardCompany();
    $admin = jobBoardAcademicAssignment(1);
    $vacancy = jobBoardVacancy($company, [jobBoardSection()->school_id], [
        'status' => VacancyStatus::PENDING_REVIEW,
        'published_at' => null,
    ]);

    jobBoardLogin($this, $admin);

    $this->patchJson("/bolsa/administracion/{$vacancy->id}/revision", [
        'decision' => 'approve',
    ])->assertUnprocessable()->assertJsonValidationErrors(['school_ids']);

    expect($vacancy->fresh()->status)->toBe(VacancyStatus::PENDING_REVIEW);
});

test('el admin no puede revisar una vacante que no esta en revision', function () {
    [, $company] = jobBoardCompany();
    $admin = jobBoardAcademicAssignment(1);
    $vacancy = jobBoardVacancy($company, [jobBoardSection()->school_id]);

    jobBoardLogin($this, $admin);

    $this->patchJson("/bolsa/administracion/{$vacancy->id}/revision", [
        'decision' => 'approve',
        'school_ids' => [jobBoardSection()->school_id],
    ])
        ->assertStatus(409)
        ->assertJsonPath('code', 'VACANCY_INVALID_TRANSITION');

    expect($vacancy->fresh()->status)->toBe(VacancyStatus::DRAFT);
});

test('observar o rechazar exige un comentario', function () {
    [, $company] = jobBoardCompany();
    $admin = jobBoardAcademicAssignment(1);
    $vacancy = jobBoardVacancy($company, [jobBoardSection()->school_id], [
        'status' => VacancyStatus::PENDING_REVIEW,
        'published_at' => null,
    ]);

    jobBoardLogin($this, $admin);

    $this->patchJson("/bolsa/administracion/{$vacancy->id}/revision", [
        'decision' => 'reject',
    ])->assertUnprocessable()->assertJsonValidationErrors(['comment']);

    $this->patch("/bolsa/administracion/{$vacancy->id}/revision", [
        'decision' => 'reject',
        'comment' => 'No cumple con el perfil solicitado.',
    ])->assertRedirect();

    expect($vacancy->fresh()->status)->toBe(VacancyStatus::REJECTED);
});
