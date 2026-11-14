<?php

use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\Notifications\Models\Notification;
use App\Domains\Notifications\Models\NotificationRecipient;
use Database\Seeders\DatabaseSeeder;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

if (! function_exists('jobBoardRecipientIds')) {
    /**
     * @return array<int, int>
     */
    function jobBoardRecipientIds(string $type): array
    {
        return NotificationRecipient::query()
            ->whereHas('notification', fn ($query) => $query->where('type', $type))
            ->pluck('user_id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }
}

test('enviar a revision notifica a los admins y subadmins de la facultad', function () {
    [$companyUser, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $biology = jobBoardSection('Biología');
    $admin = jobBoardAcademicAssignment(1);
    $subadminSameFaculty = jobBoardAcademicAssignment(2, $systems);
    $subadminOtherFaculty = jobBoardAcademicAssignment(2, $biology);
    $teacher = jobBoardAcademicAssignment(3, $systems);

    $vacancy = jobBoardVacancy($company, [$systems->school_id]);

    jobBoardLoginCompany($this, $companyUser);
    $this->post("/empresa/bolsa/{$vacancy->id}/enviar")->assertRedirect();

    expect(Notification::query()->where('type', 'VACANCY_SUBMITTED')->count())->toBe(1);

    $recipients = jobBoardRecipientIds('VACANCY_SUBMITTED');

    expect($recipients)
        ->toContain($admin->user_id)
        ->toContain($subadminSameFaculty->user_id)
        ->not->toContain($subadminOtherFaculty->user_id)
        ->not->toContain($teacher->user_id);
});

test('aprobar una vacante avisa a los titulares de las escuelas destino', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $biology = jobBoardSection('Biología');
    $admin = jobBoardAcademicAssignment(1);
    $teacherSystems = jobBoardAcademicAssignment(3, $systems);
    $teacherBiology = jobBoardAcademicAssignment(3, $biology);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], [
        'status' => VacancyStatus::PENDING_REVIEW,
        'published_at' => null,
    ]);
    $companyUser = $company->account_user_id;

    jobBoardLogin($this, $admin);
    $this->patch("/bolsa/administracion/{$vacancy->id}/revision", [
        'decision' => 'approve',
        'school_ids' => [$systems->school_id],
    ])->assertRedirect();

    $publishedRecipients = jobBoardRecipientIds('VACANCY_PUBLISHED');

    expect($publishedRecipients)
        ->toContain($teacherSystems->user_id)
        ->not->toContain($teacherBiology->user_id);

    expect(jobBoardRecipientIds('VACANCY_REVIEWED'))->toBe([$companyUser]);
});

test('al ajustar las escuelas se avisa a los titulares de las escuelas confirmadas', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $biology = jobBoardSection('Biología');
    $admin = jobBoardAcademicAssignment(1);
    $teacherSystems = jobBoardAcademicAssignment(3, $systems);
    $teacherBiology = jobBoardAcademicAssignment(3, $biology);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], [
        'status' => VacancyStatus::PENDING_REVIEW,
        'published_at' => null,
    ]);

    jobBoardLogin($this, $admin);
    $this->patch("/bolsa/administracion/{$vacancy->id}/revision", [
        'decision' => 'approve',
        'school_ids' => [$biology->school_id],
    ])->assertRedirect();

    $publishedRecipients = jobBoardRecipientIds('VACANCY_PUBLISHED');

    expect($publishedRecipients)
        ->toContain($teacherBiology->user_id)
        ->not->toContain($teacherSystems->user_id);
});

test('aprobar con la opcion de no avisar evita la notificacion a titulares', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $admin = jobBoardAcademicAssignment(1);
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], [
        'status' => VacancyStatus::PENDING_REVIEW,
        'published_at' => null,
    ]);

    jobBoardLogin($this, $admin);
    $this->patch("/bolsa/administracion/{$vacancy->id}/revision", [
        'decision' => 'approve',
        'notify_teachers' => false,
        'school_ids' => [$systems->school_id],
    ])->assertRedirect();

    expect(jobBoardRecipientIds('VACANCY_PUBLISHED'))
        ->not->toContain($teacher->user_id)
        ->toBeEmpty();

    expect(Notification::query()->where('type', 'VACANCY_REVIEWED')->count())->toBe(1);
});

test('observar una vacante notifica solo a la empresa', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $admin = jobBoardAcademicAssignment(1);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], [
        'status' => VacancyStatus::PENDING_REVIEW,
        'published_at' => null,
    ]);

    jobBoardLogin($this, $admin);
    $this->patch("/bolsa/administracion/{$vacancy->id}/revision", [
        'decision' => 'observe',
        'comment' => 'Falta detallar el horario.',
    ])->assertRedirect();

    expect(jobBoardRecipientIds('VACANCY_REVIEWED'))->toBe([$company->account_user_id])
        ->and(Notification::query()->where('type', 'VACANCY_PUBLISHED')->count())->toBe(0);
});

test('proponer un candidato notifica a los admins de la facultad', function () {
    [, $company] = jobBoardCompany();
    $systems = jobBoardSection('Ingeniería de Sistemas');
    $biology = jobBoardSection('Biología');
    $admin = jobBoardAcademicAssignment(1);
    $subadminSameFaculty = jobBoardAcademicAssignment(2, $systems);
    $subadminOtherFaculty = jobBoardAcademicAssignment(2, $biology);
    $teacher = jobBoardAcademicAssignment(3, $systems);
    $student = jobBoardAcademicAssignment(5, $systems);
    $vacancy = jobBoardVacancy($company, [$systems->school_id], ['status' => VacancyStatus::PUBLISHED]);

    jobBoardLogin($this, $teacher);
    $this->post("/bolsa/vacantes/{$vacancy->id}/propuestas", [
        'student_ids' => [$student->id],
    ])->assertRedirect();

    expect(Notification::query()->where('type', 'CANDIDATE_PROPOSED')->count())->toBe(1);

    $recipients = jobBoardRecipientIds('CANDIDATE_PROPOSED');

    expect($recipients)
        ->toContain($admin->user_id)
        ->toContain($subadminSameFaculty->user_id)
        ->not->toContain($subadminOtherFaculty->user_id);
});
