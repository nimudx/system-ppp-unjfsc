<?php

namespace App\Domains\Documents\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\URL;

class Document extends Model
{
    /** Disco donde se guardan los archivos de los documentos. */
    public const DISK = 'public';

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

    /**
     * URL firmada y temporal para ver el archivo (SignedDocumentController).
     */
    public function signedFileUrl(int $minutes = 60): string
    {
        return URL::temporarySignedRoute(
            'documents.file',
            now()->addMinutes($minutes),
            ['document' => $this->getKey()],
        );
    }
}
