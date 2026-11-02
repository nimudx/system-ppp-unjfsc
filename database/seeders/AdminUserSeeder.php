<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\SeedsUsers;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    use SeedsUsers;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedTeamUsers(
            suffix: 'admin',
            domain: 'gmail.com',
            roleId: 1,        // Administrador
            typeUserId: 1,    // type_users: Administrador
            dniBase: 90000001,
            section: null,
        );
    }
}
