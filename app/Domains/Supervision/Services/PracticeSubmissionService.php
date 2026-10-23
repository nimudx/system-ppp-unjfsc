<?php

namespace App\Domains\Supervision\Services;

use App\Domains\Documents\Models\DocumentType;
use App\Domains\Documents\Services\DocumentService;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Notifications\Services\NotificationService;
use App\Domains\Supervision\Enums\PracticeSubmissionStatus;
use App\Domains\Supervision\Enums\PracticeSubmissionType;
use App\Domains\Supervision\Exceptions\PracticeReviewNotAllowedException;
use App\Domains\Supervision\Exceptions\PracticeSubmissionAlreadyReviewedException;
use App\Domains\Supervision\Exceptions\PracticeSubmissionLockedException;
use App\Domains\Supervision\Models\InternshipGroup;
use App\Domains\Supervision\Models\PracticeSubmission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PracticeSubmissionService
{
    private const SUPERVISOR_ROLE_ID = 4;

    public function __construct(
        private readonly DocumentService $documentService,
        private readonly NotificationService $notificationService,
    ) {}

    /**
     * Datos que consume la pantalla "Seguimiento de Prácticas" del estudiante.
     */
    public function getStudentData(Assignment $assignment): array
    {
        $byType = PracticeSubmission::query()
            ->where('assignment_id', $assignment->id)
            ->with(['document', 'reviewer.user.person'])
            ->orderByDesc('id')
            ->get()
            ->groupBy(fn (PracticeSubmission $s) => $s->type->value);

        $documents = collect(PracticeSubmissionType::cases())->map(function (PracticeSubmissionType $type) use ($byType) {
            /** @var Collection<int, PracticeSubmission> $history */
            $history = $byType->get($type->value, collect());
            $latest = $history->first();

            return [
                'id' => $type->value,
                'title' => $type->title(),
                'description' => $type->description(),
                'can_submit' => $this->canSubmit($latest),
                'latest' => $latest ? $this->transform($latest) : null,
                'history' => $history->map(fn ($s) => $this->transform($s))->values(),
            ];
        })->values();

        return [
            'documents' => $documents,
            'required_count' => count(PracticeSubmissionType::cases()),
            'delivered_count' => $documents->filter(fn ($d) => $d['latest'] !== null)->count(),
        ];
    }

    /**
     * El estudiante entrega (o reenvía) un documento. Solo se puede reenviar
     * si no hay entrega previa o si la última fue observada.
     */
    public function submit(Assignment $assignment, PracticeSubmissionType $type, UploadedFile $file): PracticeSubmission
    {
        return DB::transaction(function () use ($assignment, $type, $file) {
            $latest = PracticeSubmission::query()
                ->where('assignment_id', $assignment->id)
                ->where('type', $type->value)
                ->latest('id')
                ->lockForUpdate()
                ->first();

            if (! $this->canSubmit($latest)) {
                throw new PracticeSubmissionLockedException;
            }

            $documentType = DocumentType::query()->where('code', $type->documentTypeCode())->firstOrFail();

            $submission = PracticeSubmission::query()->create([
                'assignment_id' => $assignment->id,
                'type' => $type->value,
                'approval_status' => PracticeSubmissionStatus::PENDING->value,
            ]);

            $this->documentService->registerDocument([
                'context' => 'practice_submission',
                'target_id' => $submission->id,
                'document_type_id' => $documentType->id,
                'file' => $file,
            ], $assignment, $submission);

            return $submission;
        });
    }

    /**
     * El docente supervisor califica u observa una entrega.
     */
    public function review(PracticeSubmission $submission, array $data, Assignment $reviewer): PracticeSubmission
    {
        $this->assertCanReview($submission, $reviewer);

        return DB::transaction(function () use ($submission, $data, $reviewer) {
            $submission = PracticeSubmission::query()->lockForUpdate()->findOrFail($submission->id);

            if ($submission->approval_status !== PracticeSubmissionStatus::PENDING) {
                throw new PracticeSubmissionAlreadyReviewedException;
            }

            $status = PracticeSubmissionStatus::from((int) $data['approval_status']);

            $submission->update([
                'approval_status' => $status->value,
                'grade' => $status === PracticeSubmissionStatus::APPROVED ? $data['grade'] : ($data['grade'] ?? null),
                'comment' => $data['comment'] ?? null,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            // Mantener sincronizado el Document asociado
            $document = $submission->documents()->latest('id')->first();
            if ($document) {
                $this->documentService->updateStatus($document, [
                    'approval_status' => $status->value,
                    'comment' => $data['comment'] ?? '',
                    'reviewed_by' => $reviewer->id,
                ]);
            }

            $this->notifyStudent($submission, $reviewer, $status);

            return $submission;
        });
    }

    private function canSubmit(?PracticeSubmission $latest): bool
    {
        return $latest === null || $latest->approval_status === PracticeSubmissionStatus::OBSERVED;
    }

    /**
     * Solo el supervisor (rol 4) del grupo al que pertenece el estudiante.
     */
    private function assertCanReview(PracticeSubmission $submission, Assignment $reviewer): void
    {
        if ((int) $reviewer->role_id !== self::SUPERVISOR_ROLE_ID) {
            throw new PracticeReviewNotAllowedException;
        }

        $isSupervisorOfStudent = InternshipGroup::query()
            ->where('supervisor_assignment_id', $reviewer->id)
            ->whereHas('studentGroups', fn ($q) => $q->where('student_assignment_id', $submission->assignment_id))
            ->exists();

        if (! $isSupervisorOfStudent) {
            throw new PracticeReviewNotAllowedException;
        }
    }

    private function notifyStudent(PracticeSubmission $submission, Assignment $reviewer, PracticeSubmissionStatus $status): void
    {
        $this->notificationService->notify(
            type: 'PRACTICE_REVIEW',
            actor: $reviewer,
            subject: $submission,
            payload: [
                'action' => [
                    'route' => 'academic.internship.report-review',
                    'params' => [],
                ],
                'meta' => [
                    'document' => $submission->type->title(),
                    'status' => $status->value,
                    'comment' => $submission->comment,
                    'entity' => 'prácticas',
                    'sender' => $reviewer->user->name ?? 'Supervisor',
                ],
            ],
            resolver: fn ($subject) => collect([$subject->assignment->user])->filter(),
        );
    }

    private function transform(PracticeSubmission $s): array
    {
        $document = $s->document;
        $reviewerPerson = $s->reviewer?->user?->person;

        return [
            'id' => $s->id,
            'status' => $s->approval_status->value,
            'status_label' => $s->approval_status->label(),
            'grade' => $s->grade !== null ? (float) $s->grade : null,
            'comment' => $s->comment,
            'submitted_at' => $s->created_at?->toIso8601String(),
            'reviewed_at' => $s->reviewed_at?->toIso8601String(),
            'reviewer' => $reviewerPerson
                ? trim($reviewerPerson->names.' '.$reviewerPerson->surnames)
                : null,
            'file' => $document ? [
                'id' => $document->id,
                'name' => $document->name,
                'url' => Storage::url($document->path),
            ] : null,
        ];
    }
}
