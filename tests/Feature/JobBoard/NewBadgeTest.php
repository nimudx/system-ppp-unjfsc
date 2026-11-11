<?php

use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Models\Vacancy;
use Database\Seeders\DatabaseSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('la etiqueta nuevo del admin desaparece al abrir el detalle', function () {
    [, $company] = jobBoardCompany();
    $admin = jobBoardAcademicAssignment(1);
    $vacancy = jobBoardVacancy($company, [jobBoardSection()->school_id], [
        'status' => VacancyStatus::PENDING_REVIEW,
        'published_at' => null,
    ]);

    jobBoardLogin($this, $admin);

    $this->get('/bolsa/administracion')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('vacancies.0.is_new', true));

    $this->getJson("/bolsa/administracion/{$vacancy->id}/detalle")->assertOk();

    $this->assertDatabaseHas('vacancy_views', [
        'vacancy_id' => $vacancy->id,
        'user_id' => $admin->user_id,
    ]);

    $this->get('/bolsa/administracion')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('vacancies.0.is_new', false));
});

test('una vacante antigua ya no es nueva para el admin', function () {
    [, $company] = jobBoardCompany();
    $admin = jobBoardAcademicAssignment(1);
    $vacancy = jobBoardVacancy($company, [jobBoardSection()->school_id], [
        'status' => VacancyStatus::PENDING_REVIEW,
        'published_at' => null,
    ]);

    Vacancy::query()->whereKey($vacancy->id)->update([
        'updated_at' => now()->subDays((int) config('jobboard.new_days') + 1),
    ]);

    jobBoardLogin($this, $admin);

    $this->get('/bolsa/administracion')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('vacancies.0.is_new', false));
});

test('la etiqueta nuevo del titular desaparece al abrir el detalle', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], [
        'status' => VacancyStatus::PUBLISHED,
    ]);

    jobBoardLogin($this, $teacher);

    $this->get('/bolsa/vacantes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('vacancies.0.is_new', true));

    $this->getJson("/bolsa/vacantes/{$vacancy->id}/detalle")->assertOk();

    $this->assertDatabaseHas('vacancy_views', [
        'vacancy_id' => $vacancy->id,
        'user_id' => $teacher->user_id,
    ]);

    $this->get('/bolsa/vacantes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('vacancies.0.is_new', false));
});

test('una vacante publicada hace mas de new_days no es nueva para el titular', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $teacher = jobBoardAcademicAssignment(3, $systems);
    jobBoardVacancy($company, [$systems->school_id], [
        'status' => VacancyStatus::PUBLISHED,
        'published_at' => now()->subDays((int) config('jobboard.new_days') + 1),
    ]);

    jobBoardLogin($this, $teacher);

    $this->get('/bolsa/vacantes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('vacancies.0.is_new', false));
});
