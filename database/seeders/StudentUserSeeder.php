<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Database\Seeders\Concerns\SeedsUsers;
use Illuminate\Database\Seeder;

class StudentUserSeeder extends Seeder
{
    use SeedsUsers;
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedTeamUsers(
            suffix: 'estudiante',
            domain: 'unjfsc.edu.pe',
            roleId: 5,        // Estudiante
            typeUserId: 2,    // type_users: Académico
            dniBase: 93000001,
            section: $this->systemsSection(),
        );
    }
}
