<?php

namespace App\Domains\Documents\Http\Controllers;

use App\Domains\Documents\Models\Document;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Sirve el archivo de un documento para verlo en el navegador.
 *
 * Solo responde a URLs firmadas que genera el backend
 * (Document::signedFileUrl) y a usuarios con sesión iniciada, así los
 * archivos de los expedientes no quedan expuestos con un enlace público.
 */
class SignedDocumentController extends Controller
{
    public function __invoke(Document $document): StreamedResponse
    {
        $disk = Storage::disk(Document::DISK);

        abort_unless($document->path && $disk->exists($document->path), 404);

        return $disk->response(
            $document->path,
            $document->name ?: basename($document->path),
            [
                'Cache-Control' => 'private, no-store, max-age=0',
                'X-Content-Type-Options' => 'nosniff',
            ],
        );
    }
}
