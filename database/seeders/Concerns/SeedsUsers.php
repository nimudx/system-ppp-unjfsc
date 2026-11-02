<?php

namespace Database\Seeders\Concerns;

use App\Domains\Academic\Models\School;
use App\Domains\Academic\Models\Section;
use App\Domains\Academic\Models\Semester;
use App\Domains\Identity\Enums\AssignmentAccessStatus;
use App\Domains\Identity\Enums\AssignmentApprovalStatus;
use App\Domains\Identity\Enums\AssignmentReviewStatus;
use App\Domains\Identity\Enums\AssignmentStatus;
use App\Domains\Identity\Enums\PersonStatus;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\Person;
use App\Domains\Identity\Models\User;
use Illuminate\Support\Facades\Hash;

trait SeedsUsers
{
    protected function defaultPassword(): string
    {
        return '12345678';
    }

    /** @return array<int, string> */
    protected function teamNames(): array
    {
        return ['Bruno', 'Mirko', 'Aldo', 'Renzo', 'Jean', 'Yefferson'];
    }

    protected function currentSemester(): Semester
    {
        return Semester::where('code', '2026-I')->firstOrFail();
    }

    /** Sección 'A' de Ingeniería de Sistemas en 2026-I. */
    protected function systemsSection(): Section
    {
        $school = School::where('name', 'Ingeniería de Sistemas')->firstOrFail();

        return Section::where([
            'school_id' => $school->id,
            'semester_id' => $this->currentSemester()->id,
            'name' => 'A',
        ])->firstOrFail();
    }

    /**
     * Crea (idempotente) Person + User + Assignment por cada nombre del equipo.
     *
     * @param  string  $suffix  admin | supervisor | titular
     * @param  int  $dniBase  DNI inicial (ficticio); se suma el índice
     */
    protected function seedTeamUsers(
        string $suffix,
        string $domain,
        int $roleId,
        int $typeUserId,
        int $dniBase,
        ?Section $section,
    ): void {
        $semester = $this->currentSemester();

        foreach ($this->teamNames() as $index => $first) {
            $slug = strtolower($first);
            $dni = (string) ($dniBase + $index);

            $person = Person::firstOrCreate(
                ['dni' => $dni],
                [
                    'names' => $first,
                    'surnames' => ucfirst($suffix).' Demo',
                    'phone' => '9'.$dni,
                    'gender' => 'male',
                    'status' => PersonStatus::ACTIVE,
                ]
            );

            $user = User::firstOrCreate(
                ['email' => "{$slug}{$suffix}@{$domain}"],
                [
                    'person_id' => $person->id,
                    'name' => "{$slug}.{$suffix}",
                    'password' => Hash::make($this->defaultPassword()),
                    'type_user_id' => $typeUserId,
                ]
            );

            Assignment::firstOrCreate(
                ['user_id' => $user->id, 'role_id' => $roleId, 'semester_id' => $semester->id],
                [
                    'section_id' => $section?->id,
                    'access_status' => AssignmentAccessStatus::FULL,
                    'approval_status' => AssignmentApprovalStatus::APPROVED,
                    'review_status' => AssignmentReviewStatus::NONE,
                    'status' => AssignmentStatus::ACTIVE,
                    'is_select' => true,
                ]
            );
        }
    }
}
