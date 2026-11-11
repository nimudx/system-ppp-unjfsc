<?php

use App\Domains\JobBoard\Enums\VacancyStatus;
use Database\Seeders\DatabaseSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('el subadmin solo ve y revisa vacantes de su facultad', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $biology = jobBoardSection('Biología');
    $subadmin = jobBoardAcademicAssignment(2, $systems);

    $ownFaculty = jobBoardVacancy($company, [$systems->school_id], [
        'status' => VacancyStatus::PENDING_REVIEW,
        'published_at' => null,
    ]);
    $otherFaculty = jobBoardVacancy($company, [$biology->school_id], [
        'status' => VacancyStatus::PENDING_REVIEW,
        'published_at' => null,
    ]);

    jobBoardLogin($this, $subadmin);

    $this->get('/bolsa/administracion')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('vacancies', 1)
            ->where('vacancies.0.id', $ownFaculty->id)
        );

    $this->getJson("/bolsa/administracion/{$otherFaculty->id}/detalle")->assertForbidden();
    $this->patch("/bolsa/administracion/{$otherFaculty->id}/revision", [
        'decision' => 'approve',
        'school_ids' => [$biology->school_id],
    ])->assertForbidden();

    $this->patch("/bolsa/administracion/{$ownFaculty->id}/revision", [
        'decision' => 'approve',
        'school_ids' => [$systems->school_id],
    ])->assertRedirect();

    expect($ownFaculty->fresh()->status)->toBe(VacancyStatus::PUBLISHED)
        ->and($otherFaculty->fresh()->status)->toBe(VacancyStatus::PENDING_REVIEW);
});

test('el admin global ve las vacantes de todas las facultades', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $biology = jobBoardSection('Biología');
    $admin = jobBoardAcademicAssignment(1);

    jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PENDING_REVIEW, 'published_at' => null]);
    $otherFaculty = jobBoardVacancy($company, [$biology->school_id], ['status' => VacancyStatus::PENDING_REVIEW, 'published_at' => null]);

    jobBoardLogin($this, $admin);

    $this->get('/bolsa/administracion')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('vacancies', 2));

    $this->patch("/bolsa/administracion/{$otherFaculty->id}/revision", [
        'decision' => 'approve',
        'school_ids' => [$biology->school_id],
    ])->assertRedirect();

    expect($otherFaculty->fresh()->status)->toBe(VacancyStatus::PUBLISHED);
});

test('el subadmin no puede confirmar escuelas de otra facultad', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $biology = jobBoardSection('Biología');
    $subadmin = jobBoardAcademicAssignment(2, $systems);

    $vacancy = jobBoardVacancy($company, [$systems->school_id], [
        'status' => VacancyStatus::PENDING_REVIEW,
        'published_at' => null,
    ]);

    jobBoardLogin($this, $subadmin);

    $this->patchJson("/bolsa/administracion/{$vacancy->id}/revision", [
        'decision' => 'approve',
        'school_ids' => [$systems->school_id, $biology->school_id],
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['school_ids']);

    expect($vacancy->fresh()->status)->toBe(VacancyStatus::PENDING_REVIEW)
        ->and($vacancy->schools()->pluck('schools.id')->all())->toBe([$systems->school_id]);
});
