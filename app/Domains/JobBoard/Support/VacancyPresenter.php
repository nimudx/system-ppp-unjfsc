<?php

namespace App\Domains\JobBoard\Support;

use App\Domains\Identity\Models\Assignment;
use App\Domains\JobBoard\Models\Vacancy;
use App\Domains\JobBoard\Models\VacancyCandidate;

class VacancyPresenter
{
    /**
     * @return array<string, mixed>
     */
    public function summary(Vacancy $vacancy, bool $isNew = false): array
    {
        $vacancy->loadMissing(['company:id,name', 'schools.faculty']);

        return [
            'id' => $vacancy->id,
            'title' => $vacancy->title,
            'status' => $vacancy->status->value,
            'status_label' => $vacancy->status->label(),
            'type' => $vacancy->type->value,
            'type_label' => $vacancy->type->label(),
            'modality' => $vacancy->modality->value,
            'modality_label' => $vacancy->modality->label(),
            'area_name' => $vacancy->area_name,
            'location' => $vacancy->location,
            'positions_count' => $vacancy->positions_count,
            'deadline_at' => $vacancy->deadline_at?->toIso8601String(),
            'created_at' => $vacancy->created_at?->toIso8601String(),
            'updated_at' => $vacancy->updated_at?->toIso8601String(),
            'published_at' => $vacancy->published_at?->toIso8601String(),
            'closed_at' => $vacancy->closed_at?->toIso8601String(),
            'closed_reason' => $vacancy->closed_reason?->value,
            'closed_reason_label' => $vacancy->closed_reason?->label(),
            'review_comment' => $vacancy->review_comment,
            'is_new' => $isNew,
            'candidates_count' => $vacancy->candidates()->count(),
            'company' => $vacancy->company ? [
                'id' => $vacancy->company->id,
                'name' => $vacancy->company->name,
            ] : null,
            'schools' => $vacancy->schools->map(fn ($school) => [
                'id' => $school->id,
                'name' => $school->name,
                'faculty' => $school->faculty?->name,
            ])->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function companyDetail(Vacancy $vacancy, bool $isNew = false): array
    {
        $vacancy->loadMissing('company');

        return [
            ...$this->summary($vacancy, $isNew),
            'description' => $vacancy->description,
            'requirements' => $vacancy->requirements,
            'reviewed_at' => $vacancy->reviewed_at?->toIso8601String(),
            'contact' => $vacancy->company ? [
                'ruc' => $vacancy->company->ruc,
                'email' => $vacancy->company->email,
                'phone' => $vacancy->company->phone,
                'address' => $vacancy->company->address,
                'representative_name' => $vacancy->company->representative_name,
                'representative_phone' => $vacancy->company->representative_phone,
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function adminDetail(Vacancy $vacancy): array
    {
        $vacancy->loadMissing(['company', 'reviewedBy.user.person', 'candidates.student.user.person', 'candidates.student.section.school', 'candidates.proposedBy.user.person']);

        return [
            ...$this->companyDetail($vacancy),
            'reviewed_by' => $vacancy->reviewedBy?->user?->person
                ? trim($vacancy->reviewedBy->user->person->names.' '.$vacancy->reviewedBy->user->person->surnames)
                : null,
            'candidates' => $vacancy->candidates
                ->sortByDesc('id')
                ->map(fn (VacancyCandidate $candidate) => $this->candidate($candidate, true))
                ->values()
                ->all(),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $eligibleStudents
     * @return array<string, mixed>
     */
    public function teacherDetail(Vacancy $vacancy, array $eligibleStudents): array
    {
        $vacancy->loadMissing(['company', 'candidates.student.user.person', 'candidates.student.section.school', 'candidates.proposedBy.user.person']);

        return [
            ...$this->companyDetail($vacancy),
            // El docente titular no debe recibir los datos de contacto de la empresa.
            'contact' => null,
            'candidates' => $vacancy->candidates
                ->sortByDesc('id')
                ->map(fn (VacancyCandidate $candidate) => $this->candidate($candidate, true))
                ->values()
                ->all(),
            'students' => $eligibleStudents,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function candidate(VacancyCandidate $candidate, bool $includeStudent = false): array
    {
        $payload = [
            'id' => $candidate->id,
            'vacancy_id' => $candidate->vacancy_id,
            'status' => $candidate->status->value,
            'status_label' => $candidate->status->label(),
            'note' => $candidate->note,
            'status_note' => $candidate->status_note,
            'created_at' => $candidate->created_at?->toIso8601String(),
            'proposed_by' => $this->personName($candidate->proposedBy),
            'proposed_by_assignment_id' => $candidate->proposed_by_assignment_id,
        ];

        if ($includeStudent) {
            $payload['student'] = $this->student($candidate->student);
        }

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    public function student(?Assignment $student): array
    {
        if (! $student) {
            return [];
        }

        $student->loadMissing(['user.person', 'section.school', 'semester']);
        $person = $student->user?->person;
        $email = (string) $student->user?->email;
        $institutionalCode = str($email)->before('@')->toString();
        $cv = $this->cv($student);

        return [
            'assignment_id' => $student->id,
            'name' => $person ? trim($person->names.' '.$person->surnames) : $student->user?->name,
            'dni' => $person?->dni,
            'email' => $email,
            'code' => preg_match('/^\d{10}$/', $institutionalCode) ? $institutionalCode : null,
            'school' => $student->section?->school?->name,
            'section' => $student->section?->name,
            'semester' => $student->semester?->code,
            'record_approved' => $student->isApproved(),
            'cv' => $cv,
        ];
    }

    /**
     * @return array{name: string, url: string}|null
     */
    public function cv(Assignment $student): ?array
    {
        $dossier = $student->dossiers()->first();

        if (! $dossier) {
            return null;
        }

        $document = $dossier->documents()
            ->whereHas('documentType', fn ($query) => $query->where('code', 'cv'))
            ->latest('id')
            ->first();

        if (! $document) {
            return null;
        }

        return [
            'name' => $document->name,
            'url' => $document->signedFileUrl(),
        ];
    }

    public function personName(?Assignment $assignment): ?string
    {
        $person = $assignment?->user?->person;

        return $person ? trim($person->names.' '.$person->surnames) : null;
    }
}
