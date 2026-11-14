<?php

namespace App\Domains\JobBoard\Support;

use App\Domains\Academic\Models\School;

/**
 * Catálogo de escuelas activas para los selectores del módulo.
 */
class SchoolOptions
{
    /**
     * @return array<int, array{id: int, name: string, faculty: string|null}>
     */
    public function all(): array
    {
        return School::query()
            ->with('faculty:id,name')
            ->where('status', 1)
            ->orderBy('name')
            ->get(['id', 'name', 'faculty_id'])
            ->map(fn (School $school) => [
                'id' => $school->id,
                'name' => $school->name,
                'faculty' => $school->faculty?->name,
            ])
            ->all();
    }
}
