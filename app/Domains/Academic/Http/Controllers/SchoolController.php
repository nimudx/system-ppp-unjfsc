<?php

namespace App\Domains\Academic\Http\Controllers;

use App\Domains\Academic\Http\Requests\SchoolRequest;
use App\Domains\Academic\Models\Faculty;
use App\Domains\Academic\Models\School;
use App\Domains\Academic\Services\SchoolService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SchoolController extends Controller
{
    protected $schoolService;

    public function __construct(SchoolService $schoolService)
    {
        $this->schoolService = $schoolService;
    }

    public function index(): Response
    {
        return Inertia::render('academic/school/index', [
            'schools' => School::with('faculty')->get(),
            'faculties' => Faculty::select('id', 'name')->get(),
        ]);
    }

    public function store(SchoolRequest $request, Faculty $faculty): RedirectResponse
    {
        $this->schoolService->store($request->validated(), $faculty);

        return back()->with([
            'message' => 'Escuela creada correctamente.',
        ]);
    }

    public function update(SchoolRequest $request, Faculty $faculty, School $school): RedirectResponse
    {
        $this->schoolService->update($request->validated(), $school, $faculty);

        return back()->with([
            'message' => 'Escuela actualizada correctamente.',
        ]);
    }

    public function destroy(School $school): RedirectResponse
    {
        $this->schoolService->delete($school);

        return back()->with([
            'message' => 'Escuela eliminada correctamente.',
        ]);
    }
}
