<?php

namespace App\Services\Registration;

use App\Enums\Academic\SemesterStatus;
use App\Enums\Assignment\AssignmentAccessStatus;
use App\Enums\Assignment\AssignmentApprovalStatus;
use App\Enums\Assignment\AssignmentReviewStatus;
use App\Enums\Assignment\AssignmentStatus;
use App\Enums\PersonStatus;
use App\Enums\UserStatus;
use App\Exceptions\Registration\RegistrationAssignmentsMustBelongToSameFacultyException;
use App\Exceptions\Registration\RegistrationNotAllowedException;
use App\Exceptions\Registration\RegistrationRoleNotAllowedException;
use App\Exceptions\Registration\RegistrationSectionNotAllowedException;
use App\Exceptions\Registration\UserAlreadyAssignedInSemesterException;
use App\Exceptions\Registration\UserAlreadyRegisteredInSectionException;
use App\Exceptions\Registration\UserCannotBeSupervisorDueToExistingRoleException;
use App\Models\Assignment;
use App\Models\Person;
use App\Models\Section;
use App\Models\Semester;
use App\Models\User;
use App\Models\Company;
use App\Services\Auth\AccountActivationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserRegistrationService
{
    public function __construct(
        protected AccountActivationService $activationService,
    ) {}
    /**
     * Validate the data for the first step of the registration process.
     *
     * @param  array  $data  The data to validate.
     * @return array An array of errors, if any.
     */
    public function validateStepOne(Assignment $authAssignment, array $data, int $semesterId): array
    {
        $this->authorizeUserAction($authAssignment, $data['role_id'], $data['section_id']);

        $user = User::query()->where('email', $data['email'])->first();

        $person = collect();
        if ($user) {
            $this->validateRoleRulesUserAcademic($user, $data['role_id'], $data['section_id'], $semesterId);
            $person = Person::query()->where('id', $user->person_id)->select('id', 'dni', 'names', 'surnames')->first() ?? collect();
        }

        return [
            'user_exists' => (bool) $user,
            'user_id' => $user?->id,
            'email' => $data['email'],
            'role_id' => $data['role_id'],
            'section_id' => $data['section_id'],
            'semester_id' => $semesterId,
            'next_step' => 'PERSON_LOOKUP',
            'person' => $person,
        ];
    }

    /**
     * Validate step two of the registration process.
     * @param array $data
     * @return array
     */
    public function validateStepTwo(array $data): array
    {
        $person = Person::query()->where('dni', $data['dni'])->first();

        if (!$person) {
            return [
                'person_exists' => false,
                'dni' => $data['dni'],
                'next_step' => 'PERSON_CREATE',
            ];
        }

        return [
            'person_exists' => true,
            'person' => [
                'id' => $person->id,
                'dni' => $person->dni,
                'names' => $person->names,
                'surnames' => $person->surnames,
            ],
            'next_step' => 'FINALIZE_REGISTRATION',
        ];
    }

    /**
     * Finalize the registration process by creating the necessary records.
     * This method includes a security check to re-validate data consistency.
     *
     * @param  array  $data  The validated data from the frontend.
     * @return User The result of the operation.
     */
    public function validateStepThree(array $data, int $currentSemesterId): ?User
    {
        // --- INICIO DEL BLOQUE DE SEGURIDAD Y COHERENCIA ---

        $user = null;
        if (!empty($data['user_id'])) {
            $user = User::find($data['user_id']);
            // Verificación: El email del payload debe coincidir con el del user_id encontrado.
            if ($user && $user->email !== $data['email']) {
                throw ValidationException::withMessages(['user_id' => 'Inconsistencia de datos: El ID de usuario no corresponde al email proporcionado.']);
            }
        } else {
            // Si no hay user_id, buscamos por email. Si existe, es un usuario existente.
            $user = User::where('email', $data['email'])->first();
        }

        // Si después de las verificaciones tenemos un usuario, aplicamos las reglas de negocio.
        if ($user) {
            // Re-validación de Reglas de Negocio (reutilizando la lógica de Step 1)
            $this->validateRoleRulesUserAcademic($user, $data['role_id'], $data['section_id'], $currentSemesterId);

            // Verificación de Coherencia: El person_id del usuario debe coincidir con el del payload.
            if (!empty($data['person']['id']) && $user->authenticable_id != $data['person']['id']) {
                throw ValidationException::withMessages(['person' => 'Inconsistencia de datos: La persona indicada no corresponde al usuario existente.']);
            }
        }

        return $user;
    }

    /**
     * Registers a user for academic purposes.
     *
     * @param  array  $data  The registration data.
     * @param  int  $currentSemesterId  The current semester ID.
     */
    public function registerUserAcademic(array $data, int $currentSemesterId, int $assignmentId): void
    {
        DB::transaction(function () use ($data, $currentSemesterId, $assignmentId) {
            $this->processSingleAcademicRegistration($data, $currentSemesterId);
        });
    }

    public function registerUserAcademicMassive(array $data, int $currentSemesterId, int $assignmentId): array
    {
        $report = [
            'total' => count($data['rows']),
            'success_count' => 0,
            'failed_count' => 0,
            'errors' => []
        ];

        foreach ($data['rows'] as $index => $row) {
            try {
                DB::transaction(function () use ($data, $row, $currentSemesterId) {
                    $payload = [
                        'email' => $row['email'],
                        'role_id' => $data['role_id'],
                        'section_id' => $data['section_id'],
                        'person' => [
                            'dni' => $row['dni'],
                            'names' => $row['names'],
                            'surnames' => $row['surnames'],
                        ]
                    ];

                    $this->processSingleAcademicRegistration($payload, $currentSemesterId);
                });

                $report['success_count']++;
            } catch (ValidationException $e) {
                $report['failed_count']++;
                $report['errors'][] = [
                    'row' => $index + 1,
                    'dni' => $row['dni'],
                    'email' => $row['email'],
                    'message' => collect($e->errors())->flatten()->first()
                ];
            } catch (\Exception $e) {
                $report['failed_count']++;
                $report['errors'][] = [
                    'row' => $index + 1,
                    'dni' => $row['dni'],
                    'email' => $row['email'],
                    'message' => $e->getMessage()
                ];
            }
        }

        return $report;
    }


    /**
     * Internal method to process a single academic registration.
     * Handles Person, User and Assignment creation with business rules validation.
     */
    private function processSingleAcademicRegistration(array $data, int $semesterId): void
    {
        // 1. Buscar Persona por DNI
        $person = Person::where('dni', $data['person']['dni'])->first();

        if (!$person) {
            $person = Person::create([
                'dni' => $data['person']['dni'],
                'names' => $data['person']['names'],
                'surnames' => $data['person']['surnames'],
                'status' => PersonStatus::ACTIVE,
            ]);
        }

        // 2. Buscar/Crear Usuario por Email
        $user = User::where('email', $data['email'])->first();

        if ($user) {
            // SEGURIDAD: Si el usuario existe, debe pertenecer a la misma persona
            if ($user->authenticable_id !== $person->id) {
                throw ValidationException::withMessages([
                    'email' => "El email {$data['email']} ya está registrado a otra persona con distinto DNI."
                ]);
            }
        } else {
            // Extraer el name del email: maria@gmail.com -> maria
            $code = explode('@', $data['email'])[0];
            $user = User::create([
                'person_id'    => $person->id,
                'name'         => $code,
                'email'        => $data['email'],
                'password'     => Str::random(32), // placeholder; se reemplaza al activar
                'type_user_id' => 2,               // Tipo Académico
                'status'       => UserStatus::PENDING->value, // Pendiente de activación
            ]);

            // Generar token y enviar correo de activación
            $activation = $this->activationService->createActivationToken($user);
            $this->activationService->sendActivationEmail($user, $activation);
        }

        // 3. Validar Reglas de Negocio (Roles, Secciones, Semestre)
        $this->validateRoleRulesUserAcademic($user, (int) $data['role_id'], (int) $data['section_id'], $semesterId);

        // 4. Crear Asignación
        Assignment::create([
            'user_id' => $user->id,
            'role_id' => $data['role_id'],
            'semester_id' => $semesterId,
            'section_id' => $data['section_id'],
            'access_status' => AssignmentAccessStatus::LIMITED,
            'approval_status' => AssignmentApprovalStatus::PENDING,
            'review_status' => AssignmentReviewStatus::NONE,
            'status' => AssignmentStatus::ACTIVE,
        ]);
    }


    /**
     * Registers a user for a company.
     * @param array $data
     * @return User
     */
    public function registerUserCompany(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $company = Company::query()->find($data['ruc']);

            if ($company) {
                throw new \Exception('Company already exists');
            }

            $company = Company::query()->create([
                'name' => $data['name'],
                'ruc' => $data['ruc'],
                'razon' => $data['razon'],
                'address' => $data['address'],
                'phone' => $data['phone'],
                'email' => $data['email'],
            ]);

            $user = User::query()->create([
                'authenticable_id'   => $company->id,
                'authenticable_type' => Company::class,
                'name'               => $data['name'],
                'email'              => $data['email'],
                'password'           => Str::random(32), // placeholder; se reemplaza al activar
                'type_user_id'       => 3,
                'status'             => UserStatus::PENDING->value, // Pendiente de activación
            ]);

            // Generar token y enviar correo de activación
            $activation = $this->activationService->createActivationToken($user);
            $this->activationService->sendActivationEmail($user, $activation);

            return $user->load('company');
        });
    }

    private function authorizeUserAction(Assignment $authAssignment, int $targetRoleId, int $targetSectionId): void
    {
        $myRole = $authAssignment->role_id;

        if ($myRole === 1) {
            return;
        }

        // Falta la regla para el user role 2

        // Rule 1: Roles 4 and 5 not register
        if (in_array($myRole, [4, 5])) {
            throw new RegistrationNotAllowedException;
        }

        if ($myRole === 3) {
            if (!in_array($targetRoleId, [4, 5])) {
                throw new RegistrationRoleNotAllowedException;
            }

            if ($authAssignment->section_id !== $targetSectionId) {
                throw new RegistrationSectionNotAllowedException;
            }
        }
    }

    private function validateRoleRulesUserAcademic(User $user, int $newRoleId, int $newSectionId, int $semesterId): void
    {
        $currentAssignments = Assignment::with(['section', 'role'])
            ->where('user_id', $user->id)
            ->where('semester_id', $semesterId)
            ->where('status', AssignmentStatus::ACTIVE)
            ->get();

        if ($currentAssignments->isEmpty()) {
            return; // Sin asignaciones activas → puede registrarse
        }

        $firstAssignment = $currentAssignments->first();
        $existingRoleName = $firstAssignment->role->name;

        // --- CASE 1: SUBADMIN (2) — solo puede tener 1 asignación por semestre ---
        if ($newRoleId === 2) {
            throw new UserAlreadyAssignedInSemesterException($existingRoleName);
        }

        // --- CASE 2: ROLES ÚNICOS POR SEMESTRE (1, 3, 5) ---
        if (in_array($newRoleId, [1, 3, 5])) {
            if ($firstAssignment->section_id === $newSectionId) {
                throw new UserAlreadyRegisteredInSectionException($existingRoleName);
            }
            // No puede tener otro rol diferente a Supervisor (4) en el mismo semestre
            if ($firstAssignment->role_id !== 4) {
                throw new UserAlreadyAssignedInSemesterException($existingRoleName);
            }
        }

        // --- CASE 3: SUPERVISOR (4) — puede tener múltiples, pero todas en la misma facultad ---
        if ($newRoleId === 4) {
            $newSection = Section::query()->findOrFail($newSectionId);
            $newFacultyId = $newSection->faculty_id;

            // Verificar que no esté ya asignado a esa misma sección
            if ($currentAssignments->contains('section_id', $newSectionId)) {
                throw new UserAlreadyRegisteredInSectionException($existingRoleName);
            }

            foreach ($currentAssignments as $assignment) {
                if ($assignment->section->faculty_id !== $newFacultyId) {
                    throw new RegistrationAssignmentsMustBelongToSameFacultyException();
                }
            }
        }
    }
}