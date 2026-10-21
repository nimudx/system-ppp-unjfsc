<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\FacultyRequest;
use App\Models\Faculty;
use App\Services\Academic\FacultyService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FacultyController extends Controller
{
    public function __construct(protected FacultyService $facultyService) {}

    public function index(): Response
    {
        $faculties = Faculty::all();

        return Inertia::render('academic/faculty/index', ['faculties' => $faculties]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(FacultyRequest $request): RedirectResponse
    {
        $this->facultyService->store($request->validated());

        return back()->with([
            'message' => 'Facultad creada correctamente.',
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(FacultyRequest $request, Faculty $faculty): RedirectResponse
    {
        $this->facultyService->update($request->validated(), $faculty);

        return back()->with([
            'message' => 'Facultad actualizada correctamente.',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Faculty $faculty): RedirectResponse
    {
        $this->facultyService->delete($faculty);

        return back()->with([
            'message' => 'Facultad eliminada correctamente.',
        ]);
    }
}
