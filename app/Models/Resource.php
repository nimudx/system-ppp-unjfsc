<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Resource extends Model
{
    protected $fillable = [
        'name',
        'description',
        'uploader_id',
        'uploader_type',
        'role_id',
        'level',
        'document_type_id',
        'location_id',
        'location_type',
        'semester_id',
        'status',
    ];

    protected $casts = [
        'level' => 'integer',
        'status' => 'integer',
    ];

    /**
     * Get the uploader that owns the resource.
     */
    public function uploader(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the location that owns the resource.
     */
    public function location(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the document type that owns the resource.
     */
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    /**
     * Get the role that owns the resource.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the semester that owns the resource.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Get the documents that belong to the resource.
     */
    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
