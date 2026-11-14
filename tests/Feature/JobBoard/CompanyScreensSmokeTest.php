<?php

use App\Domains\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('company jobboard screens render', function () {
    $this->seed();

    $company = User::query()
        ->where('email', 'empresa.demo@unjfsc.edu.pe')
        ->firstOrFail();

    $this->actingAs($company)
        ->get('/empresa/bolsa')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('jobboard/company/index')
            ->has('vacancies')
            ->has('company.name')
        );

    $this->actingAs($company)
        ->get('/empresa/bolsa/crear')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('jobboard/company/form')
            ->has('schools')
            ->has('options.types')
            ->has('options.modalities')
        );
});
