<?php

namespace App\Services\Academic;

use App\Models\Faculty;
use Illuminate\Support\Facades\DB;

class FacultyService
{
    /**
     * Store a new faculty.
     */
    public function store(array $data): Faculty
    {
        return DB::transaction(function () use ($data) {
            return Faculty::query()->create($data);
        });
    }

    /**
     * Update an existing faculty.
     */
    public function update(array $data, Faculty $faculty): Faculty
    {
        return DB::transaction(function () use ($data, $faculty) {
            $faculty->update($data);

            return $faculty;
        });
    }

    /**
     * Delete an existing faculty.
     */
    public function delete(Faculty $faculty): void
    {
        DB::transaction(function () use ($faculty) {
            $faculty->delete();
        });
    }
}
