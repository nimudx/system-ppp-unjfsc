<?php

namespace App\Domains\Dashboard\Http\Controllers;

use App\Domains\Dashboard\Services\DashboardService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(protected DashboardService $dashboard) {}

    public function __invoke(Request $request): Response
    {
        return Inertia::render('dashboard/dashboard', [
            'stats' => $this->dashboard->forUser($request->user()),
        ]);
    }
}
