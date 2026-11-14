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
use Database\Seeders\Concerns\SeedsUsers;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SubAdminUserSeeder extends Seeder
{
    use SeedsUsers;

    /**
     * Subadministradores de prueba.
     *
     * El alcance del subadmin depende de la facultad de la sección de su
     * asignación: los seis usuarios del equipo quedan en Ingeniería de
     * Sistemas y se agrega uno de Biología para comprobar el aislamiento.
     */
    public function run(): void
    {
        $this->seedTeamUsers(
            suffix: 'subadmin',
            domain: 'unjfsc.edu.pe',
            roleId: 2,        // Sub Administrador
            typeUserId: 2,    // type_users: Académico
            dniBase: 94000001,
            section: $this->systemsSection(),
        );

        $this->seedBiologySubAdmin();
    }

    private function seedBiologySubAdmin(): void
    {
        $semester = $this->currentSemester();

        $section = Section::query()
            ->where('name', 'A')
            ->where('semester_id', $semester->id)
            ->whereHas('school', fn ($query) => $query->where('name', 'Biología'))
            ->firstOrFail();

        $person = Person::firstOrCreate(
            ['dni' => '94000099'],
            [
                'names' => 'Carla',
                'surnames' => 'Subadmin Demo',
                'phone' => '994000099',
                'gender' => 'female',
                'status' => PersonStatus::ACTIVE,
            ]
        );

        $user = User::firstOrCreate(
            ['email' => 'carlasubadmin@unjfsc.edu.pe'],
            [
                'person_id' => $person->id,
                'name' => 'carla.subadmin',
                'password' => Hash::make($this->defaultPassword()),
                'type_user_id' => 2,
            ]
        );

        Assignment::firstOrCreate(
            ['user_id' => $user->id, 'role_id' => 2, 'semester_id' => $semester->id],
            [
                'section_id' => $section->id,
                'access_status' => AssignmentAccessStatus::FULL,
                'approval_status' => AssignmentApprovalStatus::APPROVED,
                'review_status' => AssignmentReviewStatus::NONE,
                'status' => AssignmentStatus::ACTIVE,
                'is_select' => true,
            ]
        );
    }
}
