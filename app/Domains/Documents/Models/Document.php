<?php

namespace App\Domains\Documents\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\URL;

class Document extends Model
{
    /**
     * Disco privado (storage/app/private): los archivos no tienen URL pública y solo se
     * entregan con sesión iniciada y una URL firmada (signedFileUrl).
     */
    public const DISK = 'local';

    /** Disco público donde estaban antes; lo usa la migración que los mueve. */
    public const LEGACY_DISK = 'public';

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

    /**
     * URL firmada para el frontend; se agrega al JSON con ->append('file_url').
     */
    protected function fileUrl(): Attribute
    {
        return Attribute::get(fn () => $this->exists ? $this->signedFileUrl() : null);
    }
}
