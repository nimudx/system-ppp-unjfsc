<?php

namespace App\Domains\Supervision\Models;

use App\Domains\Documents\Models\Document;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Supervision\Enums\PracticeSubmissionStatus;
use App\Domains\Supervision\Enums\PracticeSubmissionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

/**
 * Una fila por cada entrega (plan o informe). Cada reenvío crea una fila nueva,
 * así el historial queda completo y la última fila es la vigente.
 */
class PracticeSubmission extends Model
{
    protected $fillable = [
        'assignment_id',
        'type',
        'grade',
        'comment',
        'approval_status',
        'reviewed_by',
        'reviewed_at',
        'status',
    ];

    protected $casts = [
        'type' => PracticeSubmissionType::class,
        'approval_status' => PracticeSubmissionStatus::class,
        'grade' => 'decimal:2',
        'reviewed_at' => 'datetime',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'reviewed_by');
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function document(): MorphOne
    {
        return $this->morphOne(Document::class, 'documentable')->latestOfMany();
    }
}
