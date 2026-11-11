<?php

namespace App\Domains\JobBoard\Models;

use App\Domains\Academic\Models\School;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VacancySchool extends Model
{
    protected $fillable = [
        'vacancy_id',
        'school_id',
        'status',
    ];

    public function vacancy(): BelongsTo
    {
        return $this->belongsTo(Vacancy::class);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
