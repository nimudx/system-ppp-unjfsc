<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DocumentTypeRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = \App\Models\Role::find(1);
        $titularRole = \App\Models\Role::find(3);
        $supervisorRole = \App\Models\Role::find(4);
        $studentRole = \App\Models\Role::find(5);
        $companyRole = \App\Models\Role::find(6);

        // Limpiar para evitar duplicados
        \Illuminate\Support\Facades\DB::table('document_type_roles')->truncate();

        // 1:Ficha de matrícula, 2:Récord Académico, 3:Fut, 8:Anexo 7, 9:Anexo 8
        $studentTypes = [1, 2, 3, 4, 8, 9];
        // 5:Horario, 6:Cargar Lectiva, 7:Resolucion de Designacion
        $titularTypes = [5, 6, 7];
        // 8:Anexo 7, 9:Anexo 8
        $supervisorTypes = [8, 9];
        // 4:Carta de presentación, 8: Anexo 7
        $companyTypes = [4, 8];

        $allTypes = \App\Models\DocumentType::all();

        foreach ($allTypes as $type) {
            // Admin can see all
            if ($adminRole) {
                $type->roles()->attach($adminRole->id, ['status' => 1]);
            }

            if ($studentRole && in_array($type->id, $studentTypes)) {
                $type->roles()->attach($studentRole->id, ['status' => 1]);
            }

            if ($titularRole && in_array($type->id, $titularTypes)) {
                $type->roles()->attach($titularRole->id, ['status' => 1]);
            }

            if ($supervisorRole && in_array($type->id, $supervisorTypes)) {
                $type->roles()->attach($supervisorRole->id, ['status' => 1]);
            }

            if ($companyRole && in_array($type->id, $companyTypes)) {
                $type->roles()->attach($companyRole->id, ['status' => 1]);
            }
        }
    }
}
