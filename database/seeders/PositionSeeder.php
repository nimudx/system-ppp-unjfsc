<?php

namespace Database\Seeders;

use App\Domains\Company\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Administrador', 'Reclutador', 'Jefe', 'Gerente General'] as $name) {
            Position::firstOrCreate(['name' => $name], ['status' => 1]);
        }
    }
}
