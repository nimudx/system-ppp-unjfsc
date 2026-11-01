<?php

use App\Domains\Identity\Models\Assignment;
use App\Domains\Requests\Models\UserRequest;
use App\Domains\Supervision\Models\InternshipGroup;
use Database\Seeders\Cycle2026Seeder;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed([DatabaseSeeder::class, Cycle2026Seeder::class]));

function manageAs($test, Assignment $sender, Assignment $target, array $data)
{
    $sender->update(['access_status' => 1, 'approval_status' => 1]);

    return $test->actingAs($sender->user)
        ->withSession(['assignment_id' => $sender->id, 'semester_id' => $sender->semester_id])
        ->from(route('academic.teachers.index'))
        ->post(route('academic.assignments.manage', $target), $data);
}

test('the administrator changes a titular teacher into a supervisor right away', function () {
    $admin = Assignment::where('role_id', 1)->firstOrFail();
    $teacher = Assignment::where('role_id', 3)->whereDoesntHave('teacherGroups')->firstOrFail();

    manageAs($this, $admin, $teacher, ['action' => 4, 'new_role_id' => 4, 'reason' => 'Registrado con rol incorrecto'])
        ->assertSessionHasNoErrors();

    expect($teacher->refresh()->role_id)->toBe(4);

    $request = UserRequest::where('type', 'CHANGE_ROLE')->firstOrFail();
    expect($request->approval_status)->toBe(1)
        ->and($request->payload)->toMatchArray(['from_role_id' => 3, 'to_role_id' => 4]);
});

test('the role cannot change while the teacher has internship groups', function () {
    $admin = Assignment::where('role_id', 1)->firstOrFail();
    $teacher = Assignment::where('role_id', 3)->firstOrFail();
    $supervisor = Assignment::where('role_id', 4)->firstOrFail();

    InternshipGroup::create([
        'name' => 'Grupo A', 'teacher_assignment_id' => $teacher->id, 'supervisor_assignment_id' => $supervisor->id,
        'section_id' => $teacher->section_id, 'module_id' => \App\Domains\Supervision\Models\Module::value('id'),
    ]);

    manageAs($this, $admin, $teacher, ['action' => 4, 'new_role_id' => 4, 'reason' => 'x'])
        ->assertSessionHasErrors('new_role_id');

    expect($teacher->refresh()->role_id)->toBe(3);
});

test('a titular teacher cannot change roles', function () {
    $teacher = Assignment::where('role_id', 3)->firstOrFail();
    $colleague = Assignment::where('role_id', 4)->where('section_id', $teacher->section_id)->first()
        ?? tap(Assignment::where('role_id', 4)->firstOrFail())->update(['section_id' => $teacher->section_id]);

    manageAs($this, $teacher, $colleague, ['action' => 4, 'new_role_id' => 3, 'reason' => 'x'])
        ->assertSessionHasErrors('new_role_id');

    expect($colleague->refresh()->role_id)->toBe(4);
});

test('only teacher roles can be switched', function () {
    $admin = Assignment::where('role_id', 1)->firstOrFail();
    $student = Assignment::where('role_id', 5)->firstOrFail();

    manageAs($this, $admin, $student, ['action' => 4, 'new_role_id' => 3, 'reason' => 'x'])
        ->assertSessionHasErrors('new_role_id');

    expect($student->refresh()->role_id)->toBe(5);
});
