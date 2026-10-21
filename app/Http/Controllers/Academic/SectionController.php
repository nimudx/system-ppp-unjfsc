<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\StoreSectionRequest;
use App\Models\School;
use App\Models\Section;
use App\Services\Academic\SectionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SectionController extends Controller
{
    protected $sectionService;

    public function __construct(SectionService $sectionService)
    {
        $this->sectionService = $sectionService;
    }

    public function index(): Response
    {
        $semesterId = session('semester_id');

        // Get all schools with their faculty and sections for the CURRENT semester
        $schools = School::with(['faculty', 'sections' => function ($query) use ($semesterId) {
            $query->where('semester_id', $semesterId);
        }])->get();

        return Inertia::render('academic/section/index', [
            'schools' => $schools,
        ]);
    }

    public function store(StoreSectionRequest $request, School $school): RedirectResponse
    {
        $semesterId = session('semester_id');
        $data = $request->validated();

        $this->sectionService->create($data, $school, $semesterId);

        return back()->with([
            'message' => 'Sección añadida correctamente.',
        ]);
    }

    public function destroy(Section $section): RedirectResponse
    {
        $this->sectionService->delete($section);

        return back()->with([
            'message' => 'Sección eliminada correctamente.',
        ]);
    }
}
