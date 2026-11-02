<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Domains\Academic\Models\School;
use App\Domains\Academic\Models\Section;
use App\Domains\Academic\Models\Semester;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    /** Una sección 'A' por escuela para el semestre 2026-I. */
    public function run(): void
    {
        $semester = Semester::where('code', '2026-I')->firstOrFail();

        School::all()->each(fn (School $school) => Section::firstOrCreate(
            ['school_id' => $school->id, 'semester_id' => $semester->id, 'name' => 'A'],
            ['faculty_id' => $school->faculty_id, 'status' => 1]
        ));
    }
}
