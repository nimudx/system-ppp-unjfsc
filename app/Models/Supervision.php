<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Supervision extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'module_id',
        'approval_status',
        'status',
    ];

    /**
     * Get the assignment that owns the supervision.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * Get the module that owns the supervision.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    /**
     * Get the evaluations that belong to the supervision.
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    /**
     * Get the documents that belong to the supervision.
     */
    public function documents(): HasManyThrough
    {
        return $this->hasManyThrough(Document::class, Evaluation::class, 'supervision_id', 'documentable_id')
            ->where('documentable_type', Evaluation::class);
    }
}
