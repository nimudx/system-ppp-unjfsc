<?php

use App\Domains\Company\Models\Company;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\FailedLogin;
use App\Domains\Identity\Models\User;
use App\Domains\Supervision\Models\PracticeSubmission;
use Database\Seeders\Cycle2026Seeder;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed([DatabaseSeeder::class, Cycle2026Seeder::class]));

function dashboardStats($test, Assignment $assignment): ?array
{
    return $test->actingAs($assignment->user)
        ->withSession(['assignment_id' => $assignment->id, 'semester_id' => $assignment->semester_id])
        ->get(route('dashboard'))
        ->assertOk()
        ->viewData('page')['props']['stats'];
}

test('the titular teacher dashboard counts the real students of the section', function () {
    $teacher = Assignment::where('role_id', 3)->firstOrFail();
    Assignment::where('role_id', 5)->firstOrFail()
        ->update(['section_id' => $teacher->section_id, 'semester_id' => $teacher->semester_id]);
    $sectionStudents = Assignment::where('role_id', 5)->where('section_id', $teacher->section_id)
        ->where('semester_id', $teacher->semester_id)->where('status', 1);

    PracticeSubmission::create(['assignment_id' => $sectionStudents->value('id'), 'type' => 'plan', 'approval_status' => 2]);

    $stats = dashboardStats($this, $teacher);

    expect($stats['students'])->toBe($sectionStudents->count())
        ->and($stats['pendingReports'])->toBe(['total' => 1, 'plans' => 1, 'reports' => 0])
        ->and($stats['recentStudents'])->not->toBeEmpty();
});

test('the subadmin dashboard only counts students of their faculty', function () {
    $subadmin = Assignment::with('section')->where('role_id', 2)->firstOrFail();

    $stats = dashboardStats($this, $subadmin);

    expect($stats['students']['total'])->toBe(
        Assignment::where('role_id', 5)->where('semester_id', $subadmin->semester_id)->where('status', 1)
            ->whereHas('section', fn ($q) => $q->where('faculty_id', $subadmin->section->faculty_id))
            ->count()
    )->and($stats['bySchool'])->toBeArray();
});

test('the general administrator dashboard shows real totals and failed logins', function () {
    $admin = User::where('type_user_id', 1)->firstOrFail();
    FailedLogin::create(['email' => 'x@example.com', 'ip' => '1.1.1.1']);

    $stats = $this->actingAs($admin)->get(route('dashboard'))->assertOk()->viewData('page')['props']['stats'];

    expect($stats['companies']['total'])->toBe(Company::count())
        ->and($stats['users']['total'])->toBe(User::count())
        ->and($stats['security']['failedToday'])->toBe(1);
});

test('students get no statistics', function () {
    expect(dashboardStats($this, Assignment::where('role_id', 5)->firstOrFail()))->toBeNull();
});

test('a failed login is recorded for the security panel', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'incorrecta']);

    expect(FailedLogin::where('email', $user->email)->exists())->toBeTrue();
});
