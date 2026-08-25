<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        // Los ids coinciden con App\Enums\Role y están referenciados literalmente
        // en middlewares, servicios y en el frontend (nav/colores por rol).
        DB::table('roles')->upsert([
            ['id' => 1, 'name' => 'Administrador', 'status' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 2, 'name' => 'Sub Administrador', 'status' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 3, 'name' => 'Docente Titular', 'status' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 4, 'name' => 'Docente Supervisor', 'status' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 5, 'name' => 'Estudiante', 'status' => 1, 'created_at' => $now, 'updated_at' => $now],
        ], ['id'], ['name', 'status', 'updated_at']);
    }
}
