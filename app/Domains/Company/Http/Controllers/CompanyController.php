<?php

namespace App\Domains\Company\Http\Controllers;

use App\Domains\Company\Models\Company;
use App\Shared\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function index(): Response
    {
        $companies = Company::query()
            ->select(['id', 'name', 'ruc', 'razon', 'email', 'phone', 'status'])
            ->withCount('placements')
            ->orderBy('name')
            ->get();

        return Inertia::render('company/index', ['companies' => $companies]);
    }
}
