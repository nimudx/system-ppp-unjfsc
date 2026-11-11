<?php

use App\Domains\Identity\Models\User;
use App\Domains\JobBoard\Models\Vacancy;
use Database\Seeders\DatabaseSeeder;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('una empresa sin activar no puede entrar ni publicar en la bolsa laboral', function () {
    [$user] = jobBoardCompany(['activated_at' => null]);
    jobBoardLoginCompany($this, $user);

    $this->get('/empresa/bolsa')->assertForbidden();
    $this->get('/empresa/bolsa/crear')->assertForbidden();
    $this->post('/empresa/bolsa', jobBoardVacancyPayload([jobBoardSection()->school_id]))
        ->assertForbidden();

    expect(Vacancy::count())->toBe(0);
});

test('una empresa inactiva no puede publicar aunque su cuenta este activa', function () {
    [$user] = jobBoardCompany(['status' => 0]);
    jobBoardLoginCompany($this, $user);

    $this->get('/empresa/bolsa')->assertForbidden();
    $this->post('/empresa/bolsa', jobBoardVacancyPayload([jobBoardSection()->school_id]))
        ->assertForbidden();

    expect(Vacancy::count())->toBe(0);
});

test('una cuenta de empresa sin registro de empresa no puede publicar', function () {
    $user = User::query()->create([
        'person_id' => null,
        'name' => 'empresa.suelta',
        'email' => 'empresa.suelta@example.test',
        'password' => 'password',
        'type_user_id' => 3,
        'status' => 1,
    ]);

    jobBoardLoginCompany($this, $user);

    $this->get('/empresa/bolsa')->assertForbidden();
    $this->get('/empresa/bolsa/crear')->assertForbidden();
});

test('un usuario academico no entra al area de empresas', function () {
    $teacher = jobBoardAcademicAssignment(3);
    jobBoardLogin($this, $teacher);

    $this->get('/empresa/bolsa')->assertRedirect(route('dashboard'));
});
