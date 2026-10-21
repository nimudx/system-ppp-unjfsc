<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Internship extends Model
{
    protected $fillable = [
        'assignment_id',
        'placement_id',
        'grade',
        'comment',
        'internship_step',
        'approval_status',
        'application_status',
        'status',
    ];

    /**
     * Get the assignment that owns the internship.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * Get the boss that owns the internship.
     */
    public function boss(): BelongsTo
    {
        return $this->belongsTo(User::class, 'boss_id');
    }

    /**
     * Get the documents associated with the internship.
     */
    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    /**
     * Get the requests associated with the internship.
     */
    public function requests(): MorphMany
    {
        return $this->morphMany(UserRequest::class, 'requestable');
    }

    /**
     * Get the placement that owns the internship.
     */
    public function placement(): BelongsTo
    {
        return $this->belongsTo(Placement::class);
    }
}
