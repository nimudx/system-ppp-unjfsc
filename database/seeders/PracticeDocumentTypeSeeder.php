<?php

namespace Database\Seeders;

use App\Domains\Documents\Models\DocumentType;
use App\Domains\Identity\Models\Role;
use Illuminate\Database\Seeder;

class PracticeDocumentTypeSeeder extends Seeder
{
    /**
     * Idempotente. Ejecutar DESPUÉS de DocumentTypeRoleSeeder (ese hace truncate del pivote).
     */
    public function run(): void
    {
        $types = [
            ['code' => 'plan_practicas', 'name' => 'Plan de prácticas', 'description' => 'Documento con las actividades, objetivos y cronograma de prácticas.'],
            ['code' => 'informe_practicas', 'name' => 'Informe de prácticas', 'description' => 'Informe de las actividades realizadas durante el periodo de prácticas.'],
        ];

        // 1 Admin, 4 Supervisor, 5 Estudiante
        $roleIds = Role::query()->whereIn('id', [1, 4, 5])->pluck('id');

        foreach ($types as $data) {
            $type = DocumentType::firstOrCreate(
                ['code' => $data['code']],
                ['name' => $data['name'], 'description' => $data['description'], 'status' => 1]
            );

            $type->roles()->syncWithoutDetaching(
                $roleIds->mapWithKeys(fn ($id) => [$id => ['status' => 1]])->all()
            );
        }
    }
}
