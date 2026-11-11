<?php

namespace Database\Seeders;

use App\Domains\Academic\Models\Section;
use App\Domains\Identity\Enums\AssignmentAccessStatus;
use App\Domains\Identity\Enums\AssignmentApprovalStatus;
use App\Domains\Identity\Enums\AssignmentReviewStatus;
use App\Domains\Identity\Enums\AssignmentStatus;
use App\Domains\Identity\Enums\PersonStatus;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\Person;
use App\Domains\Identity\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Compatibilidad con pruebas anteriores a la simplificación del sembrado
 * (commit 384c553). Aquellas pruebas llaman a este seeder explícitamente.
 *
 * El catálogo y los usuarios del equipo ahora viven en DatabaseSeeder; aquí
 * solo se restauran los usuarios heredados (incluido un subadmin y el correo
 * docente1@gmail.com) que aquellas pruebas siguen esperando.
 */
class Cycle2026Seeder extends Seeder
{
    private const DEFAULT_PASSWORD = '12345678';

    public function run(): void
    {
        if (User::query()->doesntExist()) {
            $this->call(DatabaseSeeder::class);
        }

        $sections = Section::query()->orderBy('id')->get();

        if ($sections->isEmpty()) {
            return;
        }

        foreach ($this->legacyPeople() as $index => $data) {
            $person = Person::firstOrCreate(
                ['dni' => $data['dni']],
                [
                    'names' => $data['names'],
                    'surnames' => $data['surnames'],
                    'phone' => $data['phone'],
                    'gender' => $data['gender'],
                    'status' => PersonStatus::ACTIVE,
                ]
            );

            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'person_id' => $person->id,
                    'name' => $data['user'],
                    'password' => Hash::make(self::DEFAULT_PASSWORD),
                    'type_user_id' => 2,
                ]
            );

            $section = $sections->get($index % $sections->count());

            Assignment::firstOrCreate(
                ['user_id' => $user->id, 'role_id' => $data['role_id'], 'semester_id' => $section->semester_id],
                [
                    'section_id' => $section->id,
                    'access_status' => AssignmentAccessStatus::FULL,
                    'approval_status' => AssignmentApprovalStatus::APPROVED,
                    'review_status' => AssignmentReviewStatus::NONE,
                    'status' => AssignmentStatus::ACTIVE,
                    'is_select' => false,
                ]
            );
        }
    }

    /**
     * @return array<int, array{dni: string, names: string, surnames: string, email: string, user: string, role_id: int, phone: string, gender: string}>
     */
    private function legacyPeople(): array
    {
        return [
            ['dni' => '70982942', 'names' => 'Martin', 'surnames' => 'Nicasio M.', 'email' => 'nicasio@gmail.com', 'user' => 'marti.n', 'role_id' => 1, 'phone' => '934781245', 'gender' => 'male'],
            ['dni' => '71234567', 'names' => 'Carlos', 'surnames' => 'Ramírez Soto', 'email' => 'admin2@gmail.com', 'user' => 'carlos.ramirez', 'role_id' => 1, 'phone' => '911111111', 'gender' => 'male'],
            ['dni' => '72345678', 'names' => 'Lucía', 'surnames' => 'Fernández Paz', 'email' => 'subadmin1@gmail.com', 'user' => 'lucia.fernandez', 'role_id' => 2, 'phone' => '922222222', 'gender' => 'female'],
            ['dni' => '73456789', 'names' => 'Jorge', 'surnames' => 'Salazar Vega', 'email' => 'subadmin2@gmail.com', 'user' => 'jorge.salazar', 'role_id' => 2, 'phone' => '933333333', 'gender' => 'male'],
            ['dni' => '74567890', 'names' => 'Rosa', 'surnames' => 'Huamán Torres', 'email' => 'docente1@gmail.com', 'user' => 'rosa.huaman', 'role_id' => 3, 'phone' => '944444444', 'gender' => 'female'],
            ['dni' => '75678901', 'names' => 'Pedro', 'surnames' => 'Quispe Rojas', 'email' => 'docente2@gmail.com', 'user' => 'pedro.quispe', 'role_id' => 3, 'phone' => '955555555', 'gender' => 'male'],
            ['dni' => '76789012', 'names' => 'Ana', 'surnames' => 'Vargas Luna', 'email' => 'supervisor1@gmail.com', 'user' => 'ana.vargas', 'role_id' => 4, 'phone' => '966666666', 'gender' => 'female'],
            ['dni' => '77890123', 'names' => 'Luis', 'surnames' => 'Castillo Díaz', 'email' => 'supervisor2@gmail.com', 'user' => 'luis.castillo', 'role_id' => 4, 'phone' => '977777777', 'gender' => 'male'],
            ['dni' => '78901234', 'names' => 'María', 'surnames' => 'Torres Flores', 'email' => 'estudiante1@gmail.com', 'user' => 'maria.torres', 'role_id' => 5, 'phone' => '988888888', 'gender' => 'female'],
            ['dni' => '79012345', 'names' => 'Diego', 'surnames' => 'Mendoza Ríos', 'email' => 'estudiante2@gmail.com', 'user' => 'diego.mendoza', 'role_id' => 5, 'phone' => '999999999', 'gender' => 'male'],
        ];
    }
}
