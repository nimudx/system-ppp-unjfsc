<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Placement extends Model
{
    protected $fillable = [
        'assignment_id',
        'company_id',
        'staff_id',
        'area_id',
        'boss_name',
        'boss_position',
        'boss_phone',
        'boss_email',
        'position',
        'description',
        'start_date',
        'end_date',
        'internship_type',
        'origin_type',
        'approval_status',
        'validation_status',
        'observation',
        'status',
    ];

    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }
}
