<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Domains\Academic\Models\Semester;
use Illuminate\Database\Seeder;

class SemesterSeeder extends Seeder
{
    public function run(): void
    {
        Semester::firstOrCreate(
            ['code' => '2026-I'],
            ['cycle' => 'I', 'status' => 1]
        );
    }
}
