<?php

namespace App\Domains\Identity\Providers;

use App\Domains\Identity\Actions\AuthenticateActiveUser;
use App\Domains\Identity\Actions\CreateNewUser;
use App\Domains\Identity\Actions\EnsureLoginIsNotLocked;
use App\Domains\Identity\Actions\ResetUserPassword;
use App\Domains\Identity\Support\StrictLoginRateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Laravel\Fortify\Actions\AttemptToAuthenticate;
use Laravel\Fortify\Actions\CanonicalizeUsername;
use Laravel\Fortify\Actions\PrepareAuthenticatedSession;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\LoginRateLimiter;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Todo Fortify (login y desafío 2FA) cuenta los intentos fallidos con el límite de 3.
        $this->app->singleton(LoginRateLimiter::class, StrictLoginRateLimiter::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureAuthentication();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure the login pipeline: bloqueo tras 3 fallos, solo cuentas activas y 2FA.
     */
    private function configureAuthentication(): void
    {
        Fortify::authenticateUsing(fn (Request $request) => app(AuthenticateActiveUser::class)($request));

        Fortify::authenticateThrough(fn () => [
            EnsureLoginIsNotLocked::class,
            CanonicalizeUsername::class,
            Features::enabled(Features::twoFactorAuthentication()) ? RedirectIfTwoFactorAuthenticatable::class : null,
            AttemptToAuthenticate::class,
            PrepareAuthenticatedSession::class,
        ]);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('identity/auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('identity/auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('identity/auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('identity/auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('identity/auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('identity/auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        // Freno general por IP contra ataques automatizados que prueban muchos correos distintos.
        // El bloqueo de 3 intentos por cuenta lo aplica EnsureLoginIsNotLocked.
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}
