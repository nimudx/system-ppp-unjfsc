<?php

use App\Domains\Academic\Models\Section;
use App\Domains\Company\Models\Company;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\FailedLogin;
use App\Domains\Identity\Models\User;
use App\Domains\Supervision\Models\PracticeSubmission;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

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
    $subadmin = Assignment::with('section')->where('role_id', 2)->first();

    if (! $subadmin) {
        $section = Section::firstOrFail();
        $subadmin = Assignment::create([
            'user_id' => User::factory()->create()->id,
            'role_id' => 2,
            'semester_id' => $section->semester_id,
            'section_id' => $section->id,
            'status' => 1,
        ])->load('section');
    }

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

test('students get their own progress dashboard', function () {
    $student = Assignment::where('role_id', 5)->firstOrFail();

    $stats = dashboardStats($this, $student);

    expect($stats)->not->toBeNull()
        ->and($stats['meta']['name'])->not->toBeEmpty()
        ->and($stats['dossier'])->toHaveKeys(['approved', 'uploaded', 'total', 'percent', 'items'])
        ->and($stats['dossier']['total'])->toBe(2)
        ->and($stats['formalization'])->toHaveKeys(['state', 'state_label', 'percent', 'documents'])
        ->and($stats['practice'])->toHaveKeys(['percent', 'days_left', 'active'])
        ->and($stats['submissions'])->toHaveCount(2)
        ->and(collect($stats['submissions'])->pluck('type')->all())->toBe(['plan', 'report'])
        ->and($stats['supervision']['modules'])->toHaveCount(4)
        ->and($stats['tasks'])->toBeArray()
        ->and($stats['activity'])->toBeArray();
});

test('a failed login is recorded for the security panel', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'incorrecta']);

    expect(FailedLogin::where('email', $user->email)->exists())->toBeTrue();
});
