<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResourceRequest;
use App\Models\Assignment;
use App\Models\DocumentType;
use App\Models\Faculty;
use App\Models\Resource;
use App\Models\Role;
use App\Models\School;
use App\Models\Section;
use App\Services\ResourceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResourceController extends Controller
{
    public function __construct(
        protected ResourceService $resourceService
    ) {}

    public function index()
    {
        $assignment = Assignment::with('section')->find(session('assignment_id'));

        $faculties = Faculty::query()->forAssignmentContext($assignment, session('semester_id'), true)->get();

        // Cargar todos los tipos de documentos con sus roles asociados para filtrar en el front
        $queryDocTypes = DocumentType::with([
            'roles' => function ($query) use ($assignment) {
                if ($assignment && $assignment->role_id === 3) {
                    // Si es docente, solo le interesan los tipos de documentos marcados para alumnos/empresas
                    $query->whereIn('roles.id', [4, 5]);
                }
            },
        ]);

        $documentTypes = $queryDocTypes->where('status', 1)->get();

        // Roles disponibles (excluyendo Admin general si aplica)
        $queryRoles = Role::query();

        $queryRoles->whereNotIn('id', [1, 6]);

        if ($assignment && $assignment->role_id === 2) {
            $queryRoles->whereNotIn('id', [2]);
        }

        if ($assignment && $assignment->role_id === 3) {
            $queryRoles->whereNotIn('id', [2, 3]);
        }

        $roles = $queryRoles->get();

        // Obtener recursos visibles para el usuario actual
        $resources = [];

        if ($assignment) {
            $locations = [];

            // Si tiene sección, agregamos la jerarquía completa (Facultad > Escuela > Sección)
            if ($assignment->section) {
                $section = $assignment->section;
                $locations[] = ['type' => Faculty::class, 'id' => $section->faculty_id];
                $locations[] = ['type' => School::class, 'id' => $section->school_id];
                $locations[] = ['type' => Section::class, 'id' => $section->id];
            }

            $resources = $this->resourceService->listResourcesForUser(
                $assignment->role_id,
                $assignment->semester_id,
                $locations
            );
        }

        $initialFilters = [];
        if ($assignment && $assignment->role_id === 3 && $assignment->section) {
            $initialFilters = [
                'faculty_id' => $assignment->section->faculty_id,
                'school_id' => $assignment->section->school_id,
                'section_id' => $assignment->section_id,
            ];
        }

        return Inertia::render('resources/index', [
            'resources' => $resources,
            'documentTypes' => $documentTypes,
            'roles' => $roles,
            'faculties' => $faculties,
            'initialFilters' => $initialFilters,
            'role' => $assignment?->role_id,
            'userAssignment' => $assignment,
        ]);
    }

    public function store(ResourceRequest $request)
    {
        $user = auth()->user();
        $uploader = null;

        // Determinar el cargador (Uploader) según el tipo de usuario
        if (in_array($user->type_user_id, [1, 2])) {
            // Admin (1) o Académico (2) - Usan Asignación activa
            $uploader = Assignment::find(session('assignment_id')) ?? $user->activeAssignment;
        } elseif ($user->type_user_id === 3) {
            // Empresa (3) - Usa la Empresa directamente vinculada al usuario
            $uploader = $user->person;
        }

        $data = $request->validated();

        $this->resourceService->registerResourceAcademic($uploader, $data);

        return back()->with('success', 'Recurso registrado correctamente.');
    }

    public function update(Request $request, Resource $resource)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file',
        ]);

        $user = auth()->user();
        $uploader = null;

        // Determinar el cargador (Uploader) según el tipo de usuario
        if (in_array($user->type_user_id, [1, 2])) {
            $uploader = Assignment::find(session('assignment_id')) ?? $user->activeAssignment;
        } elseif ($user->type_user_id === 3) {
            $uploader = $user->person;
        }

        $this->resourceService->updateResource($resource, $data, $uploader);

        return back()->with('success', 'Recurso actualizado correctamente.');
    }

    public function destroy(Resource $resource)
    {
        $this->resourceService->deleteResource($resource);

        return back()->with('success', 'Recurso eliminado correctamente.');
    }
}
