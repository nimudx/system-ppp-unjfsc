<?php

use App\Domains\Academic\Models\AppSetting;
use App\Domains\Identity\Models\Assignment;
use Database\Seeders\Cycle2026Seeder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed([DatabaseSeeder::class, Cycle2026Seeder::class]);
    Storage::fake('public');
});

// PNG real de 64x64 (no depende de la extensión GD para generar imágenes de prueba).
function fakeLogo(string $name = 'logo.png', ?int $kilobytes = null): UploadedFile
{
    $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAgUlEQVR4nOXOMQEAIAzAsNIXJ1jCvw6QsaNRkLXPfYRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMQ5HZj2AXVgAg84A9soAAAAAElFTkSuQmCC');
    $file = UploadedFile::fake()->createWithContent($name, $png);

    return $kilobytes ? $file->size($kilobytes) : $file;
}

// Docente titular con un alumno en su misma sección.
function titularWithStudents(): Assignment
{
    $teacher = Assignment::where('role_id', 3)->firstOrFail();
    Assignment::where('role_id', 5)->firstOrFail()
        ->update(['section_id' => $teacher->section_id, 'semester_id' => $teacher->semester_id]);

    return $teacher;
}

function brandingProfile(int $role, ?int $sectionId = null): Assignment
{
    return Assignment::where('role_id', $role)
        ->when($sectionId, fn ($q) => $q->where('section_id', $sectionId))
        ->firstOrFail();
}

function enterBrandingProfile($test, Assignment $assignment)
{
    return $test->actingAs($assignment->user)->withSession([
        'assignment_id' => $assignment->id,
        'semester_id' => $assignment->semester_id,
    ]);
}

function sharedLogo($test): ?string
{
    return $test->get(route('settings.about'))->viewData('page')['props']['branding']['logoUrl'];
}

test('a titular teacher logo is shown to the students of the same section only', function () {
    $teacher = titularWithStudents();
    $student = brandingProfile(5, $teacher->section_id);
    $otherStudent = Assignment::where('role_id', 5)->where('section_id', '!=', $teacher->section_id)->firstOrFail();

    enterBrandingProfile($this, $teacher)
        ->post(route('branding.update'), ['logo' => fakeLogo('escuela.png')])
        ->assertSessionHasNoErrors();

    $path = $teacher->section->refresh()->logo_path;
    Storage::disk('public')->assertExists($path);

    expect(sharedLogo(enterBrandingProfile($this, $student)))->toEndWith($path)
        ->and(sharedLogo(enterBrandingProfile($this, $otherStudent)))->toBeNull();
});

test('the administrator logo is the default for everyone without a section logo', function () {
    enterBrandingProfile($this, brandingProfile(1))
        ->post(route('branding.update'), ['logo' => fakeLogo('unjfsc.png')])
        ->assertSessionHasNoErrors();

    $path = AppSetting::get(AppSetting::GLOBAL_LOGO);

    expect($path)->not->toBeNull()
        ->and(sharedLogo(enterBrandingProfile($this, brandingProfile(5))))->toEndWith($path);
});

test('restoring removes the section logo', function () {
    $teacher = titularWithStudents();
    enterBrandingProfile($this, $teacher)->post(route('branding.update'), ['logo' => fakeLogo('a.png')]);
    $path = $teacher->section->refresh()->logo_path;

    enterBrandingProfile($this, $teacher)->delete(route('branding.destroy'))->assertSessionHasNoErrors();

    expect($teacher->section->refresh()->logo_path)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

test('students and supervisors cannot change the logo', function (int $role) {
    $profile = brandingProfile($role);

    enterBrandingProfile($this, $profile)->get(route('branding.edit'))->assertForbidden();
    enterBrandingProfile($this, $profile)
        ->post(route('branding.update'), ['logo' => fakeLogo('x.png')])
        ->assertForbidden();
})->with(['student' => 5, 'supervisor' => 4]);

test('svg and oversized logos are rejected', function () {
    $teacher = titularWithStudents();

    enterBrandingProfile($this, $teacher)
        ->post(route('branding.update'), ['logo' => UploadedFile::fake()->create('logo.svg', 10, 'image/svg+xml')])
        ->assertSessionHasErrors('logo');

    enterBrandingProfile($this, $teacher)
        ->post(route('branding.update'), ['logo' => fakeLogo('big.png', 3000)])
        ->assertSessionHasErrors('logo');
});
