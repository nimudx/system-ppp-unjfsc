<?php

namespace App\Domains\JobBoard\Models;

use App\Domains\Identity\Models\Assignment;
use App\Domains\JobBoard\Enums\CandidateStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VacancyCandidate extends Model
{
    protected $fillable = [
        'vacancy_id',
        'student_assignment_id',
        'proposed_by_assignment_id',
        'note',
        'status',
        'status_note',
    ];

    protected function casts(): array
    {
        return [
            'status' => CandidateStatus::class,
        ];
    }

    public function vacancy(): BelongsTo
    {
        return $this->belongsTo(Vacancy::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'student_assignment_id');
    }

    public function proposedBy(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'proposed_by_assignment_id');
    }
}
