<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'faculty_id',
        'school_id',
        'semester_id',
        'status',
    ];

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * @@return BelongsTo
     */
    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }
}
