<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Domains\Academic\Models\Faculty;
use App\Domains\Academic\Models\School;
use Illuminate\Database\Seeder;

class FacultiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schoolsByFaculty = [
            'Bromatología y Nutrición' => ['Bromatología y Nutrición'],
            'Ciencias' => ['Biología', 'Física', 'Matemáticas'],
            'Ciencias Económicas, Contables y Financieras' => ['Economía y Finanzas', 'Contabilidad y Finanzas'],
            'Ciencias Empresariales' => ['Administración y Gestión', 'Marketing'],
            'Ciencias Sociales' => ['Trabajo Social', 'Ciencias de la Comunicación', 'Turismo'],
            'Educación' => ['Educación Básica', 'Educación Tecnológica'],
            'Ingeniería Agraria, Industrias Alimentarias y Ambiental' => ['Ingeniería Agronómica', 'Industrias Alimentarias', 'Ingeniería Ambiental'],
            'Ingeniería Industrial, Sistemas e Informática' => ['Ingeniería Industrial', 'Ingeniería de Sistemas', 'Ingeniería Informática', 'Ingeniería Electrónica'],
            'Ingeniería Pesquera' => ['Ingeniería Pesquera', 'Ingeniería Acuícola'],
            'Ingeniería Química y Metalúrgica' => ['Ingeniería Química', 'Ingeniería Metalúrgica'],
            'Medicina Humana' => ['Medicina Humana', 'Enfermería'],
            'Derecho y Ciencias Políticas' => ['Derecho', 'Ciencias Políticas'],
        ];

        foreach ($schoolsByFaculty as $facultyName => $schoolNames) {
            $faculty = Faculty::firstOrCreate(['name' => $facultyName], ['status' => 1]);

            foreach ($schoolNames as $schoolName) {
                School::firstOrCreate(
                    ['name' => $schoolName, 'faculty_id' => $faculty->id],
                    ['status' => 1]
                );
            }
        }
    }
}
