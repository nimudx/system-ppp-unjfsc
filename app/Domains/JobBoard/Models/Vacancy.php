<?php

namespace App\Domains\JobBoard\Models;

use App\Domains\Academic\Models\School;
use App\Domains\Academic\Models\Semester;
use App\Domains\Company\Models\Company;
use App\Domains\Identity\Models\Assignment;
use App\Domains\JobBoard\Enums\VacancyCloseReason;
use App\Domains\JobBoard\Enums\VacancyModality;
use App\Domains\JobBoard\Enums\VacancyStatus;
use App\Domains\JobBoard\Enums\VacancyType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vacancy extends Model
{
    protected $fillable = [
        'company_id',
        'semester_id',
        'title',
        'description',
        'type',
        'modality',
        'area_name',
        'location',
        'positions_count',
        'requirements',
        'deadline_at',
        'status',
        'review_comment',
        'reviewed_by_assignment_id',
        'reviewed_at',
        'published_at',
        'closed_at',
        'closed_reason',
    ];

    protected function casts(): array
    {
        return [
            'type' => VacancyType::class,
            'modality' => VacancyModality::class,
            'status' => VacancyStatus::class,
            'closed_reason' => VacancyCloseReason::class,
            'positions_count' => 'integer',
            'deadline_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'published_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'reviewed_by_assignment_id');
    }

    public function schools(): BelongsToMany
    {
        return $this->belongsToMany(School::class, 'vacancy_schools')
            ->withPivot(['status'])
            ->withTimestamps();
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(VacancyCandidate::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(VacancyView::class);
    }
}
