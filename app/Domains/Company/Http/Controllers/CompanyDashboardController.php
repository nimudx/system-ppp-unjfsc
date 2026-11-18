<?php

namespace App\Domains\Company\Http\Controllers;

use App\Domains\Dashboard\Services\DashboardService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyDashboardController extends Controller
{
    public function __construct(private DashboardService $dashboard) {}

    public function __invoke(Request $request): Response
    {
        return Inertia::render('company/dashboard', [
            'stats' => $this->dashboard->forUser($request->user()),
        ]);
    }
}
