<?php

namespace Database\Seeders;

use App\Enums\Assignment\AssignmentAccessStatus;
use App\Enums\Assignment\AssignmentApprovalStatus;
use App\Enums\Assignment\AssignmentReviewStatus;
use App\Enums\Assignment\AssignmentStatus;
use App\Enums\PersonStatus;
use App\Models\Assignment;
use App\Models\DocumentType;
use App\Models\Faculty;
use App\Models\Module;
use App\Models\Person;
use App\Models\Position;
use App\Models\School;
use App\Models\Section;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Estructura académica del ciclo 2026-I (facultades, escuelas, secciones)
 * + usuarios de ejemplo, tomados de db_practicantes.sql. Idempotente:
 * se puede correr más de una vez sin duplicar filas.
 *
 * Password temporal para todo usuario creado acá: 12345678
 */
class Cycle2026Seeder extends Seeder
{
    private const DEFAULT_PASSWORD = '12345678';

    public function run(): void
    {
        $faculties = $this->seedFaculties();
        $schools = $this->seedSchools($faculties);
        $semester = $this->seedSemester();
        $sections = $this->seedSections($schools, $semester);
        $this->seedModules();
        $this->seedDocumentTypes();
        $this->seedPositions();
        $this->seedSampleUsers($sections);
    }

    /**
     * @return array<string, Faculty>
     */
    private function seedFaculties(): array
    {
        $names = [
            'Bromatología y Nutrición',
            'Ciencias',
            'Ciencias Económicas, Contables y Financieras',
            'Ciencias Empresariales',
            'Ciencias Sociales',
            'Educación',
            'Ingeniería Agraria, Industrias Alimentarias y Ambiental',
            'Ingeniería Industrial, Sistemas e Informática',
            'Ingeniería Pesquera',
            'Ingeniería Química y Metalúrgica',
            'Medicina Humana',
            'Derecho y Ciencias Políticas',
        ];

        $faculties = [];
        foreach ($names as $name) {
            $faculties[$name] = Faculty::firstOrCreate(['name' => $name], ['status' => 1]);
        }

        return $faculties;
    }

    /**
     * @param  array<string, Faculty>  $faculties
     * @return \Illuminate\Support\Collection<int, School>
     */
    private function seedSchools(array $faculties): \Illuminate\Support\Collection
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

        $schools = collect();
        foreach ($schoolsByFaculty as $facultyName => $schoolNames) {
            $faculty = $faculties[$facultyName];
            foreach ($schoolNames as $schoolName) {
                $schools->push(School::firstOrCreate(
                    ['name' => $schoolName, 'faculty_id' => $faculty->id],
                    ['status' => 1]
                ));
            }
        }

        return $schools;
    }

    private function seedSemester(): Semester
    {
        return Semester::firstOrCreate(
            ['code' => '2026-I'],
            ['cycle' => 'I', 'status' => 1]
        );
    }

    /**
     * Una sección 'A' por escuela para el semestre 2026-I.
     *
     * @param  \Illuminate\Support\Collection<int, School>  $schools
     * @return \Illuminate\Support\Collection<int, Section>
     */
    private function seedSections(\Illuminate\Support\Collection $schools, Semester $semester): \Illuminate\Support\Collection
    {
        return $schools->map(fn (School $school) => Section::firstOrCreate(
            ['school_id' => $school->id, 'semester_id' => $semester->id, 'name' => 'A'],
            ['faculty_id' => $school->faculty_id, 'status' => 1]
        ));
    }

    private function seedModules(): void
    {
        foreach (['Módulo I', 'Módulo II', 'Módulo III', 'Módulo IV'] as $name) {
            if (Module::where('name', $name)->exists()) {
                continue;
            }

            $module = new Module();
            $module->name = $name;
            $module->status = 1;
            $module->save();
        }
    }

    private function seedDocumentTypes(): void
    {
        $types = [
            ['name' => 'Otros', 'code' => 'OTH', 'description' => 'Documentos generales, manuales y recursos públicos'],
            ['name' => 'Anexo 7', 'code' => 'anexo_7', 'description' => 'Documento de anexo 7'],
            ['name' => 'Anexo 8', 'code' => 'anexo_8', 'description' => 'Documento de anexo 8'],
            ['name' => 'Horario', 'code' => 'horario', 'description' => 'Documento de horario'],
            ['name' => 'Cargar Lectiva', 'code' => 'carga_lectiva', 'description' => 'Documento de carga lectiva'],
            ['name' => 'Resolucion de Designacion', 'code' => 'resolucion_designacion', 'description' => 'Documento de resolución'],
            ['name' => 'Ficha de matrícula', 'code' => 'ficha', 'description' => 'Documento oficial que acredita la inscripción del estudiante en el semestre académico actual.'],
            ['name' => 'Récord Académico', 'code' => 'record', 'description' => 'Certificado detallado de las calificaciones y créditos obtenidos por el estudiante a lo largo de su carrera.'],
            ['name' => 'Fut', 'code' => 'fut', 'description' => 'Archivo formato de solicitud'],
            ['name' => 'Carta de presentación', 'code' => 'carta_presentacion', 'description' => 'Documento de presentación'],
            ['name' => 'Carta de aceptación', 'code' => 'carta_aceptacion', 'description' => 'Documento de aceptacion de empresa'],
        ];

        foreach ($types as $type) {
            DocumentType::firstOrCreate(
                ['code' => $type['code']],
                ['name' => $type['name'], 'description' => $type['description'], 'status' => 1]
            );
        }
    }

    private function seedPositions(): void
    {
        foreach (['Administrador', 'Reclutador', 'Jefe'] as $name) {
            Position::firstOrCreate(['name' => $name], ['status' => 1]);
        }
    }

    /**
     * 10 personas de ejemplo cubriendo los 5 roles, tomadas del dump
     * (Martin Nicasio) + 9 inventadas. Todas con password 12345678.
     *
     * @param  \Illuminate\Support\Collection<int, Section>  $sections
     */
    private function seedSampleUsers(\Illuminate\Support\Collection $sections): void
    {
        if ($sections->isEmpty()) {
            return;
        }

        // role_id: 1 Admin, 2 Sub Admin, 3 Docente Titular, 4 Docente Supervisor, 5 Estudiante
        $people = [
            ['dni' => '70982942', 'names' => 'Martin', 'surnames' => 'Nicasio M.', 'email' => 'nicasio@gmail.com', 'user' => 'marti.n', 'role_id' => 1, 'phone' => '934781245', 'gender' => 'male'],
            ['dni' => '71234567', 'names' => 'Carlos', 'surnames' => 'Ramírez Soto', 'email' => 'admin2@gmail.com', 'user' => 'carlos.ramirez', 'role_id' => 1, 'phone' => '911111111', 'gender' => 'male'],
            ['dni' => '72345678', 'names' => 'Lucía', 'surnames' => 'Fernández Paz', 'email' => 'subadmin1@gmail.com', 'user' => 'lucia.fernandez', 'role_id' => 2, 'phone' => '922222222', 'gender' => 'female'],
            ['dni' => '73456789', 'names' => 'Jorge', 'surnames' => 'Salazar Vega', 'email' => 'subadmin2@gmail.com', 'user' => 'jorge.salazar', 'role_id' => 2, 'phone' => '933333333', 'gender' => 'male'],
            ['dni' => '74567890', 'names' => 'Rosa', 'surnames' => 'Huamán Torres', 'email' => 'docente1@gmail.com', 'user' => 'rosa.huaman', 'role_id' => 3, 'phone' => '944444444', 'gender' => 'female'],
            ['dni' => '75678901', 'names' => 'Pedro', 'surnames' => 'Quispe Rojas', 'email' => 'docente2@gmail.com', 'user' => 'pedro.quispe', 'role_id' => 3, 'phone' => '955555555', 'gender' => 'male'],
            ['dni' => '76789012', 'names' => 'Ana', 'surnames' => 'Vargas Luna', 'email' => 'supervisor1@gmail.com', 'user' => 'ana.vargas', 'role_id' => 4, 'phone' => '966666666', 'gender' => 'female'],
            ['dni' => '77890123', 'names' => 'Luis', 'surnames' => 'Castillo Díaz', 'email' => 'supervisor2@gmail.com', 'user' => 'luis.castillo', 'role_id' => 4, 'phone' => '977777777', 'gender' => 'male'],
            ['dni' => '78901234', 'names' => 'María', 'surnames' => 'Torres Flores', 'email' => 'estudiante1@gmail.com', 'user' => 'maria.torres', 'role_id' => 5, 'phone' => '988888888', 'gender' => 'female'],
            ['dni' => '79012345', 'names' => 'Diego', 'surnames' => 'Mendoza Ríos', 'email' => 'estudiante2@gmail.com', 'user' => 'diego.mendoza', 'role_id' => 5, 'phone' => '999999999', 'gender' => 'male'],
        ];

        foreach ($people as $index => $data) {
            $person = Person::firstOrCreate(
                ['dni' => $data['dni']],
                [
                    'names' => $data['names'],
                    'surnames' => $data['surnames'],
                    'phone' => $data['phone'],
                    'gender' => $data['gender'],
                    'status' => PersonStatus::ACTIVE,
                ]
            );

            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'person_id' => $person->id,
                    'name' => $data['user'],
                    'password' => Hash::make(self::DEFAULT_PASSWORD),
                    'type_user_id' => 2,
                ]
            );

            $section = $sections->get($index % $sections->count());

            Assignment::firstOrCreate(
                ['user_id' => $user->id, 'role_id' => $data['role_id'], 'semester_id' => $section->semester_id],
                [
                    'section_id' => $section->id,
                    'access_status' => AssignmentAccessStatus::FULL,
                    'approval_status' => AssignmentApprovalStatus::APPROVED,
                    'review_status' => AssignmentReviewStatus::NONE,
                    'status' => AssignmentStatus::ACTIVE,
                    'is_select' => false,
                ]
            );
        }
    }
}
