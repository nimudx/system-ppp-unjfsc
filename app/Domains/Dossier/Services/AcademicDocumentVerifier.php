<?php

namespace App\Domains\Dossier\Services;

use App\Domains\Identity\Models\Assignment;
use App\Shared\Enums\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Smalot\PdfParser\Parser;
use Throwable;

/**
 * Revisa que la Ficha de Matrícula y el Récord Académico que sube un estudiante sean
 * los documentos correctos, de la UNJFSC, a su nombre y de su escuela, antes de guardarlos.
 */
class AcademicDocumentVerifier
{
    private const UNIVERSITY = 'JOSE FAUSTINO SANCHEZ CARRION';

    /**
     * Títulos que identifican cada documento en el PDF que genera el sistema académico.
     */
    private const DOCUMENTS = [
        'ficha' => ['title' => 'FICHA DE MATRICULA', 'the' => 'la Ficha de Matrícula', 'a' => 'una Ficha de Matrícula', 'your' => 'tu Ficha de Matrícula descargada'],
        'record' => ['title' => 'RECORD ACADEMICO', 'the' => 'el Récord Académico', 'a' => 'un Récord Académico', 'your' => 'tu Récord Académico descargado'],
    ];

    public function __construct(protected Parser $parser) {}

    public function applies(string $code, ?Assignment $assignment): bool
    {
        return isset(self::DOCUMENTS[$code])
            && $assignment?->role_id === Role::ESTUDIANTE->value;
    }

    /**
     * Devuelve el motivo del rechazo, o null si el documento es correcto.
     */
    public function verify(UploadedFile $file, string $code, Assignment $assignment): ?string
    {
        if ($file->getClientOriginalExtension() !== 'pdf' && $file->getMimeType() !== 'application/pdf') {
            return Str::ucfirst(self::DOCUMENTS[$code]['the']).' debe subirse en PDF, tal como se descarga del sistema académico.';
        }

        try {
            $text = $this->parser->parseFile($file->getRealPath())->getText();
        } catch (Throwable) {
            $text = '';
        }

        return $this->check($text, $code, $this->expectedFor($assignment));
    }

    /**
     * @param  array{code: ?string, names: string, surnames: string, school: ?string, year: ?int}  $student
     */
    public function check(string $text, string $code, array $student): ?string
    {
        $document = self::DOCUMENTS[$code];
        $the = Str::ucfirst($document['the']);
        $content = $this->normalize($text);

        if (mb_strlen(preg_replace('/[^A-Z]/', '', $content)) < 50) {
            return 'No pudimos leer el texto del PDF. Sube el archivo descargado del sistema académico de la universidad, no un escaneo ni una foto.';
        }

        if (! str_contains($content, self::UNIVERSITY)) {
            return 'El documento no es de la Universidad Nacional José Faustino Sánchez Carrión. Sube '.$document['your'].' del sistema académico.';
        }

        if (! str_contains($content, $document['title'])) {
            foreach (self::DOCUMENTS as $otherCode => $other) {
                if ($otherCode !== $code && str_contains($content, $other['title'])) {
                    return "Subiste {$other['a']}. En este espacio va {$document['the']}.";
                }
            }

            return "El archivo no es {$document['a']}. Revisa que hayas elegido el documento correcto.";
        }

        if ($student['code'] && ! preg_match('/\b'.preg_quote($student['code'], '/').'\b/', $content)) {
            preg_match('/\b\d{10}\b/', $content, $found);

            return isset($found[0])
                ? "{$the} pertenece a otro estudiante (código {$found[0]}). Sube tu propio documento."
                : "{$the} no tiene tu código universitario ({$student['code']}).";
        }

        $missing = collect(explode(' ', $this->normalize($student['surnames'].' '.$student['names'])))
            ->filter(fn ($word) => mb_strlen($word) > 1)
            ->reject(fn ($word) => preg_match('/\b'.preg_quote($word, '/').'\b/', $content));

        if ($missing->isNotEmpty()) {
            return "{$the} no está a tu nombre ({$student['surnames']} {$student['names']}). Sube tu propio documento.";
        }

        if ($student['school'] && ! str_contains($content, $this->normalize($student['school']))) {
            return "{$the} no corresponde a tu escuela profesional ({$student['school']}).";
        }

        if ($code === 'ficha' && $student['year']) {
            preg_match_all('/SEMESTRE\s*:\s*(\d{4})\s*-\s*(\d)/', $content, $semesters, PREG_SET_ORDER);

            $years = array_map(fn ($match) => (int) $match[1], $semesters);

            if ($years === []) {
                return 'No encontramos el semestre en la Ficha de Matrícula. Descárgala nuevamente del sistema académico.';
            }

            if (! in_array($student['year'], $years, true)) {
                $last = end($semesters);

                return "La Ficha de Matrícula es del semestre {$last[1]}-{$last[2]}. Sube tu ficha del año {$student['year']}.";
            }
        }

        return null;
    }

    /**
     * @return array{code: ?string, names: string, surnames: string, school: ?string, year: ?int}
     */
    private function expectedFor(Assignment $assignment): array
    {
        $assignment->loadMissing(['user.person', 'section.school', 'semester']);

        $user = $assignment->user;
        $emailUser = Str::before((string) $user->email, '@');

        return [
            // El correo institucional del estudiante es su código universitario de 10 dígitos.
            'code' => preg_match('/^\d{10}$/', $emailUser) ? $emailUser : null,
            'names' => (string) $user->person?->names,
            'surnames' => (string) $user->person?->surnames,
            'school' => $assignment->section?->school?->name,
            'year' => preg_match('/^(\d{4})/', (string) $assignment->semester?->code, $match) ? (int) $match[1] : null,
        ];
    }

    private function normalize(string $text): string
    {
        $text = Str::upper(Str::ascii($text));
        $text = preg_replace('/[^A-Z0-9:\-]+/', ' ', $text);

        return trim(preg_replace('/\s+/', ' ', $text));
    }
}
