<?php

namespace Database\Seeders;

use App\Domains\Company\Models\Company;
use App\Domains\Company\Models\CompanyValidationRequest;
use App\Domains\Company\Models\Staff;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use App\Domains\Internship\Models\Internship;
use App\Domains\Internship\Models\Placement;
use Illuminate\Database\Seeder;

class StudentInternshipSeeder extends Seeder
{
    private const STUDENT_EMAIL = 'brunoestudiante@unjfsc.edu.pe';

    private const COMPANY_RUC = '20345678901';

    /**
     * Placement aprobado + Internship en paso 1 para el estudiante demo.
     * Requiere: ValidatedStudentSeeder (solicitud de empresa ACCEPTED).
     */
    public function run(): void
    {
        $user = User::where('email', self::STUDENT_EMAIL)->firstOrFail();
        $student = Assignment::where('user_id', $user->id)->where('role_id', 5)->firstOrFail();

        $company = Company::where('ruc', self::COMPANY_RUC)->firstOrFail();
        $staff = Staff::where('company_id', $company->id)->firstOrFail();
        $request = CompanyValidationRequest::where('assignment_id', $student->id)->firstOrFail();

        $placement = Placement::updateOrCreate(
            ['assignment_id' => $student->id],
            [
                'company_id' => $company->id,
                'company_validation_request_id' => $request->id,
                'practice_declared_at' => now(),
                'practice_declaration_text' => 'Declaración de prueba (seed).',
                'staff_id' => $staff->id,
                'boss_name' => $company->representative_name,
                'boss_position' => 'Gerente General',
                'boss_phone' => $company->phone,
                'boss_email' => $company->email,
                'position' => 'Practicante de Desarrollo de Software',
                'description' => 'Práctica de prueba generada por seeder.',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addMonths(6)->toDateString(),
                'approval_status' => 1, // aprobado (en el front: locked = approval_status === 1)
                'status' => 1,
            ]
        );

        Internship::firstOrCreate(
            ['assignment_id' => $student->id, 'placement_id' => $placement->id],
            ['internship_step' => 1, 'status' => 1]
        );
    }
}
