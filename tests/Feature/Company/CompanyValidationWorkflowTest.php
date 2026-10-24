<?php

use App\Domains\Company\Enums\CompanyRequestState as State;
use App\Domains\Company\Mail\CompanyStudentInvitation;
use App\Domains\Company\Models\Company;
use App\Domains\Company\Models\CompanyInvitation;
use App\Domains\Company\Models\CompanyValidationRequest;
use App\Domains\Documents\Models\DocumentType;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use App\Domains\Internship\Models\Placement;
use Database\Seeders\Cycle2026Seeder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed([DatabaseSeeder::class, Cycle2026Seeder::class]);
    Mail::fake();
    Storage::fake('local');
    Storage::fake('public');
});

function companyProfile(int $role): Assignment
{
    $a = Assignment::where('role_id', $role)->firstOrFail();
    $a->update(['access_status' => 1, 'approval_status' => 1, 'status' => 1]);

    return $a->refresh();
}
function companyLogin($test, Assignment $a): void
{
    $test->actingAs($a->user)->withSession(['assignment_id' => $a->id, 'semester_id' => $a->semester_id]);
}
function companyPayload(string $ruc = '20999999991'): array
{
    return ['ruc' => $ruc, 'name' => 'Empresa de prueba', 'razon' => 'Empresa de prueba S.A.C.', 'address' => 'Dirección ficticia', 'phone' => '999888777', 'email' => $ruc.'@example.test', 'declaration_accepted' => true];
}
function companySubmit($test): CompanyValidationRequest
{
    $student = companyProfile(5);
    companyLogin($test, $student);
    $id = $test->postJson(route('company-validation.requests.store'), companyPayload())->assertCreated()->json('data.id');

    return CompanyValidationRequest::findOrFail($id);
}
function companyApprove($test, CompanyValidationRequest $item): void
{
    $teacher = companyProfile(3);
    $teacher->update(['section_id' => $item->assignment->section_id, 'semester_id' => $item->semester_id]);
    companyLogin($test, $teacher->refresh());
    $test->patchJson(route('company-validation.requests.review', $item), ['decision' => 'approve'])->assertOk()->assertJsonPath('data.state', 'awaiting_company');
}
function companyToken(): string
{
    $mail = Mail::queued(CompanyStudentInvitation::class)->last();
    parse_str(parse_url($mail->details['url'], PHP_URL_QUERY), $query);

    return $query['token'];
}
function companyActivate($test): User
{
    $token = companyToken();
    $test->postJson('/logout')->assertNoContent();
    $test->postJson(route('company-invitations.activate', $token), [
        'representative_name' => 'Representante de prueba', 'representative_phone' => '999777666',
        'password' => 'Contrasena123!', 'password_confirmation' => 'Contrasena123!', 'terms_accepted' => true,
    ])->assertCreated();

    return User::where('email', '20999999991@example.test')->firstOrFail();
}
function companyPlacementPayload(int $companyId): array
{
    return ['company' => ['id' => $companyId], 'internship_type' => 'development', 'origin_type' => 'direct', 'practice_declaration_accepted' => true,
        'placement' => ['boss_name' => 'Jefe de prueba', 'boss_position' => 'Jefe de Sistemas', 'boss_phone' => '999888776', 'boss_email' => 'jefe@example.test', 'area_name' => 'Tecnología', 'position' => 'Practicante', 'description' => 'Prueba local', 'start_date' => '2026-04-01', 'end_date' => '2026-08-01']];
}

test('a missing RUC opens the new company path without sending mail or creating a company', function () {
    companyLogin($this, companyProfile(5));
    $this->getJson(route('company-validation.companies.lookup', '20999999991'))->assertOk()->assertJsonPath('found', false)->assertJsonPath('next_action', 'send_request');
    $this->postJson(route('company-validation.requests.store'), companyPayload())->assertCreated()->assertJsonPath('data.state', 'pending_review')->assertJsonPath('data.company_id', null);
    $this->assertDatabaseMissing('companies', ['ruc' => '20999999991']);
    Mail::assertNothingOutgoing();
    $item = CompanyValidationRequest::firstOrFail();
    expect($item->declared_at)->not->toBeNull()->and($item->declaration_text)->toContain('válidos y correctos')->and($item->events()->count())->toBe(1);
});

test('student entry points and company notifications open the appropriate HTML screens', function () {
    $student = companyProfile(5);
    companyLogin($this, $student);
    $this->get('/estudiante/registro-empresa')->assertRedirect(route('academic.internship.submission'));
    $this->get('/internship')->assertOk()->assertInertia(fn ($page) => $page->component('internship/submission/placementIndex'));
    $this->get('/solicitudes-empresa/1')->assertRedirect(route('academic.internship.submission'));

    companyLogin($this, companyProfile(3));
    $this->get('/solicitudes-empresa/1')->assertRedirect(route('academic.companies.index', ['request' => 1]));
    $this->get('/empresas')->assertOk()->assertInertia(fn ($page) => $page->component('company/index'));

    $company = User::where('email', 'empresa.demo@unjfsc.edu.pe')->firstOrFail();
    $this->actingAs($company);
    $this->get('/solicitudes-empresa/1')->assertRedirect(route('company.requests', ['request' => 1]));
    $this->get('/empresa/solicitudes')->assertOk()->assertInertia(fn ($page) => $page->component('company/requests'));
    $this->getJson(route('company-validation.requests.index'))->assertOk();
});

test('plan and report uploads remain blocked until acceptance and practice registration', function (string $type) {
    $student = companyProfile(5);
    companyLogin($this, $student);
    $this->get('/internship/report-review')->assertOk()->assertInertia(fn ($page) => $page
        ->where('can_upload_documents', false)->where('documents.0.can_submit', false));
    $this->post('/internship/report-review/submissions', ['type' => $type, 'file' => UploadedFile::fake()->create('practica.pdf', 20, 'application/pdf')])->assertStatus(409);
    $this->assertDatabaseCount('practice_submissions', 0);

    $item = companySubmit($this);
    companyApprove($this, $item);
    $account = companyActivate($this);
    $this->actingAs($account)->patchJson(route('company-validation.requests.decision', $item), ['decision' => 'accept'])->assertOk();
    companyLogin($this, $student);
    $this->post('/internship/report-review/submissions', ['type' => $type, 'file' => UploadedFile::fake()->create('practica.pdf', 20, 'application/pdf')])->assertStatus(409);
    $this->postJson(route('company-validation.placement.store'), companyPlacementPayload($item->fresh()->company_id))->assertCreated();

    $enum = \App\Domains\Supervision\Enums\PracticeSubmissionType::from($type);
    DocumentType::firstOrCreate(['code' => $enum->documentTypeCode()], ['name' => 'Documento de práctica', 'description' => 'Documento de prueba', 'status' => 1]);
    $this->get('/internship/report-review')->assertOk()->assertInertia(fn ($page) => $page
        ->where('can_upload_documents', true)->where('documents.0.can_submit', true));
    $this->post('/internship/report-review/submissions', ['type' => $type, 'file' => UploadedFile::fake()->create('practica.pdf', 20, 'application/pdf')])->assertRedirect();
    $this->assertDatabaseHas('practice_submissions', ['assignment_id' => $student->id, 'type' => $type]);
})->with(['plan', 'report']);

test('submission requires the declaration and valid RUC and corporate fields', function () {
    companyLogin($this, companyProfile(5));
    $this->postJson(route('company-validation.requests.store'), ['ruc' => '123', 'declaration_accepted' => false])->assertUnprocessable()->assertJsonValidationErrors(['ruc', 'name', 'email', 'declaration_accepted']);
    expect(CompanyValidationRequest::count())->toBe(0);
    Mail::assertNothingOutgoing();
});

test('only a titular of the same school and semester can approve and trigger the invitation', function () {
    $item = companySubmit($this);
    companyApprove($this, $item);
    $item->refresh();
    expect($item->company->ruc)->toBe($item->ruc)->and($item->reviewed_at)->not->toBeNull();
    Mail::assertQueued(CompanyStudentInvitation::class, 1);
    $token = companyToken();
    expect(CompanyInvitation::firstOrFail()->token_hash)->toBe(hash('sha256', $token))->not->toBe($token);
    $html = Mail::queued(CompanyStudentInvitation::class)->first()->render();
    expect($html)->toContain('Universidad Nacional José Faustino Sánchez Carrión')->toContain($item->assignment->user->person->names);
});

test('observing or rejecting a company sends no invitation and permits a corrected resubmission', function (string $decision, string $state) {
    $item = companySubmit($this);
    $teacher = companyProfile(3);
    $teacher->update(['section_id' => $item->assignment->section_id]);
    companyLogin($this, $teacher->refresh());
    $this->patchJson(route('company-validation.requests.review', $item), ['decision' => $decision])->assertUnprocessable()->assertJsonValidationErrors('comment');
    $this->patchJson(route('company-validation.requests.review', $item), ['decision' => $decision, 'comment' => 'Corregir datos'])->assertOk()->assertJsonPath('data.state', $state);
    Mail::assertNothingOutgoing();
    companyLogin($this, $item->assignment);
    $this->patchJson(route('company-validation.requests.resubmit', $item), [...companyPayload(), 'name' => 'Datos corregidos'])->assertOk()->assertJsonPath('data.state', 'pending_review')->assertJsonPath('data.company_data.name', 'Datos corregidos');
    expect($item->events()->count())->toBe(3);
})->with([['observe', 'observed'], ['reject', 'rejected']]);

test('supervisors students and administrators cannot replace the titular reviewer', function (int $role) {
    $item = companySubmit($this);
    companyLogin($this, companyProfile($role));
    $this->patchJson(route('company-validation.requests.review', $item), ['decision' => 'approve'])->assertForbidden();
    Mail::assertNothingOutgoing();
})->with([1, 2, 4, 5]);

test('a titular cannot access another school or another semester request', function (string $scope) {
    $item = companySubmit($this);
    $teacher = companyProfile(3);
    $teacher->update(['section_id' => $item->assignment->section_id]);
    if ($scope === 'school') {
        $section = \App\Domains\Academic\Models\Section::where('school_id', '!=', $item->school_id)->firstOrFail();
        $teacher->update(['section_id' => $section->id]);
    } else {
        $semester = \App\Domains\Academic\Models\Semester::create(['code' => '2027-I', 'cycle' => 'I', 'status' => 1]);
        $teacher->update(['semester_id' => $semester->id]);
    }
    companyLogin($this, $teacher->refresh());
    $this->getJson(route('company-validation.requests.index'))->assertOk()->assertJsonCount(0, 'data');
    $this->getJson(route('company-validation.requests.show', $item))->assertForbidden();
    $this->patchJson(route('company-validation.requests.review', $item), ['decision' => 'approve'])->assertForbidden();
})->with(['school', 'semester']);

test('the RUC PDF is private and optional and cannot be read by another student', function () {
    $student = companyProfile(5);
    companyLogin($this, $student);
    $id = $this->postJson(route('company-validation.requests.store'), [...companyPayload(), 'ruc_document' => UploadedFile::fake()->create('ruc.pdf', 20, 'application/pdf')])->assertCreated()->assertJsonPath('data.has_ruc_document', true)->json('data.id');
    $item = CompanyValidationRequest::findOrFail($id);
    Storage::disk('local')->assertExists($item->ruc_document_path);
    Storage::disk('public')->assertMissing($item->ruc_document_path);
    $this->getJson(route('company-validation.requests.ruc-document', $item))->assertOk();
    $other = Assignment::where('role_id', 5)->where('id', '!=', $student->id)->firstOrFail();
    $other->update(['access_status' => 1]);
    companyLogin($this, $other->refresh());
    $this->getJson(route('company-validation.requests.ruc-document', $item))->assertForbidden();
    $this->getJson(route('company-validation.requests.show', $item))->assertForbidden();
});

test('activation creates a company account but does not accept the student', function () {
    $item = companySubmit($this);
    companyApprove($this, $item);
    $token = companyToken();
    $this->getJson(route('company-invitations.show', $token))->assertOk()->assertJsonMissingPath('data.token_hash');
    $user = companyActivate($this);
    expect($user->type_user_id)->toBe(3)->and($user->person_id)->toBeNull()->and(Hash::check('Contrasena123!', $user->password))->toBeTrue()
        ->and($item->fresh()->state)->toBe(State::AWAITING_COMPANY);
    $this->assertAuthenticatedAs($user);
    $this->getJson(route('company-validation.requests.index'))->assertOk()->assertJsonCount(1, 'data');
    $this->get('/dashboard')->assertOk();
    $this->getJson(route('company-invitations.show', $token))->assertGone();
    expect($user->notificationRecipients()->count())->toBe(1);
});

test('expired and revoked activation links cannot activate an account', function (string $field) {
    $item = companySubmit($this);
    companyApprove($this, $item);
    $token = companyToken();
    CompanyInvitation::firstOrFail()->update([$field => now()->subDay()]);
    $this->getJson(route('company-invitations.show', $token))->assertGone();
    expect($item->fresh()->company->account_user_id)->toBeNull();
})->with(['expires_at', 'revoked_at']);

test('activation requires matching passwords and explicit terms acceptance', function () {
    $item = companySubmit($this);
    companyApprove($this, $item);
    $token = companyToken();
    $this->post('/logout');
    $this->postJson(route('company-invitations.activate', $token), ['representative_name' => 'Nombre', 'representative_phone' => '999888777', 'password' => 'Contrasena123!', 'password_confirmation' => 'otra', 'terms_accepted' => false])->assertUnprocessable()->assertJsonValidationErrors(['password', 'terms_accepted']);
    expect($item->fresh()->company->account_user_id)->toBeNull();
});

test('the owning company accepts the student and unlocks practice registration and uploads', function () {
    $item = companySubmit($this);
    companyApprove($this, $item);
    $companyUser = companyActivate($this);
    $this->patchJson(route('company-validation.requests.decision', $item), ['decision' => 'accept'])->assertOk()->assertJsonPath('data.can_register_practice', true);
    $this->patchJson(route('company-validation.requests.decision', $item), ['decision' => 'accept'])->assertOk();
    expect($item->events()->where('action', 'accept')->count())->toBe(1);
    companyLogin($this, $item->assignment);
    $payload = companyPlacementPayload($item->fresh()->company_id);
    $this->postJson(route('company-validation.placement.store'), $payload)->assertCreated()->assertJsonPath('can_upload_documents', true);
    $placement = Placement::where('assignment_id', $item->assignment_id)->firstOrFail();
    expect($placement->practice_declared_at)->not->toBeNull()->and($placement->boss_name)->toBe('Jefe de prueba')->and($placement->area->name)->toBe('Tecnología');
    $this->post(route('academic.internship.placements.documents.store', $placement), ['code' => 'fut', 'file' => UploadedFile::fake()->create('fut.pdf', 20, 'application/pdf')])->assertRedirect()->assertSessionHasNoErrors();
    expect($placement->documents()->count())->toBe(1);
    $internship = \App\Domains\Internship\Models\Internship::where('placement_id', $placement->id)->firstOrFail();
    $planType = DocumentType::firstOrCreate(['code' => 'plan_ppp'], ['name' => 'Plan de prácticas', 'description' => 'Prueba', 'status' => 1]);
    $this->post(route('academic.internship.documents.store', 1), ['target_id' => $internship->id, 'code' => $planType->code, 'file' => UploadedFile::fake()->create('plan.pdf', 20, 'application/pdf')])->assertRedirect()->assertSessionHasNoErrors();
    expect($internship->documents()->count())->toBe(1);
    $this->getJson(route('company-validation.current'))->assertOk()->assertJsonPath('data.can_upload_documents', true)->assertJsonPath('data.internship_id', $internship->id);
    $this->get('/dashboard')->assertOk();
    $this->actingAs($companyUser)->get('/dashboard')->assertOk();
});

test('the old placement endpoint cannot bypass company acceptance', function () {
    $item = companySubmit($this);
    companyApprove($this, $item);
    companyLogin($this, $item->assignment);
    $this->postJson(route('academic.internship.placements.store'), companyPlacementPayload($item->fresh()->company_id))->assertConflict();
    expect(Placement::count())->toBe(0);
});

test('an existing company is autofilled and receives confirmation without titular approval', function () {
    $account = User::factory()->create(['email' => 'empresa-existente@example.test', 'type_user_id' => 3]);
    $company = Company::create([...collect(companyPayload())->only(['ruc', 'name', 'razon', 'address', 'phone', 'email'])->all(), 'email' => $account->email, 'account_user_id' => $account->id, 'activated_at' => now()]);
    companyLogin($this, companyProfile(5));
    $this->getJson(route('company-validation.companies.lookup', $company->ruc))->assertOk()->assertJsonPath('next_action', 'send_confirmation')->assertJsonPath('company.email', $company->email);
    $this->postJson(route('company-validation.requests.store'), ['ruc' => $company->ruc, 'email' => 'no-cambiar@example.test', 'declaration_accepted' => true])->assertCreated()->assertJsonPath('data.state', 'awaiting_company')->assertJsonPath('data.is_new_company', false)->assertJsonPath('data.company_data.email', $account->email);
    Mail::assertQueued(CompanyStudentInvitation::class, fn ($mail) => ! $mail->details['requires_activation'] && $mail->hasTo($account->email));
    expect(CompanyInvitation::count())->toBe(0)->and($company->fresh()->email)->toBe($account->email);
});

test('only the company that owns the request may accept or reject the student', function () {
    $item = companySubmit($this);
    companyApprove($this, $item);
    $otherUser = User::factory()->create(['type_user_id' => 3, 'status' => 1]);
    Company::create(['ruc' => '20888888881', 'name' => 'Otra', 'razon' => 'Otra', 'address' => 'Otra', 'phone' => '999888777', 'email' => $otherUser->email, 'account_user_id' => $otherUser->id, 'activated_at' => now()]);
    $this->actingAs($otherUser)->withSession(['assignment_id' => null, 'semester_id' => null]);
    $this->getJson(route('company-validation.requests.index'))->assertOk()->assertJsonCount(0, 'data');
    $this->patchJson(route('company-validation.requests.decision', $item), ['decision' => 'accept'])->assertForbidden();
    expect($item->fresh()->state)->toBe(State::AWAITING_COMPANY);
});

test('company rejection keeps practice locked and requires a reason', function () {
    $item = companySubmit($this);
    companyApprove($this, $item);
    companyActivate($this);
    $this->patchJson(route('company-validation.requests.decision', $item), ['decision' => 'reject'])->assertUnprocessable();
    $this->patchJson(route('company-validation.requests.decision', $item), ['decision' => 'reject', 'comment' => 'No tenemos vacante'])->assertOk()->assertJsonPath('data.state', 'declined')->assertJsonPath('data.can_register_practice', false);
    $this->patchJson(route('company-validation.requests.decision', $item), ['decision' => 'accept'])->assertConflict();
});

test('repeated submissions and repeated reviews do not duplicate requests or mail', function () {
    $item = companySubmit($this);
    $this->postJson(route('company-validation.requests.store'), companyPayload())->assertConflict();
    companyApprove($this, $item);
    $this->patchJson(route('company-validation.requests.review', $item), ['decision' => 'approve'])->assertConflict();
    expect(CompanyValidationRequest::count())->toBe(1)->and(Company::where('ruc', $item->ruc)->count())->toBe(1);
    Mail::assertQueued(CompanyStudentInvitation::class, 1);
});

test('resending an invitation revokes the old token and respects the cooldown', function () {
    $item = companySubmit($this);
    companyApprove($this, $item);
    $old = companyToken();
    companyLogin($this, $item->assignment);
    $this->postJson(route('company-validation.requests.resend', $item))->assertTooManyRequests();
    $this->travel(6)->minutes();
    $this->postJson(route('company-validation.requests.resend', $item))->assertOk();
    $this->getJson(route('company-invitations.show', $old))->assertGone();
    $this->getJson(route('company-invitations.show', companyToken()))->assertOk();
});

test('a closed semester blocks new company requests', function () {
    $student = companyProfile(5);
    $student->semester->update(['status' => 0]);
    companyLogin($this, $student);
    $this->postJson(route('company-validation.requests.store'), companyPayload())->assertForbidden();
    expect(CompanyValidationRequest::count())->toBe(0);
});

test('corporate invitation cannot claim an existing academic email', function () {
    companyLogin($this, companyProfile(5));
    $this->postJson(route('company-validation.requests.store'), [...companyPayload(), 'email' => 'docente1@gmail.com'])->assertUnprocessable()->assertJsonValidationErrors('email');
    Mail::assertNothingOutgoing();
});

test('document service blocks unaccepted companies even through a legacy practice', function () {
    $item = companySubmit($this);
    companyApprove($this, $item);
    companyLogin($this, $item->assignment);
    $placement = Placement::create([
        'assignment_id' => $item->assignment_id, 'company_id' => $item->fresh()->company_id,
        'boss_name' => 'Datos antiguos', 'position' => 'Practicante', 'start_date' => '2026-04-01', 'end_date' => '2026-08-01',
    ]);
    $this->postJson(route('academic.internship.placements.documents.store', $placement), ['code' => 'fut', 'file' => UploadedFile::fake()->create('fut.pdf', 20, 'application/pdf')])->assertConflict();
    expect($placement->documents()->count())->toBe(0);
});

test('accepted company still requires practice declaration before uploading documents', function () {
    $item = companySubmit($this);
    companyApprove($this, $item);
    companyActivate($this);
    $this->patchJson(route('company-validation.requests.decision', $item), ['decision' => 'accept'])->assertOk();
    companyLogin($this, $item->assignment);
    $payload = companyPlacementPayload($item->fresh()->company_id);
    unset($payload['practice_declaration_accepted']);
    $this->postJson(route('company-validation.placement.store'), $payload)->assertUnprocessable()->assertJsonValidationErrors('practice_declaration_accepted');
    $placement = Placement::create(['assignment_id' => $item->assignment_id, 'company_id' => $item->fresh()->company_id, 'company_validation_request_id' => $item->id, 'position' => 'Practicante', 'start_date' => '2026-04-01', 'end_date' => '2026-08-01']);
    $this->postJson(route('academic.internship.placements.documents.store', $placement), ['code' => 'fut', 'file' => UploadedFile::fake()->create('fut.pdf', 20, 'application/pdf')])->assertConflict();
});

test('the student cannot register a different company or its area after confirmation', function () {
    $item = companySubmit($this);
    companyApprove($this, $item);
    companyActivate($this);
    $this->patchJson(route('company-validation.requests.decision', $item), ['decision' => 'accept'])->assertOk();
    $other = Company::create(['ruc' => '20888888881', 'name' => 'Otra', 'razon' => 'Otra', 'address' => 'Otra', 'phone' => '999888777', 'email' => 'otra@example.test']);
    companyLogin($this, $item->assignment);
    $this->postJson(route('company-validation.placement.store'), companyPlacementPayload($other->id))->assertConflict();
    $area = \App\Domains\Company\Models\Area::create(['company_id' => $other->id, 'name' => 'Otra área']);
    $data = companyPlacementPayload($item->fresh()->company_id);
    $data['placement']['area_id'] = $area->id;
    $this->postJson(route('company-validation.placement.store'), $data)->assertUnprocessable();
    expect(Placement::count())->toBe(0);
});

test('approval of two requests for the same RUC reuses one company without overwriting its data', function () {
    $first = companySubmit($this);
    $second = Assignment::where('role_id', 5)->where('id', '!=', $first->assignment_id)->firstOrFail();
    $second->update(['access_status' => 1, 'approval_status' => 1]);
    companyLogin($this, $second->refresh());
    $id = $this->postJson(route('company-validation.requests.store'), [...companyPayload(), 'name' => 'Otra propuesta'])->assertCreated()->json('data.id');
    $otherRequest = CompanyValidationRequest::findOrFail($id);
    companyApprove($this, $first);
    companyApprove($this, $otherRequest);
    expect($first->fresh()->company_id)->toBe($otherRequest->fresh()->company_id)->and(Company::where('ruc', $first->ruc)->count())->toBe(1)->and($first->fresh()->company->name)->toBe('Empresa de prueba');
});

test('legacy company registration cannot create an account with a default password', function () {
    companyLogin($this, companyProfile(1));
    $this->postJson(route('register.company'), collect(companyPayload())->except('declaration_accepted')->all())->assertConflict();
    $this->assertDatabaseMissing('companies', ['ruc' => '20999999991']);
    $this->assertDatabaseMissing('users', ['email' => '20999999991@example.test']);
});
