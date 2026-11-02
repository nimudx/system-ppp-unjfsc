<?php

namespace Database\Seeders;

use App\Domains\Documents\Models\DocumentType;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['code' => 'OTH', 'name' => 'Otros', 'description' => 'Documentos generales, manuales y recursos públicos'],
            ['code' => 'anexo_7', 'name' => 'Anexo 7', 'description' => 'Documento de anexo 7'],
            ['code' => 'anexo_8', 'name' => 'Anexo 8', 'description' => 'Documento de anexo 8'],
            ['code' => 'horario', 'name' => 'Horario', 'description' => 'Documento de horario'],
            ['code' => 'carga_lectiva', 'name' => 'Carga Lectiva', 'description' => 'Documento de carga lectiva'],
            ['code' => 'resolucion_designacion', 'name' => 'Resolución de Designación', 'description' => 'Documento de resolución'],
            ['code' => 'ficha', 'name' => 'Ficha de matrícula', 'description' => 'Documento oficial que acredita la inscripción del estudiante en el semestre académico actual.'],
            ['code' => 'record', 'name' => 'Récord Académico', 'description' => 'Certificado detallado de las calificaciones y créditos obtenidos por el estudiante a lo largo de su carrera.'],
            ['code' => 'fut', 'name' => 'Fut', 'description' => 'Archivo formato de solicitud'],
            ['code' => 'carta_presentacion', 'name' => 'Carta de presentación', 'description' => 'Documento de presentación'],
            ['code' => 'carta_aceptacion', 'name' => 'Carta de aceptación', 'description' => 'Documento de aceptación de empresa'],
            ['code' => 'plan_practicas', 'name' => 'Plan de prácticas', 'description' => 'Documento con las actividades, objetivos y cronograma de prácticas.'],
            ['code' => 'informe_practicas', 'name' => 'Informe de prácticas', 'description' => 'Informe de las actividades realizadas durante el periodo de prácticas.'],
        ];

        foreach ($types as $type) {
            DocumentType::firstOrCreate(
                ['code' => $type['code']],
                ['name' => $type['name'], 'description' => $type['description'], 'status' => 1]
            );
        }
    }
}
