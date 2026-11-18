<?php

namespace App\Domains\Dashboard\Http\Controllers;

use App\Domains\Dashboard\Services\DashboardService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(protected DashboardService $dashboard) {}

    public function __invoke(Request $request): Response|RedirectResponse
    {
        // Las cuentas de empresa tienen su propio panel en el módulo Company.
        if ($request->user()->type_user_id === 3) {
            return to_route('company.dashboard');
        }

        return Inertia::render('dashboard/dashboard', [
            'stats' => $this->dashboard->forUser($request->user()),
        ]);
    }
}
