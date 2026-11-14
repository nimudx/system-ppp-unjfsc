<?php

use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('admin jobboard screen renders', function () {
    $this->seed();

    $admin = User::query()
        ->where('email', 'brunoadmin@gmail.com')
        ->firstOrFail();

    $assignment = Assignment::query()
        ->where('user_id', $admin->id)
        ->where('role_id', 1)
        ->firstOrFail();

    $this->actingAs($admin)
        ->withSession([
            'assignment_id' => $assignment->id,
            'semester_id' => $assignment->semester_id,
        ])
        ->get('/bolsa/administracion')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('jobboard/admin/index')
            ->has('vacancies')
            ->has('statuses')
            ->has('candidate_statuses')
            ->where('jobboard.menuBadgeUntil', config('jobboard.menu_badge_until'))
        );
});

test('teacher jobboard screen renders', function () {
    $this->seed();

    $teacher = User::query()
        ->where('email', 'brunotitular@unjfsc.edu.pe')
        ->firstOrFail();

    $assignment = Assignment::query()
        ->where('user_id', $teacher->id)
        ->where('role_id', 3)
        ->firstOrFail();

    $this->actingAs($teacher)
        ->withSession([
            'assignment_id' => $assignment->id,
            'semester_id' => $assignment->semester_id,
        ])
        ->get('/bolsa/vacantes')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('jobboard/teacher/index')
            ->has('vacancies')
            ->where('teacher.assignment_id', $assignment->id)
        );
});
