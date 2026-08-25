<?php

namespace Database\Seeders;

use App\Enums\Assignment\AssignmentAccessStatus;
use App\Enums\Assignment\AssignmentApprovalStatus;
use App\Enums\Assignment\AssignmentStatus;
use App\Enums\Role;
use App\Models\Assignment;
use App\Models\Person;
use App\Models\Semester;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            TypeUserSeeder::class,
            RoleSeeder::class,
        ]);

        $semester = Semester::query()->firstOrCreate(
            ['code' => '2026-I'],
            ['cycle' => 'I', 'status' => 1],
        );

        $adminPerson = Person::factory()->create([
            'names' => 'Administrador',
            'surnames' => 'del Sistema',
        ]);

        $admin = User::factory()->create([
            'name' => 'Administrador del Sistema',
            'email' => 'admin@unjfsc.edu.pe',
            'person_id' => $adminPerson->id,
            'type_user_id' => 1,
        ]);

        Assignment::create([
            'user_id' => $admin->id,
            'role_id' => Role::ADMIN->value,
            'semester_id' => $semester->id,
            'section_id' => null,
            'access_status' => AssignmentAccessStatus::FULL,
            'approval_status' => AssignmentApprovalStatus::APPROVED,
            'status' => AssignmentStatus::ACTIVE,
            'is_select' => true,
        ]);
    }
}
