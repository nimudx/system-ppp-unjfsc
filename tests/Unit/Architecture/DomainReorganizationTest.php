<?php

use App\Domains\Academic\Models\Faculty;
use App\Domains\Documents\Models\Document;
use App\Domains\Dossier\Models\Dossier;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\Person;
use App\Domains\Identity\Models\User;
use App\Domains\Internship\Models\Internship;
use App\Domains\Internship\Models\Placement;
use App\Domains\Notifications\Models\Notification;
use App\Domains\Requests\Models\UserRequest;
use App\Domains\Resources\Models\Resource;
use App\Domains\Resources\Services\ResourceService;
use App\Domains\Supervision\Models\Evaluation;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

uses(Tests\TestCase::class);

beforeEach(function () {
    // These tests always use a fresh, isolated SQLite database.
    config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
    DB::purge('sqlite');
});

test('the domain move preserves the complete route contract', function () {
    $expected = json_decode(file_get_contents(base_path('tests/Fixtures/routes_before_domains.json')), true, flags: JSON_THROW_ON_ERROR);

    Artisan::call('route:list', ['--json' => true]);
    $actual = json_decode(Artisan::output(), true, flags: JSON_THROW_ON_ERROR);

    $index = fn (array $routes) => collect($routes)
        ->map(function (array $route) {
            if (str_starts_with($route['name'] ?? '', 'generated::')) {
                $route['name'] = null;
            }

            return $route;
        })
        ->keyBy(fn (array $route) => $route['method'].' '.$route['uri'])
        ->sortKeys()->all();

    expect($index($actual))->toBe($index($expected));
});

test('domain controllers and services resolve their dependencies', function () {
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(app_path('Domains')));
    $resolved = 0;

    foreach ($files as $file) {
        $path = str_replace('\\', '/', $file->getPathname());
        if ($file->getExtension() !== 'php' || ! preg_match('~/(Http/Controllers|Services)/~', $path)) {
            continue;
        }

        preg_match('/namespace\s+([^;]+);/', file_get_contents($path), $namespace);
        $class = $namespace[1].'\\'.$file->getBasename('.php');

        expect(app($class))->toBeInstanceOf($class);
        $resolved++;
    }

    expect($resolved)->toBeGreaterThan(40);
});

test('relations still resolve models across domains', function () {
    $checked = 0;

    foreach (Relation::morphMap() as $class) {
        $model = new $class;
        $reflection = new ReflectionClass($class);

        foreach ($reflection->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
            $type = $method->getReturnType();
            if ($method->getDeclaringClass()->getName() !== $class
                || $method->getNumberOfRequiredParameters() !== 0
                || ! $type instanceof ReflectionNamedType
                || ! is_a($type->getName(), Relation::class, true)) {
                continue;
            }

            expect($method->invoke($model))->toBeInstanceOf(Relation::class);
            $checked++;
        }
    }

    expect($checked)->toBeGreaterThan(50);
});

test('existing factories resolve the moved identity models', function () {
    Artisan::call('migrate', ['--force' => true]);
    expect(User::factory()->make())->toBeInstanceOf(User::class)
        ->and(Person::factory()->make())->toBeInstanceOf(Person::class)
        ->and(Database\Factories\UserFactory::new()->make())->toBeInstanceOf(User::class);
});

test('documents retain their stored morph identifiers and inverse relations', function (string $ownerClass) {
    $owner = new $ownerClass;

    Schema::create($owner->getTable(), function (Blueprint $table) {
        $table->id();
        $table->timestamps();
    });
    Schema::create('documents', function (Blueprint $table) {
        $table->id();
        $table->morphs('documentable');
        $table->string('name');
        $table->timestamps();
    });

    $owner->save();
    $document = $owner->documents()->create(['name' => 'migration-check.pdf']);
    $legacyType = 'App\\Models\\'.class_basename($ownerClass);

    expect($document->documentable_type)->toBe($legacyType)
        ->and(Document::findOrFail($document->id)->documentable)->toBeInstanceOf($ownerClass)
        ->and($owner->fresh()->documents)->toHaveCount(1);
})->with([
    'dossier' => Dossier::class,
    'internship' => Internship::class,
    'placement' => Placement::class,
    'evaluation' => Evaluation::class,
    'resource' => Resource::class,
]);

test('legacy notifications and management requests retain their actors and targets', function () {
    foreach (['assignments', 'internships'] as $name) {
        Schema::create($name, function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }
    Schema::create('notifications', function (Blueprint $table) {
        $table->id();
        $table->morphs('actor');
        $table->morphs('subject');
        $table->timestamps();
    });
    Schema::create('user_requests', function (Blueprint $table) {
        $table->id();
        $table->morphs('senderable');
        $table->morphs('requestable');
        $table->timestamps();
    });

    $assignment = Assignment::create();
    $internship = Internship::create();

    $notification = Notification::create([
        'actor_type' => 'App\\Models\\Assignment',
        'actor_id' => $assignment->id,
        'subject_type' => 'App\\Models\\Internship',
        'subject_id' => $internship->id,
    ]);
    $request = UserRequest::create([
        'senderable_type' => 'App\\Models\\Assignment',
        'senderable_id' => $assignment->id,
        'requestable_type' => 'App\\Models\\Internship',
        'requestable_id' => $internship->id,
    ]);

    expect($notification->fresh()->actor)->toBeInstanceOf(Assignment::class)
        ->and($notification->fresh()->subject)->toBeInstanceOf(Internship::class)
        ->and($request->fresh()->senderable)->toBeInstanceOf(Assignment::class)
        ->and($request->fresh()->requestable)->toBeInstanceOf(Internship::class);
});

test('academic resource filtering still finds legacy location keys', function () {
    foreach (['faculties', 'assignments'] as $name) {
        Schema::create($name, function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }
    Schema::create('resources', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->morphs('uploader');
        $table->morphs('location');
        $table->unsignedBigInteger('role_id')->nullable();
        $table->unsignedBigInteger('semester_id')->nullable();
        $table->unsignedInteger('level');
        $table->unsignedInteger('status');
        $table->timestamps();
    });
    Schema::create('documents', function (Blueprint $table) {
        $table->id();
        $table->morphs('documentable');
        $table->timestamps();
    });

    $faculty = Faculty::create();
    $assignment = Assignment::create();
    $resource = Resource::create([
        'name' => 'Legacy resource',
        'uploader_type' => 'App\\Models\\Assignment',
        'uploader_id' => $assignment->id,
        'location_type' => 'App\\Models\\Faculty',
        'location_id' => $faculty->id,
        'role_id' => 5,
        'level' => 2,
        'status' => 1,
    ]);

    $found = app(ResourceService::class)->listResourcesForUser(5, null, [
        ['type' => (new Faculty)->getMorphClass(), 'id' => $faculty->id],
    ]);

    expect($resource->fresh()->uploader)->toBeInstanceOf(Assignment::class)
        ->and($resource->fresh()->location)->toBeInstanceOf(Faculty::class)
        ->and($found->modelKeys())->toBe([$resource->id]);
});
