<?php

namespace App\Services\Academic;

use App\Models\Assignment;
use App\Models\Faculty;
use App\Models\School;
use Illuminate\Support\Facades\DB;

class SchoolService
{
    /**
     * Store a new school.
     */
    public function store(array $data, Faculty $faculty): School
    {
        return DB::transaction(function () use ($data, $faculty) {
            $school = School::query()->create([
                'name' => $data['name'],
                'faculty_id' => $faculty->id,
                'status' => $data['status'],
            ]);

            return $school->load(['faculty']);
        });
    }

    /**
     * Update an existing school.
     */
    public function update(array $data, School $school, Faculty $faculty): School
    {
        return DB::transaction(function () use ($data, $school, $faculty) {
            $school->update([
                'name' => $data['name'],
                'faculty_id' => $faculty->id,
                'status' => $data['status'],
            ]);

            return $school->load(['faculty']);
        });
    }

    /**
     * Delete an existing school.
     */
    public function delete(School $school): void
    {
        DB::transaction(function () use ($school) {
            $school->delete();
        });
    }

    private function validateOwnership(Assignment $assignment): void
    {
        $role = $assignment->role_id;

        if (! in_array($role, [1, 2])) {
            throw new \Exception('No tiene permisos para gestionar.');
        }
    }
}
