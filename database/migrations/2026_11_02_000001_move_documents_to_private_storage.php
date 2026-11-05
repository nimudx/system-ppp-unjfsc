<?php

use App\Domains\Documents\Models\Document;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Mueve los archivos de documentos (expedientes, prácticas, evaluaciones, recursos)
     * de storage/app/public, que se podía abrir por /storage/... sin iniciar sesión,
     * al disco privado storage/app/private. La ruta guardada en la BD no cambia.
     */
    public function up(): void
    {
        $this->moveAll(Document::LEGACY_DISK, Document::DISK);
    }

    public function down(): void
    {
        $this->moveAll(Document::DISK, Document::LEGACY_DISK);
    }

    private function moveAll(string $from, string $to): void
    {
        $source = Storage::disk($from);
        $target = Storage::disk($to);
        $moved = 0;

        DB::table('documents')->whereNotNull('path')->select('path')->distinct()->orderBy('path')
            ->chunk(200, function ($rows) use ($source, $target, &$moved) {
                foreach ($rows as $row) {
                    // Ya movido o el archivo no existe: no hay nada que hacer.
                    if (! $source->exists($row->path) || $target->exists($row->path)) {
                        continue;
                    }

                    $stream = $source->readStream($row->path);
                    $written = $target->writeStream($row->path, $stream);

                    if (is_resource($stream)) {
                        fclose($stream);
                    }

                    // Solo se borra el original si la copia quedó guardada.
                    if ($written && $target->exists($row->path)) {
                        $source->delete($row->path);
                        $moved++;
                    }
                }
            });

        Log::info("Documentos movidos de {$from} a {$to}: {$moved}");
    }
};
