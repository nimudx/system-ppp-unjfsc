<?php

namespace App\Domains\Identity\Http\Controllers;

use App\Domains\Academic\Models\Semester;
use App\Domains\Company\Models\Staff;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Services\SyncAcademicSessionService;
use App\Shared\Http\Controllers\Controller;
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
