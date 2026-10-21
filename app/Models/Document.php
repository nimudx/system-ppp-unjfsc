<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Document extends Model
{
    protected $fillable = [
        'documentable_id',
        'documentable_type',
        'name',
        'document_type_id',
        'path',
        'comment',
        'uploaded_by',
        'reviewed_by',
        'approval_status',
        'status',
    ];

    /**
     * Get the documentable model that owns the document.
     */
    public function documentable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the document type that owns the document.
     */
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }
}
