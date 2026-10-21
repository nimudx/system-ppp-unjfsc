<?php

namespace Database\Seeders;

use App\Domains\Academic\Models\Semester;
use App\Domains\Identity\Enums\AssignmentAccessStatus;
use App\Domains\Identity\Enums\AssignmentApprovalStatus;
use App\Domains\Identity\Enums\AssignmentReviewStatus;
use App\Domains\Identity\Enums\AssignmentStatus;
use App\Domains\Identity\Enums\PersonStatus;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\Person;
use App\Domains\Identity\Models\User;
use App\Shared\Enums\Role;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * No usa factories a propósito: fakerphp/faker es require-dev y no
     * existe en la imagen de producción (composer install --no-dev). Un
     * factory tampoco es la herramienta correcta para crear el admin real.
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

        $adminPerson = Person::firstOrCreate(
            ['dni' => '00000000'],
            [
                'names' => 'Administrador',
                'surnames' => 'del Sistema',
                'phone' => '900000000',
                'gender' => 'M',
                'status' => PersonStatus::ACTIVE,
            ]
        );

        $admin = User::firstOrCreate(
            ['email' => 'admin@unjfsc.edu.pe'],
            [
                'name' => 'Administrador del Sistema',
                'person_id' => $adminPerson->id,
                'password' => Hash::make('12345678'),
                'type_user_id' => 1,
            ]
        );

        Assignment::firstOrCreate(
            ['user_id' => $admin->id, 'role_id' => Role::ADMIN->value, 'semester_id' => $semester->id],
            [
                'section_id' => null,
                'access_status' => AssignmentAccessStatus::FULL,
                'approval_status' => AssignmentApprovalStatus::APPROVED,
                'review_status' => AssignmentReviewStatus::NONE,
                'status' => AssignmentStatus::ACTIVE,
                'is_select' => true,
            ]
        );
    }
}
