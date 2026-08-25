<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TypeUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        // Los ids son referenciados literalmente en el código (SyncAcademicSessionService,
        // ResourceController, UserRegistrationService), no pueden reordenarse.
        DB::table('type_users')->upsert([
            ['id' => 1, 'name' => 'Administrador', 'status' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 2, 'name' => 'Académico', 'status' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 3, 'name' => 'Empresa', 'status' => 1, 'created_at' => $now, 'updated_at' => $now],
        ], ['id'], ['name', 'status', 'updated_at']);
    }
}
