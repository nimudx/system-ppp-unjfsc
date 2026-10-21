<?php

namespace App\Shared\Support;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;

class ModuleRouteRegistrar
{
    public function __construct(private readonly Application $app) {}

    public function register(): void
    {
        if ($this->app->routesAreCached()) {
            return;
        }

        foreach (glob(app_path('Domains/*/routes/web.php')) ?: [] as $path) {
            Route::middleware('web')->group($path);
        }

        foreach (glob(app_path('Domains/*/routes/api.php')) ?: [] as $path) {
            Route::middleware('api')->prefix('api')->group($path);
        }
    }
}
