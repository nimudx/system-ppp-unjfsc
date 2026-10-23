<?php

namespace App\Domains\Company\Services;

use App\Domains\Company\Enums\CompanyRequestState as State;
use App\Domains\Company\Mail\CompanyStudentInvitation;
use App\Domains\Company\Models\Company;
use App\Domains\Company\Models\CompanyInvitation;
use App\Domains\Company\Models\CompanyValidationRequest;
use App\Domains\Company\Support\CompanyWorkflowAccess;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use App\Domains\Notifications\Services\NotificationService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CompanyValidationService
{
    public function __construct(private CompanyWorkflowAccess $access, private NotificationService $notifications) {}

    public function submit(User $user, array $data, ?UploadedFile $file = null, ?CompanyValidationRequest $previous = null): CompanyValidationRequest
    {
        $student = $this->access->assignment($user, 5, true);
        $newPath = null;
        try {
            return DB::transaction(function () use ($student, $data, $file, $previous, &$newPath) {
                Assignment::whereKey($student->id)->lockForUpdate()->firstOrFail();
                $item = CompanyValidationRequest::where('assignment_id', $student->id)->lockForUpdate()->first();
                if ($previous) {
                    abort_unless($item && $item->id === $previous->id, 403);
                    abort_unless(in_array($item->state, [State::OBSERVED, State::REJECTED, State::DECLINED]), 409, 'Solo se puede reenviar una solicitud observada o rechazada.');
                    abort_if($student->placement()->exists(), 409, 'Una práctica ya registrada no puede cambiar de empresa mediante esta solicitud.');
                } else {
                    abort_if($item !== null, 409, 'Ya existe una solicitud para este perfil. Consulta su estado o utiliza el reenvío.');
                }
                $company = Company::where('ruc', $data['ruc'])->where('status', 1)->first();
                abort_if(! $company && Company::where('ruc', $data['ruc'])->exists(), 409, 'La empresa está inactiva.');
                // Las nuevas empresas no entran al catálogo hasta que el titular apruebe.
                $companyData = $company ? $company->only(['name', 'razon', 'address', 'phone', 'email']) : collect($data)->only(['name', 'razon', 'address', 'phone', 'email'])->all();
                if (! $company) {
                    $companyData['razon'] = $companyData['razon'] ?? $companyData['name'];
                    $this->assertAvailableEmail($companyData['email']);
                }
                if ($file) {
                    $newPath = $file->store('company-validation/'.$student->id, 'local');
                    abort_unless($newPath, 500, 'No se pudo guardar la ficha RUC.');
                }
                $from = $item?->state->value;
                $oldPath = $item?->ruc_document_path;
                $sameRuc = $item?->ruc === $data['ruc'];
                $item ??= new CompanyValidationRequest;
                $item->fill([
                    'assignment_id' => $student->id,
                    'school_id' => $student->section->school_id,
                    'semester_id' => $student->semester_id,
                    'ruc' => $data['ruc'],
                    'company_id' => $company?->id,
                    'company_data' => $companyData,
                    'is_new_company' => $company === null,
                    'state' => $company ? State::AWAITING_COMPANY : State::PENDING_REVIEW,
                    'ruc_document_path' => $newPath ?: ($sameRuc ? $oldPath : null),
                    'declaration_text' => config('company_validation.declaration_text'),
                    'declaration_version' => config('company_validation.declaration_version'),
                    'declared_at' => now(),
                    'reviewed_by_assignment_id' => null, 'reviewed_at' => null, 'review_comment' => null,
                    'company_decided_at' => null, 'company_comment' => null, 'last_invited_at' => null,
                ])->save();
                if ($previous) {
                    $item->invitations()->whereNull('consumed_at')->update(['revoked_at' => now()]);
                }
                $this->event($item, $student, $previous ? 'resubmitted' : 'submitted', $from, snapshot: [
                    'company' => $companyData, 'ruc' => $data['ruc'], 'declaration_text' => $item->declaration_text,
                    'declaration_version' => $item->declaration_version, 'declared_at' => $item->declared_at->toIso8601String(),
                ]);
                if ($company) {
                    $this->invite($item, $student);
                } else {
                    $teachers = Assignment::where('role_id', 3)->where('semester_id', $student->semester_id)->where('status', 1)->where('access_status', 1)
                        ->whereHas('section', fn ($q) => $q->where('school_id', $student->section->school_id))->with('user')->get()->pluck('user')->unique('id');
                    $this->notify($item, $student, 'COMPANY_REVIEW_REQUESTED', 'Nueva solicitud de empresa', $teachers);
                }

                return $item->fresh();
            });
        } catch (\Throwable $e) {
            if ($newPath) {
                Storage::disk('local')->delete($newPath);
            }
            throw $e;
        }
    }

    public function review(User $user, CompanyValidationRequest $item, string $decision, ?string $comment): CompanyValidationRequest
    {
        $teacher = $this->access->teacherRequest($user, $item, true);

        return DB::transaction(function () use ($item, $teacher, $decision, $comment) {
            $item = CompanyValidationRequest::whereKey($item->id)->lockForUpdate()->firstOrFail();
            abort_unless($item->state === State::PENDING_REVIEW, 409, 'La solicitud ya fue evaluada.');
            $state = match ($decision) {
                'approve' => State::AWAITING_COMPANY, 'observe' => State::OBSERVED, 'reject' => State::REJECTED
            };
            if ($decision === 'approve') {
                $existing = Company::where('ruc', $item->ruc)->first();
                if (! $existing) {
                    $this->assertAvailableEmail($item->company_data['email']);
                }
                $company = Company::firstOrCreate(['ruc' => $item->ruc], [
                    ...$item->company_data, 'status' => 1, 'approved_by_assignment_id' => $teacher->id, 'approved_at' => now(),
                ]);
                abort_unless($company->status == 1, 409, 'La empresa está inactiva.');
                $item->company_id = $company->id;
            }
            $item->fill(['state' => $state, 'review_comment' => $comment, 'reviewed_by_assignment_id' => $teacher->id, 'reviewed_at' => now()])->save();
            $this->event($item, $teacher, $decision, State::PENDING_REVIEW->value, $comment);
            $this->notify($item, $teacher, 'COMPANY_REVIEWED', 'Solicitud de empresa evaluada', collect([$item->assignment->user]));
            if ($decision === 'approve') {
                $this->invite($item, $teacher);
            }

            return $item->fresh();
        });
    }

    public function resend(User $user, CompanyValidationRequest $item): CompanyValidationRequest
    {
        $student = $this->access->studentRequest($user, $item, true);

        return DB::transaction(function () use ($item, $student) {
            $item = CompanyValidationRequest::whereKey($item->id)->lockForUpdate()->firstOrFail();
            abort_unless($item->state === State::AWAITING_COMPANY, 409, 'La solicitud no está esperando confirmación de la empresa.');
            abort_if($item->last_invited_at?->greaterThan(now()->subMinutes(5)), 429, 'Espera cinco minutos antes de reenviar la invitación.');
            $this->invite($item, $student);
            $this->event($item, $student, 'invitation_resent', $item->state->value);

            return $item->fresh();
        });
    }

    private function invite(CompanyValidationRequest $item, Assignment $actor): void
    {
        $company = Company::whereKey($item->company_id)->lockForUpdate()->firstOrFail();
        abort_unless(filter_var($company->email, FILTER_VALIDATE_EMAIL), 409, 'La empresa no tiene un correo válido.');
        $requiresActivation = $company->account_user_id === null;
        $url = url(config('company_validation.requests_path')).'?request='.$item->id;
        if ($requiresActivation) {
            // No asociar una cuenta ajena por coincidencia de correo.
            $this->assertAvailableEmail($company->email, $company->id);
            $item->invitations()->whereNull('consumed_at')->whereNull('revoked_at')->update(['revoked_at' => now()]);
            $token = Str::random(64);
            CompanyInvitation::create([
                'company_validation_request_id' => $item->id, 'company_id' => $company->id, 'email' => $company->email,
                'token_hash' => hash('sha256', $token), 'expires_at' => now()->addHours(config('company_validation.invitation_hours')),
            ]);
            $url = url(config('company_validation.activation_path')).'?token='.urlencode($token);
        } else {
            $account = User::findOrFail($company->account_user_id);
            abort_unless($account->status == 1 && $account->type_user_id === 3, 409, 'La cuenta de empresa está inactiva.');
            $this->notify($item, $actor, 'COMPANY_STUDENT_CONFIRMATION', 'Estudiante pendiente de confirmación', collect([$account]));
        }
        $student = $item->assignment->user;
        Mail::to($company->email)->send(new CompanyStudentInvitation([
            'company_name' => $company->razon, 'ruc' => $company->ruc,
            'student_name' => trim($student->person?->names.' '.$student->person?->surnames),
            'school' => $item->assignment->section->school->name,
            'url' => $url, 'requires_activation' => $requiresActivation,
            'expires_hours' => config('company_validation.invitation_hours'),
        ]));
        $item->update(['last_invited_at' => now()]);
    }

    public function invitation(string $token, bool $lock = false): CompanyInvitation
    {
        $query = CompanyInvitation::where('token_hash', hash('sha256', $token));
        if ($lock) {
            $query->lockForUpdate();
        }
        $invitation = $query->firstOrFail();
        abort_if($invitation->consumed_at || $invitation->revoked_at || $invitation->expires_at->isPast(), 410, 'La invitación expiró o ya fue utilizada. Solicita un nuevo envío.');
        abort_unless($invitation->validationRequest->state === State::AWAITING_COMPANY && $invitation->company->status == 1 && $invitation->company->email === $invitation->email, 410, 'La invitación ya no está disponible.');

        return $invitation;
    }

    public function activate(string $token, array $data): User
    {
        return DB::transaction(function () use ($token, $data) {
            $invitation = $this->invitation($token, true);
            $company = Company::whereKey($invitation->company_id)->lockForUpdate()->firstOrFail();
            abort_if($company->account_user_id !== null, 409, 'La empresa ya tiene una cuenta. Inicia sesión.');
            $this->assertAvailableEmail($invitation->email, $company->id);
            $user = User::create([
                'person_id' => null, 'name' => $data['representative_name'], 'email' => $invitation->email,
                'password' => $data['password'], 'type_user_id' => 3, 'status' => 1,
            ]);
            $user->forceFill(['email_verified_at' => now()])->save();
            $company->update(['account_user_id' => $user->id, 'representative_name' => $data['representative_name'], 'representative_phone' => $data['representative_phone'], 'activated_at' => now()]);
            $invitation->update(['consumed_at' => now()]);
            CompanyInvitation::where('company_id', $company->id)->whereKeyNot($invitation->id)->whereNull('consumed_at')->update(['revoked_at' => now()]);
            $this->event($invitation->validationRequest, $user, 'account_activated', State::AWAITING_COMPANY->value, snapshot: [
                'terms_version' => config('company_validation.terms_version'), 'terms_text' => config('company_validation.terms_text'), 'terms_accepted_at' => now()->toIso8601String(),
                'representative_name' => $data['representative_name'], 'representative_phone' => $data['representative_phone'],
            ]);
            foreach (CompanyValidationRequest::where('company_id', $company->id)->where('state', State::AWAITING_COMPANY)->get() as $waiting) {
                $this->notify($waiting, $waiting->assignment, 'COMPANY_STUDENT_CONFIRMATION', 'Estudiante pendiente de confirmación', collect([$user]));
            }

            return $user;
        });
    }

    public function decide(User $user, CompanyValidationRequest $item, string $decision, ?string $comment): CompanyValidationRequest
    {
        $company = $this->access->company($user);

        return DB::transaction(function () use ($user, $company, $item, $decision, $comment) {
            $item = CompanyValidationRequest::whereKey($item->id)->lockForUpdate()->firstOrFail();
            abort_unless($item->company_id === $company->id, 403, 'La solicitud pertenece a otra empresa.');
            abort_unless($item->assignment->semester?->status->value === 1, 409, 'El semestre del estudiante ha finalizado.');
            $target = $decision === 'accept' ? State::ACCEPTED : State::DECLINED;
            if ($item->state === $target) {
                return $item;
            }
            abort_unless($item->state === State::AWAITING_COMPANY, 409, 'La solicitud ya recibió una decisión.');
            $item->update(['state' => $target, 'company_decided_at' => now(), 'company_comment' => $comment]);
            $this->event($item, $user, $decision, State::AWAITING_COMPANY->value, $comment);
            $this->notify($item, $user, 'COMPANY_STUDENT_DECIDED', $decision === 'accept' ? 'La empresa aceptó tu solicitud' : 'La empresa rechazó tu solicitud', collect([$item->assignment->user]));

            return $item->fresh();
        });
    }

    private function assertAvailableEmail(string $email, ?int $companyId = null): void
    {
        $email = Str::lower(trim($email));
        if (User::whereRaw('LOWER(email) = ?', [$email])->exists() || Company::whereRaw('LOWER(email) = ?', [$email])->when($companyId, fn ($q) => $q->where('id', '!=', $companyId))->exists()) {
            throw ValidationException::withMessages(['email' => 'El correo ya pertenece a otra cuenta o empresa. Utiliza el correo propio de esta empresa.']);
        }
    }

    private function event(CompanyValidationRequest $item, Model $actor, string $action, ?string $from, ?string $comment = null, ?array $snapshot = null): void
    {
        $item->events()->create([
            'actor_user_id' => $actor instanceof Assignment ? $actor->user_id : $actor->id,
            'actor_assignment_id' => $actor instanceof Assignment ? $actor->id : null,
            'action' => $action, 'from_state' => $from, 'to_state' => $item->state->value, 'comment' => $comment, 'snapshot' => $snapshot,
        ]);
    }

    private function notify(CompanyValidationRequest $item, Model $actor, string $type, string $title, $users): void
    {
        $this->notifications->notify($type, $actor, $item, [
            'action' => ['route' => 'company-validation.requests.show', 'params' => ['companyRequest' => $item->id]],
            'meta' => ['title' => $title, 'entity' => 'company_validation', 'status' => $item->state->value, 'comment' => $item->review_comment ?? $item->company_comment],
        ], fn () => $users);
    }
}
