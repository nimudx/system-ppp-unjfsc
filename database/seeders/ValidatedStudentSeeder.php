<?php

namespace Database\Seeders;

use App\Domains\Company\Enums\CompanyRequestState as State;
use App\Domains\Company\Models\Company;
use App\Domains\Company\Models\CompanyValidationRequest;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use Illuminate\Database\Seeder;

class ValidatedStudentSeeder extends Seeder
{
    private const STUDENT_EMAIL = 'brunoestudiante@unjfsc.edu.pe';

    private const TEACHER_EMAIL = 'brunotitular@unjfsc.edu.pe';

    private const COMPANY_RUC = '20345678901';

    /**
     * Deja al estudiante con la solicitud de empresa aceptada por el titular y la empresa.
     * Requiere: StudentUserSeeder, TitularUserSeeder y DemoCompanySeeder.
     */
    public function run(): void
    {
        $student = $this->assignmentOf(self::STUDENT_EMAIL, 5);
        $teacher = $this->assignmentOf(self::TEACHER_EMAIL, 3);
        $company = Company::where('ruc', self::COMPANY_RUC)->firstOrFail();
        $companyUser = User::findOrFail($company->account_user_id);

        // La empresa figura aprobada por el titular
        if ($company->approved_by_assignment_id === null) {
            $company->update([
                'approved_by_assignment_id' => $teacher->id,
                'approved_at' => now(),
            ]);
        }

        $request = CompanyValidationRequest::updateOrCreate(
            ['assignment_id' => $student->id],
            [
                'school_id' => $student->section->school_id,
                'semester_id' => $student->semester_id,
                'company_id' => $company->id,
                'ruc' => $company->ruc,
                'company_data' => $company->only(['name', 'razon', 'address', 'phone', 'email']),
                'is_new_company' => false,
                'state' => State::ACCEPTED,
                'ruc_document_path' => null,
                'declaration_text' => config('company_validation.declaration_text') ?? 'Declaración de prueba (seed).',
                'declaration_version' => config('company_validation.declaration_version') ?? 'seed',
                'declared_at' => now(),
                'reviewed_by_assignment_id' => $teacher->id,
                'reviewed_at' => now(),
                'review_comment' => 'Aprobado (seed)',
                'company_decided_at' => now(),
                'company_comment' => 'Aceptado (seed)',
                'last_invited_at' => now(),
            ]
        );

        // Rastro de auditoría coherente con lo que haría el flujo real
        $request->events()->firstOrCreate(
            ['action' => 'accept'],
            [
                'actor_user_id' => $companyUser->id,
                'actor_assignment_id' => null,
                'from_state' => State::AWAITING_COMPANY->value,
                'to_state' => State::ACCEPTED->value,
                'comment' => 'Aceptado (seed)',
            ]
        );
    }

    private function assignmentOf(string $email, int $roleId): Assignment
    {
        $user = User::where('email', $email)->firstOrFail();

        return Assignment::with('section')
            ->where('user_id', $user->id)
            ->where('role_id', $roleId)
            ->firstOrFail();
    }
}
