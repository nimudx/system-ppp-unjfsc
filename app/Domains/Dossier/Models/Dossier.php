<?php

namespace App\Domains\Dossier\Models;

use App\Domains\Documents\Models\Document;
use App\Domains\Identity\Models\Assignment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Dossier extends Model
{
    protected $fillable = [
        'assignment_id',
        'approval_status',
        'status',
    ];

    /**
     * Get the assignment that owns the application.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * Get the documents that belong to the application.
     */
    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
