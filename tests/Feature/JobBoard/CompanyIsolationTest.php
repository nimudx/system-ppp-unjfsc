<?php

use App\Domains\JobBoard\Enums\VacancyStatus;
use Database\Seeders\DatabaseSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('una empresa solo ve sus propias vacantes en el listado', function () {
    [$userA, $companyA] = jobBoardCompany();
    [, $companyB] = jobBoardCompany();

    $schoolId = jobBoardSection()->school_id;
    $own = jobBoardVacancy($companyA, [$schoolId], ['title' => 'Vacante propia']);
    jobBoardVacancy($companyB, [$schoolId], ['title' => 'Vacante ajena']);

    jobBoardLoginCompany($this, $userA);

    $this->get('/empresa/bolsa')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('jobboard/company/index')
            ->has('vacancies', 1)
            ->where('vacancies.0.id', $own->id)
            ->where('company.name', $companyA->name)
        );
});

test('una empresa no puede editar ni enviar a revision vacantes ajenas', function () {
    [$userA] = jobBoardCompany();
    [, $companyB] = jobBoardCompany();

    $schoolId = jobBoardSection()->school_id;
    $foreign = jobBoardVacancy($companyB, [$schoolId]);

    jobBoardLoginCompany($this, $userA);

    $this->get("/empresa/bolsa/{$foreign->id}/editar")->assertForbidden();
    $this->patch("/empresa/bolsa/{$foreign->id}", jobBoardVacancyPayload([$schoolId]))
        ->assertForbidden();
    $this->post("/empresa/bolsa/{$foreign->id}/enviar")->assertForbidden();

    expect($foreign->fresh()->status)->toBe(VacancyStatus::DRAFT);
});

test('una empresa no puede cerrar una vacante ajena publicada', function () {
    [$userA] = jobBoardCompany();
    [, $companyB] = jobBoardCompany();

    $schoolId = jobBoardSection()->school_id;
    $foreign = jobBoardVacancy($companyB, [$schoolId], ['status' => VacancyStatus::PUBLISHED]);

    jobBoardLoginCompany($this, $userA);

    $this->post("/empresa/bolsa/{$foreign->id}/cerrar", ['reason' => 'filled'])
        ->assertForbidden();

    expect($foreign->fresh()->status)->toBe(VacancyStatus::PUBLISHED);
});

test('una empresa crea su vacante asociada a su propio registro', function () {
    [$userA, $companyA] = jobBoardCompany();
    $schoolId = jobBoardSection()->school_id;

    jobBoardLoginCompany($this, $userA);

    $this->post('/empresa/bolsa', jobBoardVacancyPayload([$schoolId]))
        ->assertRedirect(route('company.jobboard.index'));

    $this->assertDatabaseHas('vacancies', [
        'company_id' => $companyA->id,
        'title' => 'Desarrollador backend',
        'status' => VacancyStatus::DRAFT->value,
    ]);
});
