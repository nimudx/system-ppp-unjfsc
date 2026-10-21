<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Evaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'supervision_id',
        'grade',
        'comment',
        'approval_status',
        'status',
    ];

    /**
     * Get the supervision that owns the evaluation.
     */
    public function supervision(): BelongsTo
    {
        return $this->belongsTo(Supervision::class);
    }

    /**
     * Get the documents that belong to the application.
     */
    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
