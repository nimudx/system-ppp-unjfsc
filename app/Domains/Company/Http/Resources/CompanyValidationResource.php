<?php

namespace App\Domains\Company\Http\Resources;

use App\Domains\Company\Enums\CompanyRequestState as State;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyValidationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing('assignment.user.person', 'assignment.section.school', 'assignment.semester', 'company', 'events', 'assignment.placement', 'assignment.internship');
        $student = $this->assignment->user;

        return [
            'id' => $this->id, 'assignment_id' => $this->assignment_id, 'school_id' => $this->school_id,
            'semester_id' => $this->semester_id, 'ruc' => $this->ruc, 'state' => $this->state->value,
            'is_new_company' => $this->is_new_company, 'company_id' => $this->company_id,
            'company_data' => $this->company_data,
            'company' => $this->company?->only(['id', 'name', 'razon', 'ruc', 'email', 'phone', 'address']),
            'student' => ['id' => $student->id, 'name' => trim($student->person?->names.' '.$student->person?->surnames), 'school' => $this->assignment->section->school->name, 'semester' => $this->assignment->semester?->code],
            'has_ruc_document' => $this->ruc_document_path !== null,
            'ruc_document_url' => $this->ruc_document_path ? route('company-validation.requests.ruc-document', $this->id) : null,
            'review_comment' => $this->review_comment, 'reviewed_at' => $this->reviewed_at,
            'company_comment' => $this->company_comment, 'company_decided_at' => $this->company_decided_at,
            'declaration' => ['text' => $this->declaration_text, 'version' => $this->declaration_version, 'accepted_at' => $this->declared_at],
            'can_resubmit' => in_array($this->state, [State::OBSERVED, State::REJECTED, State::DECLINED]),
            'can_register_practice' => $this->state === State::ACCEPTED,
            'placement_id' => $this->assignment->placement?->id,
            'internship_id' => $this->assignment->internship?->id,
            'can_upload_documents' => $this->state === State::ACCEPTED && $this->assignment->placement?->practice_declared_at !== null && $this->assignment->placement?->company_validation_request_id === $this->id,
            'last_invited_at' => $this->last_invited_at,
            'history' => $this->events->sortBy('id')->values()->map(fn ($event) => $event->only(['id', 'actor_user_id', 'actor_assignment_id', 'action', 'from_state', 'to_state', 'comment', 'snapshot', 'created_at'])),
            'created_at' => $this->created_at, 'updated_at' => $this->updated_at,
        ];
    }
}
