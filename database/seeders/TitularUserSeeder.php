<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Database\Seeders\Concerns\SeedsUsers;
use Illuminate\Database\Seeder;

class TitularUserSeeder extends Seeder
{
    use SeedsUsers;

    public function run(): void
    {
        $this->seedTeamUsers(
            suffix: 'titular',
            domain: 'unjfsc.edu.pe',
            roleId: 3,        // Docente Titular
            typeUserId: 2,    // type_users: Académico
            dniBase: 91000001,
            section: $this->systemsSection(),
        );
    }
}