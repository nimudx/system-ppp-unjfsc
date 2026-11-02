<?php

use App\Domains\Academic\Models\Semester;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\TypeUser;
use App\Domains\Identity\Models\User;
use App\Domains\Identity\Support\StrictLoginRateLimiter;
use App\Shared\Enums\Role as RoleEnum;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users with two factor enabled are redirected to two factor challenge', function () {
    if (! Features::canManageTwoFactorAuthentication()) {
        $this->markTestSkipped('Two-factor authentication is not enabled.');
    }

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->create();

    $user->forceFill([
        'two_factor_secret' => encrypt('test-secret'),
        'two_factor_recovery_codes' => encrypt(json_encode(['code1', 'code2'])),
        'two_factor_confirmed_at' => now(),
    ])->save();

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    $response->assertSessionHas('login.id', $user->id);
    $this->assertGuest();
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('home'));
});

test('failed login tells how many attempts are left', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'wrong-password'])
        ->assertSessionHasErrors(['email' => 'Correo o contraseña incorrectos. Te quedan 2 intento(s).']);
});

test('account is locked after three failed attempts', function () {
    $user = User::factory()->create();

    foreach (range(1, 3) as $attempt) {
        $this->post(route('login.store'), ['email' => $user->email, 'password' => 'wrong-password']);
    }

    // Ni siquiera la contraseña correcta entra mientras dura el bloqueo.
    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasErrors(['email' => 'Cuenta bloqueada temporalmente por demasiados intentos fallidos. Inténtalo de nuevo en 15 minuto(s) o restablece tu contraseña.']);

    $this->assertGuest();
});

test('successful login resets the failed attempts counter', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'wrong-password']);
    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);
    $this->assertAuthenticated();

    expect(app(StrictLoginRateLimiter::class)->attempts(request()->merge(['email' => $user->email])))->toBe(0);
});

test('inactive users cannot log in', function () {
    $user = User::factory()->create(['status' => 0]);

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasErrors(['email' => 'Tu cuenta está desactivada. Comunícate con el administrador.']);

    $this->assertGuest();
});

test('academic users cannot log in with an external email domain', function () {
    $user = User::factory()->create(['email' => 'docente@gmail.com']);

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasErrors(['email' => 'Solo puedes iniciar sesión con tu correo institucional @unjfsc.edu.pe.']);

    $this->assertGuest();
});

test('academic users can log in with their institutional email', function () {
    $user = User::factory()->create(['email' => 'alumno@unjfsc.edu.pe']);

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);

    $this->assertAuthenticatedAs($user);
});

test('administrators can log in with any email domain', function () {
    TypeUser::unguarded(fn () => TypeUser::firstOrCreate(['id' => 1], ['name' => 'Administrador', 'status' => 1]));

    $user = User::factory()->create(['email' => 'admin@gmail.com', 'type_user_id' => 1]);

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);

    $this->assertAuthenticatedAs($user);
});

test('administrators identified by role can log in even if their type is academic', function () {
    Role::unguarded(fn () => Role::firstOrCreate(['id' => RoleEnum::ADMIN->value], ['name' => 'Administrador', 'status' => 1]));
    $semester = Semester::create(['code' => '2026-I', 'cycle' => 'I', 'status' => 1]);

    $user = User::factory()->create(['email' => 'admin2@gmail.com']);

    Assignment::create([
        'user_id' => $user->id,
        'role_id' => RoleEnum::ADMIN->value,
        'semester_id' => $semester->id,
        'access_status' => 1,
        'approval_status' => 1,
        'review_status' => 0,
        'status' => 1,
        'is_select' => true,
    ]);

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);

    $this->assertAuthenticatedAs($user);
});

test('login requests are rate limited per ip', function () {
    RateLimiter::increment(md5('login'.'127.0.0.1'), amount: 10);

    $this->post(route('login.store'), ['email' => 'nadie@example.com', 'password' => 'x'])
        ->assertTooManyRequests();
});
