<?php

namespace App\Shared\Http\Controllers;

use App\Domains\Identity\Models\Assignment;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $assignment_id = session('assignment_id');

        if (! $assignment_id) {
            return Inertia::render('dashboard/dashboard', ['user' => $user]);
        }

        $assignment = Assignment::find($assignment_id);

        return Inertia::render('dashboard/dashboard', [
            'user_type' => $user->typeUser()->id,
            'role' => $assignment->role_id,
        ]);
    }
}
