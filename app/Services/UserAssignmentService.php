<?php

namespace App\Services;

use App\Models\Assignment;

class UserAssignmentService
{
    /**
     * Obtener asignaciones por rol y semestre, con soporte opcional para filtros completos (estilo Dossier).
     *
     * @return mixed
     */
    public function getAssignmentsByRole(int $roleId, int $semesterId, array $filters = [], bool $paginate = true)
    {
        $query = Assignment::query()
            ->with([
                'user.person',
                'role',
                'section.school.faculty',
                'section.faculty',
            ])
            ->where('role_id', $roleId)
            ->where('semester_id', $semesterId);

        // Filtro por Facultad/Escuela/Sección
        if (! empty($filters['section_id'])) {
            $query->where('section_id', $filters['section_id']);
        } elseif (! empty($filters['school_id'])) {
            $query->whereHas('section', fn ($q) => $q->where('school_id', $filters['school_id']));
        } elseif (! empty($filters['faculty_id'])) {
            $query->where(function ($q) use ($filters) {
                $q->whereHas('section.school', fn ($sq) => $sq->where('faculty_id', $filters['faculty_id']))
                    ->orWhereHas('section.faculty', fn ($sq) => $sq->where('id', $filters['faculty_id']));
            });
        }

        // Búsqueda por Email o Nombre
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhereHas('person', function ($q2) use ($search) {
                        $q2->where('names', 'like', "%{$search}%")
                            ->orWhere('surnames', 'like', "%{$search}%");
                    });
            });
        }

        return $paginate ? $query->paginate(3) : $query->get();
    }
}
