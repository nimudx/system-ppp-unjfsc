<?php

namespace App\Services\Academic;

use App\Exceptions\Section\SectionHasRelatedRecordsException;
use App\Models\School;
use App\Models\Section;
use Illuminate\Support\Facades\DB;

class SectionService
{
    /**
     * Create a new section.
     */
    public function create(array $data, School $school, int $semesterId): Section
    {
        return DB::transaction(function () use ($data, $school, $semesterId) {
            $section = Section::query()->create([
                'name' => $data['name'],
                'faculty_id' => $school->faculty_id,
                'school_id' => $school->id,
                'semester_id' => $semesterId,
                'status' => true,
            ]);

            return $section->load(['school', 'faculty']);
        });
    }

    /**
     * Update an existing section.
     */
    public function update(Section $section, array $data): Section
    {
        return DB::transaction(function () use ($section, $data) {
            $section->update([
                'name' => $data['name'],
                'faculty_id' => $data['faculty_id'],
                'school_id' => $data['school_id'],
            ]);

            return $section->load(['school', 'faculty']);
        });
    }

    /**
     * Delete an existing section.
     */
    public function delete(Section $section): void
    {
        if ($section->assignments()->exists()) {
            throw new SectionHasRelatedRecordsException;
        }

        $section->delete();
    }
}
