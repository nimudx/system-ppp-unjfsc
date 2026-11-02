<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\SeedsUsers;
use Illuminate\Database\Seeder;

class SupervisorUserSeeder extends Seeder
{
    use SeedsUsers;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedTeamUsers(
            suffix: 'supervisor',
            domain: 'unjfsc.edu.pe',
            roleId: 4,        // Docente Supervisor
            typeUserId: 2,    // type_users: Académico
            dniBase: 92000001,
            section: $this->systemsSection(),
        );
    }
}
