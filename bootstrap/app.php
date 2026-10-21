<?php

use App\Shared\Exceptions\BusinessException;
use App\Shared\Http\Middleware\EnsureActiveSemester;
use App\Shared\Http\Middleware\EnsureAssignmentAccess;
use App\Shared\Http\Middleware\EnsureHasRole;
use App\Shared\Http\Middleware\EnsureUserType;
use App\Shared\Http\Middleware\HandleAppearance;
use App\Shared\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            EnsureActiveSemester::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => EnsureHasRole::class,
            'type' => EnsureUserType::class,
            'approved' => EnsureAssignmentAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
        $exceptions->render(function (BusinessException $e, Request $request) {
            if ($request->header('X-Inertia')) {
                return back()->with('error', [
                    'message' => $e->getMessage(),
                    'code' => $e->code(),
                    'status' => $e->status(),
                ]);
            }

            return response()->json([
                'message' => $e->getMessage(),
                'code' => $e->code(),
            ], $e->status());
        });
    })->create();
