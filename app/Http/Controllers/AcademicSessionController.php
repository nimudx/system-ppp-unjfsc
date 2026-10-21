<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Semester;
use App\Models\Staff;
use App\Services\Auth\SyncAcademicSessionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class AcademicSessionController extends Controller
{
    public function __construct(protected SyncAcademicSessionService $syncService) {}

    public function syncSemester(Semester $semester): RedirectResponse
    {
        $this->syncService->syncSemester(Auth::user(), $semester);

        return back()->with([
            'message' => 'Semestre sincronizado correctamente.',
        ]);
    }

    public function syncAssignment(Assignment $assignment): RedirectResponse
    {
        $this->syncService->syncAssignment(Auth::user(), $assignment);

        return back()->with([
            'message' => 'Asignatura sincronizada correctamente.',
        ]);
    }

    public function syncStaff(Staff $staff): RedirectResponse
    {
        $this->syncService->syncStaff(Auth::user(), $staff);

        return back()->with([
            'message' => 'Perfil de empresa actualizado.',
        ]);
    }
}
