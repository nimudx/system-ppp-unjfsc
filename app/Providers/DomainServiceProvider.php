<?php

namespace App\Providers;

use App\Shared\Support\ModuleRouteRegistrar;
use Illuminate\Support\ServiceProvider;

class DomainServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->app->booted(function (): void {
            $this->app->make(ModuleRouteRegistrar::class)->register();
        });
    }
}
