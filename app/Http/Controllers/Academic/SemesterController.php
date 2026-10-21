<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\UpdateSemesterRequest;
use App\Models\Semester;
use App\Services\Academic\SemesterService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SemesterController extends Controller
{
    public function __construct(protected SemesterService $semesterService) {}

    public function index(): Response
    {
        $semesters = Semester::orderBy('id', 'desc')->get();

        return Inertia::render('academic/semesters/index', ['semesters' => $semesters]);
    }

    public function update(UpdateSemesterRequest $request, Semester $semester): RedirectResponse
    {
        $data = $request->validated();

        $semester->update($data);

        return back()->with([
            'message' => 'Semestre actualizado correctamente.',
        ], 200);
    }

    public function closeCurrentSemester(Semester $semester): RedirectResponse
    {
        $this->semesterService->closeCurrentSemester($semester->id);

        return back()->with([
            'message' => 'Semestre finalizado correctamente.',
        ], 200);
    }

    public function backCurrentSemester(Semester $semester): RedirectResponse
    {
        $this->semesterService->backCurrentSemester($semester->id);

        return back()->with('success', 'Semestre restablecido correctamente.');
    }
}
