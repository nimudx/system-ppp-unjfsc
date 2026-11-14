<?php

namespace Database\Seeders;

use App\Domains\Academic\Models\School;
use App\Domains\Academic\Models\Semester;
use App\Domains\Company\Models\Company;
use App\Domains\Company\Models\Position;
use App\Domains\Company\Models\Staff;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use App\Domains\JobBoard\Enums\CandidateStatus;
use App\Domains\JobBoard\Enums\VacancyCloseReason;
use App\Domains\JobBoard\Enums\VacancyModality;
use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Enums\VacancyType;
use App\Domains\JobBoard\Models\Vacancy;
use App\Domains\JobBoard\Models\VacancyCandidate;
use App\Domains\JobBoard\Models\VacancyView;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Escenario demostrativo de la Bolsa Laboral.
 *
 * Requiere: SubAdminUserSeeder, TitularUserSeeder, StudentUserSeeder y
 * DemoCompanySeeder (DatabaseSeeder los ejecuta antes en local/staging).
 *
 * Deja datos para recorrer los tres perfiles del módulo:
 * - Empresa: varias vacantes propias en distintos estados.
 * - Admin/subadmin: vacantes nuevas, observadas, rechazadas y publicadas.
 * - Titular: vacantes publicadas con estudiantes ya propuestos y otros libres.
 */
class JobBoardDemoSeeder extends Seeder
{
    private const PASSWORD = '12345678';

    public function run(): void
    {
        $semester = Semester::query()->where('code', '2026-I')->firstOrFail();

        $admin = $this->assignment('brunoadmin@gmail.com', 1);
        $teacher = $this->assignment('brunotitular@unjfsc.edu.pe', 3);
        $students = $this->students();

        $demo = Company::query()->where('ruc', '20345678901')->firstOrFail();
        $tech = $this->company(
            name: 'TechSolutions Perú S.A.C.',
            ruc: '20481234567',
            email: 'empresa.tech@unjfsc.edu.pe',
            representative: 'Carlos Mendoza Ríos',
            address: 'Av. Universitaria 456, Huacho',
            phone: '987111222',
            website: 'https://techsolutions.example.test',
            teacher: $teacher,
        );
        $innovation = $this->company(
            name: 'Innovación Digital del Pacífico S.A.C.',
            ruc: '20512345678',
            email: 'empresa.innovacion@unjfsc.edu.pe',
            representative: 'Valeria Torres Flores',
            address: 'Jr. Comercio 789, Huacho',
            phone: '987333444',
            website: 'https://innovaciondigital.example.test',
            teacher: $teacher,
        );

        $systems = $this->school('Ingeniería de Sistemas')->id;
        $informatics = $this->school('Ingeniería Informática')->id;
        $industrial = $this->school('Ingeniería Industrial')->id;
        $administration = $this->school('Administración y Gestión')->id;
        $marketing = $this->school('Marketing')->id;
        $mathematics = $this->school('Matemáticas')->id;
        $biology = $this->school('Biología')->id;

        /*
         * Empresa Demo: una vacante publicada con tres propuestas, una
         * observación del admin, un borrador y una vacante cerrada.
         */
        $backend = $this->vacancy($demo, $semester->id, 'Desarrollador Backend Junior', [$systems, $informatics], [
            'description' => 'Apoyo en el desarrollo de APIs y módulos internos para el área de tecnología.',
            'type' => VacancyType::PRACTICAS,
            'modality' => VacancyModality::HIBRIDO,
            'area_name' => 'Tecnología',
            'location' => 'Huacho',
            'positions_count' => 2,
            'requirements' => 'Conocimientos de PHP/Laravel, SQL y Git. Disponibilidad de 30 horas semanales.',
            'deadline_at' => now()->addDays(20),
            'status' => VacancyStatus::PUBLISHED,
            'published_at' => now()->subDays(2),
            'reviewed_by_assignment_id' => $admin->id,
            'reviewed_at' => now()->subDays(2),
        ]);

        $this->vacancy($demo, $semester->id, 'Practicante de Base de Datos', [$systems], [
            'description' => 'Soporte en el diseño, mantenimiento y respaldo de las bases de datos de la empresa.',
            'type' => VacancyType::PRACTICAS,
            'modality' => VacancyModality::PRESENCIAL,
            'area_name' => 'Tecnología',
            'location' => 'Huacho',
            'positions_count' => 1,
            'requirements' => 'SQL, modelado de datos y manejo de MariaDB o MySQL.',
            'deadline_at' => now()->addDays(15),
            'status' => VacancyStatus::OBSERVED,
            'review_comment' => 'Adjunta el detalle de funciones y el rango de la subvención económica antes de publicarla.',
            'reviewed_by_assignment_id' => $admin->id,
            'reviewed_at' => now()->subDay(),
        ]);

        $this->vacancy($demo, $semester->id, 'Analista de Soporte TI', [$systems, $informatics], [
            'description' => 'Atención de incidencias de primer nivel y soporte a usuarios internos.',
            'type' => VacancyType::EMPLEO,
            'modality' => VacancyModality::PRESENCIAL,
            'area_name' => 'Soporte técnico',
            'location' => 'Huacho',
            'positions_count' => 1,
            'requirements' => 'Conocimientos de redes, Windows y atención al usuario.',
            'deadline_at' => now()->addDays(30),
            'status' => VacancyStatus::DRAFT,
        ]);

        $quality = $this->vacancy($demo, $semester->id, 'Practicante de Calidad de Software', [$systems], [
            'description' => 'Ejecución de pruebas manuales y documentación de incidencias del producto.',
            'type' => VacancyType::PRACTICAS,
            'modality' => VacancyModality::REMOTO,
            'area_name' => 'Calidad',
            'location' => 'Remoto',
            'positions_count' => 1,
            'requirements' => 'Conocimientos de pruebas de software y documentación.',
            'deadline_at' => now()->subDays(12),
            'status' => VacancyStatus::CLOSED,
            'published_at' => now()->subDays(45),
            'reviewed_by_assignment_id' => $admin->id,
            'reviewed_at' => now()->subDays(45),
            'closed_at' => now()->subDays(10),
            'closed_reason' => VacancyCloseReason::FILLED,
        ]);

        /*
         * TechSolutions: una vacante nueva por revisar, una publicada con
         * propuesta y una rechazada por el administrador.
         */
        $fullStack = $this->vacancy($tech, $semester->id, 'Desarrollador Full Stack', [$systems, $informatics], [
            'description' => 'Desarrollo de funcionalidades web con Laravel y React para clientes de la empresa.',
            'type' => VacancyType::EMPLEO,
            'modality' => VacancyModality::HIBRIDO,
            'area_name' => 'Desarrollo de software',
            'location' => 'Lima',
            'positions_count' => 2,
            'requirements' => 'Experiencia con Laravel, React, TypeScript y control de versiones.',
            'deadline_at' => now()->addDays(25),
            'status' => VacancyStatus::PENDING_REVIEW,
        ]);

        $cyber = $this->vacancy($tech, $semester->id, 'Practicante de Ciberseguridad', [$systems, $informatics], [
            'description' => 'Apoyo en la revisión de vulnerabilidades y buenas prácticas de seguridad.',
            'type' => VacancyType::PRACTICAS,
            'modality' => VacancyModality::REMOTO,
            'area_name' => 'Seguridad informática',
            'location' => 'Remoto',
            'positions_count' => 2,
            'requirements' => 'Conocimientos de redes, Linux y fundamentos de seguridad.',
            'deadline_at' => now()->addDays(18),
            'status' => VacancyStatus::PUBLISHED,
            'published_at' => now()->subDays(4),
            'reviewed_by_assignment_id' => $admin->id,
            'reviewed_at' => now()->subDays(4),
        ]);

        $this->vacancy($tech, $semester->id, 'Especialista en Redes y Telecomunicaciones', [$informatics], [
            'description' => 'Administración de la infraestructura de red y atención de incidencias.',
            'type' => VacancyType::EMPLEO,
            'modality' => VacancyModality::PRESENCIAL,
            'area_name' => 'Infraestructura',
            'location' => 'Lima',
            'positions_count' => 1,
            'requirements' => 'Certificación en redes y experiencia mínima de un año.',
            'deadline_at' => now()->addDays(40),
            'status' => VacancyStatus::REJECTED,
            'review_comment' => 'La vacante duplica una publicación anterior y no especifica el horario de trabajo.',
            'reviewed_by_assignment_id' => $admin->id,
            'reviewed_at' => now()->subDays(6),
        ]);

        /*
         * Innovación Digital: vacantes publicadas para distintas escuelas,
         * dos observaciones y propuestas de otros estudiantes.
         */
        $analytics = $this->vacancy($innovation, $semester->id, 'Practicante de Análisis de Datos', [$systems, $mathematics], [
            'description' => 'Construcción de tableros y análisis de indicadores del negocio.',
            'type' => VacancyType::PRACTICAS,
            'modality' => VacancyModality::HIBRIDO,
            'area_name' => 'Datos',
            'location' => 'Huacho',
            'positions_count' => 2,
            'requirements' => 'Excel avanzado, SQL y nociones de Power BI.',
            'deadline_at' => now()->addDays(22),
            'status' => VacancyStatus::PUBLISHED,
            'published_at' => now()->subDays(8),
            'reviewed_by_assignment_id' => $admin->id,
            'reviewed_at' => now()->subDays(8),
        ]);

        $this->vacancy($innovation, $semester->id, 'Asistente de Proyectos Digitales', [$industrial, $administration], [
            'description' => 'Seguimiento de cronogramas y documentación de proyectos digitales.',
            'type' => VacancyType::PRACTICAS,
            'modality' => VacancyModality::PRESENCIAL,
            'area_name' => 'Gestión de proyectos',
            'location' => 'Huacho',
            'positions_count' => 1,
            'requirements' => 'Organización, comunicación y manejo de hojas de cálculo.',
            'deadline_at' => now()->addDays(28),
            'status' => VacancyStatus::PUBLISHED,
            'published_at' => now()->subDays(12),
            'reviewed_by_assignment_id' => $admin->id,
            'reviewed_at' => now()->subDays(12),
        ]);

        $this->vacancy($innovation, $semester->id, 'Diseñador UX/UI', [$administration, $marketing], [
            'description' => 'Diseño de prototipos y validación de experiencias de usuario para productos digitales.',
            'type' => VacancyType::EMPLEO,
            'modality' => VacancyModality::REMOTO,
            'area_name' => 'Diseño',
            'location' => 'Remoto',
            'positions_count' => 1,
            'requirements' => 'Portafolio de diseño y manejo de Figma.',
            'deadline_at' => now()->addDays(35),
            'status' => VacancyStatus::OBSERVED,
            'review_comment' => 'Indica si la modalidad es totalmente remota y precisa el rango salarial.',
            'reviewed_by_assignment_id' => $admin->id,
            'reviewed_at' => now()->subDays(3),
        ]);

        // Vacante de otra facultad: el subadmin de Sistemas no debe verla.
        $this->vacancy($innovation, $semester->id, 'Asistente de Laboratorio de Biología', [$biology], [
            'description' => 'Apoyo en el registro de muestras y preparación de material de laboratorio.',
            'type' => VacancyType::PRACTICAS,
            'modality' => VacancyModality::PRESENCIAL,
            'area_name' => 'Ciencias biológicas',
            'location' => 'Huacho',
            'positions_count' => 1,
            'requirements' => 'Estudios de Biología y cuidado en el manejo de muestras.',
            'deadline_at' => now()->addDays(16),
            'status' => VacancyStatus::PUBLISHED,
            'published_at' => now()->subDays(3),
            'reviewed_by_assignment_id' => $admin->id,
            'reviewed_at' => now()->subDays(3),
        ]);

        // Propuestas del docente titular: los seis estudiantes del equipo participan.
        $this->candidate($backend, $students['bruno'], $teacher, CandidateStatus::HIRED,
            'Egresado con experiencia en Laravel y buen récord académico.',
            'Contratado: la empresa confirmó su incorporación.');
        $this->candidate($backend, $students['mirko'], $teacher, CandidateStatus::CONTACTED,
            'Buen dominio de SQL y bases de datos.',
            'Entrevista programada con la empresa.');
        $this->candidate($backend, $students['aldo'], $teacher, CandidateStatus::PROPOSED,
            'Proyecto de fin de curso destacado en desarrollo web.');

        $this->candidate($quality, $students['yefferson'], $teacher, CandidateStatus::HIRED,
            'Perfil con experiencia en pruebas automatizadas.',
            'Contratado por la empresa.');

        $this->candidate($cyber, $students['jean'], $teacher, CandidateStatus::PROPOSED,
            'Interés y cursos previos en seguridad informática.');

        $this->candidate($analytics, $students['renzo'], $teacher, CandidateStatus::DISCARDED,
            'Conocimientos básicos de análisis de datos.',
            'Descartado: la empresa buscaba experiencia previa en Power BI.');

        /*
         * Vistas para que la etiqueta "Nuevo" se comporte como en uso real:
         * el titular ya revisó dos vacantes y aún no abrió la de ciberseguridad.
         */
        $this->seen($backend, $teacher->user_id);
        $this->seen($analytics, $teacher->user_id);
    }

    /**
     * @return array<string, Assignment>
     */
    private function students(): array
    {
        $students = [];

        foreach (['bruno', 'mirko', 'aldo', 'renzo', 'jean', 'yefferson'] as $name) {
            $students[$name] = $this->assignment("{$name}estudiante@unjfsc.edu.pe", 5);
        }

        return $students;
    }

    private function assignment(string $email, int $roleId): Assignment
    {
        $user = User::query()->where('email', $email)->firstOrFail();

        return Assignment::query()
            ->with('section')
            ->where('user_id', $user->id)
            ->where('role_id', $roleId)
            ->where('status', 1)
            ->firstOrFail();
    }

    private function school(string $name): School
    {
        return School::query()->where('name', $name)->firstOrFail();
    }

    private function company(
        string $name,
        string $ruc,
        string $email,
        string $representative,
        string $address,
        string $phone,
        string $website,
        Assignment $teacher,
    ): Company {
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'person_id' => null,
                'name' => Str::before($email, '@'),
                'password' => Hash::make(self::PASSWORD),
                'type_user_id' => 3, // Empresa
                'status' => 1,
            ]
        );

        $company = Company::firstOrCreate(
            ['ruc' => $ruc],
            [
                'name' => $name,
                'razon' => $name,
                'address' => $address,
                'phone' => $phone,
                'email' => $email,
                'website' => $website,
                'status' => 1,
                'account_user_id' => $user->id,
                'representative_name' => $representative,
                'representative_phone' => $phone,
                'activated_at' => now(),
                'approved_by_assignment_id' => $teacher->id,
                'approved_at' => now(),
            ]
        );

        // Si la empresa ya existía sin cuenta vinculada, se completa el binding.
        if ($company->account_user_id === null) {
            $company->update([
                'account_user_id' => $user->id,
                'representative_name' => $representative,
                'representative_phone' => $phone,
                'activated_at' => now(),
                'approved_by_assignment_id' => $teacher->id,
                'approved_at' => now(),
            ]);
        }

        $position = Position::query()->where('name', 'Reclutador')->firstOrFail();

        Staff::firstOrCreate(
            ['company_id' => $company->id, 'user_id' => $user->id],
            [
                'position_id' => $position->id,
                'email' => $email,
                'phone' => $phone,
                'status' => 1,
                'is_select' => true,
            ]
        );

        return $company;
    }

    /**
     * @param  array<int, int>  $schoolIds
     * @param  array<string, mixed>  $attributes
     */
    private function vacancy(
        Company $company,
        int $semesterId,
        string $title,
        array $schoolIds,
        array $attributes,
    ): Vacancy {
        $vacancy = Vacancy::updateOrCreate(
            ['company_id' => $company->id, 'title' => $title],
            [
                'semester_id' => $semesterId,
                'description' => null,
                'type' => VacancyType::PRACTICAS,
                'modality' => VacancyModality::PRESENCIAL,
                'area_name' => null,
                'location' => 'Huacho',
                'positions_count' => 1,
                'requirements' => null,
                'deadline_at' => now()->addDays(20),
                'status' => VacancyStatus::DRAFT,
                'review_comment' => null,
                'reviewed_by_assignment_id' => null,
                'reviewed_at' => null,
                'published_at' => null,
                'closed_at' => null,
                'closed_reason' => null,
                ...$attributes,
            ]
        );

        $vacancy->schools()->sync($schoolIds);

        return $vacancy->refresh()->load('schools');
    }

    private function candidate(
        Vacancy $vacancy,
        Assignment $student,
        Assignment $teacher,
        CandidateStatus $status,
        ?string $note = null,
        ?string $statusNote = null,
    ): VacancyCandidate {
        return VacancyCandidate::firstOrCreate(
            [
                'vacancy_id' => $vacancy->id,
                'student_assignment_id' => $student->id,
            ],
            [
                'proposed_by_assignment_id' => $teacher->id,
                'note' => $note,
                'status' => $status,
                'status_note' => $statusNote,
            ]
        );
    }

    private function seen(Vacancy $vacancy, int $userId): void
    {
        VacancyView::firstOrCreate(
            ['vacancy_id' => $vacancy->id, 'user_id' => $userId],
            ['seen_at' => now()->subDay()]
        );
    }
}
