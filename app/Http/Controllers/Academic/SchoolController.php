<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\SchoolRequest;
use App\Models\Faculty;
use App\Models\School;
use App\Services\Academic\SchoolService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

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
