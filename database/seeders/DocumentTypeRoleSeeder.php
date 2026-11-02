<?php

namespace Database\Seeders;

use App\Domains\Documents\Models\DocumentType;
use App\Domains\Identity\Models\Role;
use Illuminate\Database\Seeder;

class DocumentTypeRoleSeeder extends Seeder
{
    /**
     * Qué roles pueden usar cada tipo de documento (por code, no por id).
     * Idempotente: no hace truncate. El Admin (1) recibe todos los tipos.
     */
    public function run(): void
    {
        $adminId = 1;

        // role_id => codes de document_types
        $map = [
            3 => ['horario', 'carga_lectiva', 'resolucion_designacion'], // Docente Titular
            4 => ['anexo_7', 'anexo_8', 'plan_practicas', 'informe_practicas'], // Docente Supervisor
            5 => ['ficha', 'record', 'fut', 'carta_presentacion', 'anexo_7', 'anexo_8', 'plan_practicas', 'informe_practicas'], // Estudiante
            6 => ['carta_presentacion', 'carta_aceptacion', 'anexo_7'], // Empresa
        ];

        $types = DocumentType::all()->keyBy('code');
        $existingRoles = Role::whereIn('id', [$adminId, ...array_keys($map)])->pluck('id')->all();

        // Admin: todos los tipos
        if (in_array($adminId, $existingRoles, true)) {
            foreach ($types as $type) {
                $type->roles()->syncWithoutDetaching([$adminId => ['status' => 1]]);
            }
        }

        foreach ($map as $roleId => $codes) {
            if (! in_array($roleId, $existingRoles, true)) {
                continue;
            }

            foreach ($codes as $code) {
                $types->get($code)?->roles()->syncWithoutDetaching([$roleId => ['status' => 1]]);
            }
        }
    }
}
