<?php

use App\Domains\Academic\Models\Faculty;
use App\Domains\Academic\Models\School;
use App\Domains\Academic\Models\Section;
use App\Domains\Academic\Models\Semester;
use App\Domains\Documents\Models\Document;
use App\Domains\Dossier\Models\Dossier;
use App\Domains\Identity\Enums\AssignmentAccessStatus;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Supervision\Models\InternshipGroup;
use Database\Seeders\Cycle2026Seeder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed([DatabaseSeeder::class, Cycle2026Seeder::class]);
    Storage::fake('public');
});

function operationalAssignment(int $role): Assignment
{
    $assignment = Assignment::where('role_id', $role)->firstOrFail();
    $assignment->update(['access_status' => 1, 'approval_status' => 1]);

    return $assignment->refresh();
}

function enterOperationalProfile($test, Assignment $assignment): void
{
    $test->actingAs($assignment->user)->withSession([
        'assignment_id' => $assignment->id,
        'semester_id' => $assignment->semester_id,
    ]);
}

test('existing screens load for their intended profiles', function (int $role, string $name) {
    enterOperationalProfile($this, operationalAssignment($role));
    $response = $this->get(route($name))->assertOk();
    $component = $response->viewData('page')['component'];
    [$module, $page] = explode('/', $component, 2);

    expect(is_file(resource_path("js/modules/{$module}/pages/{$page}.tsx")))->toBeTrue();
})->with([
    'administrator dashboard' => [1, 'dashboard'],
    'faculties' => [1, 'academic.faculties.index'],
    'schools' => [1, 'academic.schools.index'],
    'sections' => [1, 'academic.sections.index'],
    'semesters' => [1, 'academic.semesters.index'],
    'group administration' => [1, 'academic.groups.internship'],
    'student grouping' => [1, 'academic.groups.student'],
    'internship review' => [1, 'academic.internship.validation'],
    'supervision review' => [1, 'academic.supervision.validation'],
    'document settings' => [1, 'settings.academic.document'],
    'workflow settings' => [1, 'settings.academic.internship'],
    'registration management' => [1, 'register.index'],
    'subadministrator dashboard' => [2, 'dashboard'],
    'teacher dossier' => [3, 'academic.dossiers.submission'],
    'teacher students' => [3, 'academic.students.index'],
    'supervisor dossier' => [4, 'academic.dossiers.submission'],
    'supervisor groups' => [4, 'academic.groups.supervision'],
    'supervisor evaluation' => [4, 'academic.supervision.submission'],
    'student dossier' => [5, 'academic.dossiers.submission'],
    'student formalization' => [5, 'academic.internship.submission'],
    'student supervision' => [5, 'academic.supervision.student'],
    'student resources' => [5, 'resource.index'],
]);

test('an administrator can manage academic structure through the moved routes', function () {
    enterOperationalProfile($this, operationalAssignment(1));

    $this->post(route('academic.faculties.store'), ['name' => 'Facultad de prueba', 'status' => 1])
        ->assertSessionHasNoErrors()->assertRedirect();
    $faculty = Faculty::where('name', 'Facultad de prueba')->firstOrFail();

    $this->post(route('academic.schools.store', $faculty), ['name' => 'Escuela de prueba', 'status' => 1])
        ->assertSessionHasNoErrors()->assertRedirect();
    $school = School::where('name', 'Escuela de prueba')->firstOrFail();

    $this->post(route('academic.sections.store', $school), ['name' => 'CAPACITACIÓN'])
        ->assertSessionHasNoErrors()->assertRedirect();
    $section = Section::where('school_id', $school->id)->firstOrFail();

    $this->delete(route('academic.sections.destroy', $section))->assertRedirect();
    $this->delete(route('academic.schools.destroy', $school))->assertRedirect();
    $this->delete(route('academic.faculties.destroy', $faculty))->assertRedirect();
    $this->assertDatabaseMissing('faculties', ['id' => $faculty->id]);
});

test('a student can submit correct and complete a dossier reviewed by an administrator', function () {
    $student = operationalAssignment(5);
    $admin = operationalAssignment(1);
    $dossier = Dossier::create(['assignment_id' => $student->id]);
    $student->update(['access_status' => AssignmentAccessStatus::LIMITED, 'approval_status' => 2]);

    enterOperationalProfile($this, $student);
    $this->post(route('academic.dossiers.document.store'), [
        'target_id' => $dossier->id, 'code' => 'ficha',
        'file' => UploadedFile::fake()->create('ficha_v1.pdf', 20, 'application/pdf'),
    ])->assertSessionHasNoErrors()->assertRedirect();
    $v1 = Document::latest('id')->firstOrFail();
    Storage::disk('public')->assertExists($v1->path);

    enterOperationalProfile($this, $admin);
    $this->patch(route('academic.dossiers.document.status', $v1), [
        'approval_status' => 3, 'comment' => 'Corregir el ejemplo',
    ])->assertSessionHasNoErrors()->assertRedirect();

    enterOperationalProfile($this, $student);
    $this->post(route('academic.dossiers.document.store'), [
        'target_id' => $dossier->id, 'code' => 'ficha',
        'file' => UploadedFile::fake()->create('ficha_v2.pdf', 20, 'application/pdf'),
    ])->assertSessionHasNoErrors()->assertRedirect();
    $v2 = Document::latest('id')->firstOrFail();

    expect($v2->path)->not->toBe($v1->path);
    expect($v1->fresh()->approval_status)->toBe(3);

    enterOperationalProfile($this, $admin);
    $this->patch(route('academic.dossiers.document.status', $v2), ['approval_status' => 1])
        ->assertSessionHasNoErrors()->assertRedirect();

    enterOperationalProfile($this, $student);
    $this->post(route('academic.dossiers.document.store'), [
        'target_id' => $dossier->id, 'code' => 'record',
        'file' => UploadedFile::fake()->create('record.pdf', 20, 'application/pdf'),
    ])->assertSessionHasNoErrors()->assertRedirect();
    $record = Document::latest('id')->firstOrFail();

    enterOperationalProfile($this, $admin);
    $this->patch(route('academic.dossiers.document.status', $record), ['approval_status' => 1])
        ->assertSessionHasNoErrors()->assertRedirect();

    expect($dossier->fresh()->approval_status->value ?? $dossier->fresh()->approval_status)->toBe(1);
    expect($student->fresh()->access_status)->toBe(AssignmentAccessStatus::FULL);
});

test('groups connect teacher supervisor and student after the domain move', function () {
    $admin = operationalAssignment(1);
    $teacher = operationalAssignment(3);
    $supervisor = operationalAssignment(4);
    $student = operationalAssignment(5);
    $section = $student->section;
    $teacher->update(['section_id' => $section->id]);
    $supervisor->update(['section_id' => $section->id]);

    enterOperationalProfile($this, $admin);
    $this->post(route('academic.groups.store'), [
        'name' => 'CAPACITACIÓN',
        'teacher_assignment_id' => $teacher->id,
        'supervisor_assignment_id' => $supervisor->id,
        'section_id' => $section->id,
        'student_ids' => [$student->id],
    ])->assertSessionHasNoErrors()->assertRedirect();

    $group = InternshipGroup::where('name', 'CAPACITACIÓN')->firstOrFail();
    expect($group->students->modelKeys())->toBe([$student->id]);

    enterOperationalProfile($this, $supervisor);
    $this->get(route('academic.groups.supervision'))->assertOk();
    $this->get(route('academic.groups.api.supervision_students', $group))->assertOk();

    enterOperationalProfile($this, $student);
    $this->get(route('academic.supervision.student'))->assertOk();
});

test('students cannot open academic administration screens', function () {
    enterOperationalProfile($this, operationalAssignment(5));
    $this->get(route('academic.faculties.index'))->assertRedirect(route('dashboard'))->assertSessionHas('error');
});

test('closed semesters block writes and retain read access', function () {
    $student = operationalAssignment(5);
    Semester::findOrFail($student->semester_id)->update(['status' => 0]);
    enterOperationalProfile($this, $student);

    $this->get(route('academic.dossiers.submission'))->assertOk();
    $this->postJson(route('academic.dossiers.document.store'), [])->assertForbidden()
        ->assertJsonPath('code', 'SEMESTER_CLOSED_READ_ONLY');
});

test('administrative registration persists the person user and assignment', function () {
    enterOperationalProfile($this, operationalAssignment(1));
    $section = operationalAssignment(5)->section;

    $this->post(route('register.academic'), [
        'email' => 'capacitacion@example.test',
        'role_id' => 5,
        'section_id' => $section->id,
        'type_user_id' => 2,
        'person' => ['dni' => '99887766', 'names' => 'Registro', 'surnames' => 'Capacitación'],
    ])->assertSessionHasNoErrors()->assertRedirect();

    $user = \App\Domains\Identity\Models\User::where('email', 'capacitacion@example.test')->firstOrFail();
    expect($user->person->dni)->toBe('99887766');
    $this->assertDatabaseHas('assignments', ['user_id' => $user->id, 'role_id' => 5, 'section_id' => $section->id]);
});

test('a student can create a formalization and consult its company by RUC', function () {
    $student = operationalAssignment(5);
    enterOperationalProfile($this, $student);

    $this->post(route('academic.internship.placements.store'), [
        'internship_type' => 'development',
        'origin_type' => 'direct',
        'company' => [
            'ruc' => '20999999991', 'name' => 'Empresa de capacitación',
            'address' => 'Dirección de prueba', 'phone' => '999888777', 'email' => 'empresa@example.test',
        ],
        'placement' => [
            'boss_name' => 'Supervisor de prueba', 'boss_position' => 'Jefe de Sistemas',
            'boss_email' => 'jefe@example.test', 'boss_phone' => '999888776',
            'area_name' => 'Tecnología', 'position' => 'Practicante',
            'description' => 'Actividades ficticias de capacitación', 'start_date' => '2026-04-01', 'end_date' => '2026-08-01',
        ],
    ])->assertSessionHasNoErrors()->assertRedirect();

    $placement = \App\Domains\Internship\Models\Placement::where('assignment_id', $student->id)->firstOrFail();
    expect($placement->company->ruc)->toBe('20999999991')
        ->and($placement->area->name)->toBe('Tecnología');
    $this->getJson(route('academic.internship.api.company.verify', '20999999991'))
        ->assertOk()->assertJsonPath('found', true)->assertJsonPath('company.ruc', '20999999991');
});

test('a supervisor submits an annex that a teacher can review', function () {
    $student = operationalAssignment(5);
    $teacher = operationalAssignment(3);
    $supervisor = operationalAssignment(4);
    $teacher->update(['section_id' => $student->section_id]);
    $supervisor->update(['section_id' => $student->section_id]);
    app(\App\Domains\Supervision\Services\InternshipGroupService::class)->createGroup([
        'name' => 'CAPACITACIÓN',
        'teacher_assignment_id' => $teacher->id,
        'supervisor_assignment_id' => $supervisor->id,
        'section_id' => $student->section_id,
        'student_ids' => [$student->id],
    ]);

    enterOperationalProfile($this, $supervisor);
    $this->post(route('academic.supervision.store', $student), [
        'grade' => 18, 'comment' => 'Evaluación de prueba', 'code' => 'anexo_7', 'module_id' => 1,
        'file' => UploadedFile::fake()->create('anexo_7.pdf', 20, 'application/pdf'),
    ])->assertSessionHasNoErrors()->assertRedirect();

    $evaluation = \App\Domains\Supervision\Models\Evaluation::latest('id')->firstOrFail();
    expect((float) $evaluation->grade)->toBe(18.0);
    Storage::disk('public')->assertExists($evaluation->documents->firstOrFail()->path);

    enterOperationalProfile($this, $teacher);
    $this->patch(route('academic.supervision.update', $evaluation), ['approval_status' => 1, 'comment' => 'Conforme'])
        ->assertSessionHasNoErrors()->assertRedirect();
    expect($evaluation->fresh()->approval_status)->toBe(1);
    expect($supervisor->user->notificationRecipients()->whereHas('notification',
        fn ($query) => $query->where('type', 'EVALUATION_VALIDATION')
    )->exists())->toBeTrue();
});
