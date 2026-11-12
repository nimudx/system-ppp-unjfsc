<?php

use App\Domains\Academic\Models\Semester;
use App\Domains\Documents\Models\DocumentType;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\Person;
use App\Domains\Identity\Models\User;
use App\Domains\Resources\Models\Resource;
use App\Shared\Enums\Role;
use Database\Seeders\DatabaseSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

test('the administrator sees resources uploaded by administration, teachers and companies', function () {
    $admin = User::where('type_user_id', 1)->firstOrFail();
    $adminAssignment = Assignment::where('user_id', $admin->id)
        ->where('role_id', Role::ADMIN->value)
        ->firstOrFail();

    $teacher = Assignment::where('role_id', Role::DTITULAR->value)->firstOrFail();

    $companyUser = User::where('type_user_id', 3)->with('person')->firstOrFail();
    $companyPerson = $companyUser->person ?? Person::firstOrFail();

    $semester = Semester::where('code', '2026-I')->firstOrFail();
    $documentType = DocumentType::where('status', 1)->firstOrFail();

    $create = function (string $name, string $uploaderType, int $uploaderId) use ($semester, $documentType) {
        Resource::create([
            'name' => $name,
            'uploader_id' => $uploaderId,
            'uploader_type' => $uploaderType,
            'role_id' => null,
            'level' => 1,
            'document_type_id' => $documentType->id,
            'semester_id' => $semester->id,
            'status' => 1,
        ]);
    };

    $create('Manual de la administración', $adminAssignment->getMorphClass(), $adminAssignment->id);
    $create('Guía del docente', $teacher->getMorphClass(), $teacher->id);
    $create('Documento de la empresa', $companyPerson->getMorphClass(), $companyPerson->id);

    $this->actingAs($admin)
        ->withSession([
            'assignment_id' => $adminAssignment->id,
            'semester_id' => $semester->id,
        ])
        ->get(route('resource.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('resources/index')
            ->has('resources', 3)
            ->where('resources.0.uploader_name', fn ($name) => is_string($name) && $name !== '')
            ->where('resources.0.uploader_kind', fn ($kind) => in_array($kind, ['Administración', 'Docente', 'Empresa'], true))
        );
});
