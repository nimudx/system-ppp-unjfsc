<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(Tests\TestCase::class)
    ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}

/**
 * Asignación de prueba con el rol pedido. El DatabaseSeeder no crea subadministrador,
 * así que si no existe se crea uno en la primera sección.
 */
function seededAssignment(int $role): App\Domains\Identity\Models\Assignment
{
    $assignment = App\Domains\Identity\Models\Assignment::where('role_id', $role)->first();

    if (! $assignment && $role === App\Shared\Enums\Role::SUBADMIN->value) {
        $section = App\Domains\Academic\Models\Section::firstOrFail();
        $assignment = App\Domains\Identity\Models\Assignment::create([
            'user_id' => App\Domains\Identity\Models\User::factory()->create(['email' => 'subadmin.test@unjfsc.edu.pe'])->id,
            'role_id' => $role,
            'semester_id' => $section->semester_id,
            'section_id' => $section->id,
            'status' => 1,
        ]);
    }

    abort_unless($assignment, 500, "No hay asignación de prueba con el rol {$role}.");
    $assignment->update(['access_status' => 1, 'approval_status' => 1, 'status' => 1]);

    return $assignment->refresh();
}
