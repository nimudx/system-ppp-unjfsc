import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BadgeCheck,
    CircleAlert,
    Clock3,
    Download,
    ExternalLink,
    FileCheck2,
    FileText,
    Maximize2,
    Upload,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { DragEvent, KeyboardEvent } from 'react';

import { formatDateTime } from '@/modules/documents';
import { cv as cvRoute } from '@/routes/academic';
import { store as storeCv } from '@/routes/academic/cv';
import ConfirmDeleteDialog from '@/shared/components/confirm-delete-dialog';
import Heading from '@/shared/components/heading';
import PageContainer from '@/shared/components/page-container';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import AppLayout from '@/shared/layouts/app-layout';

type CvFile = {
    id: number;
    name: string;
    path: string | null;
    approval_status: number;
    comment: string | null;
    created_at: string | null;
    updated_at: string | null;
};

type Props = {
    cv: CvFile | null;
};

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

/**
 * Ajusta estos valores a los que use tu backend para `approval_status`.
 * Se asumió: 0 = en revisión, 1 = aprobado, 2 = observado.
 */
const APPROVAL = {
    pending: {
        label: 'En revisión',
        hint: 'Tu CV está esperando la revisión del coordinador.',
        icon: Clock3,
        className:
            'bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20',
    },
    approved: {
        label: 'Aprobado',
        hint: 'Tu CV fue aprobado. No necesitas hacer nada más.',
        icon: BadgeCheck,
        className:
            'bg-green-500/10 text-green-700 dark:text-green-400 ring-green-500/20',
    },
    observed: {
        label: 'Con observaciones',
        hint: 'Revisa el comentario y sube una versión corregida.',
        icon: CircleAlert,
        className:
            'bg-red-500/10 text-red-700 dark:text-red-400 ring-red-500/20',
    },
} as const;

function approvalOf(status: number) {
    if (status === 1) return APPROVAL.approved;
    if (status === 2) return APPROVAL.observed;

    return APPROVAL.pending;
}

function extensionOf(name: string): string {
    return name.split('.').pop()?.toLowerCase() ?? '';
}

function formatSize(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function validate(file: File): string | null {
    if (!ALLOWED_EXTENSIONS.includes(extensionOf(file.name))) {
        return 'Formato no permitido. Sube un archivo PDF, DOC o DOCX.';
    }

    if (file.size === 0) {
        return 'El archivo está vacío. Elige otro.';
    }

    if (file.size > MAX_SIZE_BYTES) {
        return `El archivo pesa ${formatSize(file.size)}. El límite es ${MAX_SIZE_MB} MB.`;
    }

    return null;
}

const styles = `
@keyframes cv-rise {
    from { opacity: 0; transform: translateY(16px) rotate(-0.8deg) scale(0.985); }
    to   { opacity: 1; transform: none; }
}
@keyframes cv-swap {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: none; }
}
@keyframes cv-pop {
    0%   { opacity: 0; transform: scale(0.85); }
    60%  { opacity: 1; transform: scale(1.03); }
    100% { transform: scale(1); }
}
@keyframes cv-shake {
    10%, 90% { transform: translateX(-1px); }
    20%, 80% { transform: translateX(2px); }
    30%, 50%, 70% { transform: translateX(-4px); }
    40%, 60% { transform: translateX(4px); }
}
@keyframes cv-scan {
    0%   { top: 0; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { top: calc(100% - 2px); opacity: 0; }
}
@keyframes cv-float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-5px); }
}
@keyframes cv-draw {
    to { stroke-dashoffset: 0; }
}
@keyframes cv-sheen {
    from { transform: translateX(-100%); }
    to   { transform: translateX(100%); }
}
.cv-rise  { animation: cv-rise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.cv-swap  { animation: cv-swap 0.28s ease-out both; }
.cv-pop   { animation: cv-pop 0.35s ease-out both; }
.cv-shake { animation: cv-shake 0.45s ease-in-out both; }
.cv-scan  { animation: cv-scan 1.6s ease-in-out infinite; }
.cv-float { animation: cv-float 2.4s ease-in-out infinite; }
.cv-draw  { stroke-dasharray: 24; stroke-dashoffset: 24; animation: cv-draw 0.45s 0.1s ease-out forwards; }
.cv-sheen { animation: cv-sheen 1.4s linear infinite; }

@media (prefers-reduced-motion: reduce) {
    .cv-rise, .cv-swap, .cv-pop, .cv-shake, .cv-scan, .cv-float, .cv-sheen { animation: none; }
    .cv-draw { animation: none; stroke-dashoffset: 0; }
}
`;

/* -------------------------------------------------------------------------- */
/*  Vista previa                                                              */
/* -------------------------------------------------------------------------- */

function PdfFrame({
    url,
    title,
    toolbar,
}: {
    url: string;
    title: string;
    toolbar: boolean;
}) {
    const [loaded, setLoaded] = useState(false);
    const params = toolbar ? '' : '#toolbar=0&navpanes=0&view=FitH';

    return (
        <div className="relative size-full bg-white">
            {!loaded && (
                <div className="absolute inset-0 space-y-3 overflow-hidden p-8">
                    <div className="h-5 w-1/3 rounded bg-muted" />
                    <div className="h-3 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="pt-6" />
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-3 rounded bg-muted"
                            style={{ width: `${88 - ((i * 13) % 35)}%` }}
                        />
                    ))}
                    <div className="cv-sheen absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
            )}
            <iframe
                key={url}
                src={`${url}${params}`}
                title={title}
                onLoad={() => setLoaded(true)}
                className={`size-full border-0 transition-opacity duration-500 ${
                    loaded ? 'opacity-100' : 'opacity-0'
                }`}
            />
        </div>
    );
}

function NoPreview({
    extension,
    onDownload,
}: {
    extension: string;
    onDownload?: string | null;
}) {
    return (
        <div className="flex size-full flex-col items-center justify-center gap-3 bg-muted/20 p-8 text-center">
            <div className="cv-float flex size-16 items-center justify-center rounded-2xl bg-muted">
                <FileText className="size-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
                Los archivos .{extension || 'doc'} no se pueden previsualizar
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
                Guárdalo como PDF desde Word y se verá aquí tal cual lo verá el
                coordinador.
            </p>
            {onDownload && (
                <Button asChild variant="outline" size="sm">
                    <a href={onDownload} target="_blank" rel="noreferrer">
                        <Download className="mr-2 size-4" />
                        Descargar para verlo
                    </a>
                </Button>
            )}
        </div>
    );
}

function EmptyPaper({ onPick }: { onPick: () => void }) {
    return (
        <button
            type="button"
            onClick={onPick}
            className="group flex size-full flex-col gap-3 bg-white p-8 text-left transition-colors outline-none hover:bg-muted/20 focus-visible:ring-2 focus-visible:ring-ring dark:bg-card"
        >
            <div className="h-5 w-1/3 rounded bg-muted transition-all duration-500 group-hover:w-2/5" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="pt-4" />
            {[92, 80, 86, 60, 90, 74, 84].map((w, i) => (
                <div
                    key={i}
                    className="h-2.5 rounded bg-muted/70 transition-all duration-500"
                    style={{
                        width: `${w}%`,
                        transitionDelay: `${i * 30}ms`,
                    }}
                />
            ))}
            <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                <Upload className="size-4" />
                Tu CV aparecerá aquí
            </div>
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/*  Página                                                                    */
/* -------------------------------------------------------------------------- */

export default function StudentCv({ cv }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const dragDepth = useRef(0);

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const previewUrlRef = useRef<string | null>(null);
    const [mode, setMode] = useState<'current' | 'new'>('current');
    const [dragging, setDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [errorKey, setErrorKey] = useState(0);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    /* URL temporal para previsualizar el archivo elegido antes de subirlo */
    const setPreviewFile = (next: File | null) => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }

        const url = next ? URL.createObjectURL(next) : null;

        previewUrlRef.current = url;
        setPreviewUrl(url);
    };

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    /* Cerrar pantalla completa con Escape */
    useEffect(() => {
        if (!fullscreen) return;

        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') setFullscreen(false);
        };
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [fullscreen]);

    /* El aviso de "CV actualizado" desaparece solo */
    useEffect(() => {
        if (!justSaved) return;

        const t = setTimeout(() => setJustSaved(false), 5000);

        return () => clearTimeout(t);
    }, [justSaved]);

    const pickFile = () => inputRef.current?.click();

    const acceptFile = (candidate: File | undefined | null) => {
        if (!candidate) return;

        const problem = validate(candidate);

        if (problem) {
            setError(problem);
            setErrorKey((k) => k + 1);

            return;
        }

        setError(null);
        setJustSaved(false);
        setPreviewFile(candidate);
        setFile(candidate);
        setMode('new');
    };

    const removeFile = () => {
        setPreviewFile(null);
        setFile(null);
        setError(null);
        setMode('current');
    };

    const submit = () => {
        if (!file) return;

        router.post(
            storeCv.url(),
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => {
                    setProcessing(true);
                    setProgress(0);
                    setError(null);
                },
                onProgress: (event) => {
                    setProgress(Math.round(event?.percentage ?? 0));
                },
                onSuccess: () => {
                    setConfirmOpen(false);
                    setPreviewFile(null);
                    setFile(null);
                    setMode('current');
                    setJustSaved(true);
                },
                onError: (errors) => {
                    setConfirmOpen(false);
                    setError(
                        errors.file ??
                            'No se pudo subir el CV. Inténtalo nuevamente.',
                    );
                    setErrorKey((k) => k + 1);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const handleSubmit = () => {
        if (!file) return;

        if (cv) {
            setConfirmOpen(true);

            return;
        }

        submit();
    };

    /* Arrastrar y soltar */
    const onDragEnter = (e: DragEvent) => {
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
    };
    const onDragLeave = (e: DragEvent) => {
        e.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);

        if (dragDepth.current === 0) setDragging(false);
    };
    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        acceptFile(e.dataTransfer.files?.[0]);
    };
    const onZoneKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            pickFile();
        }
    };

    /* Qué se está viendo en la vista previa */
    const showing: 'new' | 'current' | 'empty' =
        file && (!cv || mode === 'new') ? 'new' : cv ? 'current' : 'empty';

    const newIsPdf = file ? extensionOf(file.name) === 'pdf' : false;
    const currentIsPdf = cv ? extensionOf(cv.name) === 'pdf' : false;

    const activePdfUrl =
        showing === 'new' && newIsPdf
            ? previewUrl
            : showing === 'current' && currentIsPdf
              ? (cv?.path ?? null)
              : null;

    const activeName =
        showing === 'new' ? file?.name : showing === 'current' ? cv?.name : '';

    const approval = cv ? approvalOf(cv.approval_status) : null;

    /* Lista de comprobación que se completa sola al elegir un archivo */
    const checks: { label: string; state: 'idle' | 'ok' | 'warn' }[] = [
        {
            label: 'Formato PDF, DOC o DOCX',
            state: file ? 'ok' : 'idle',
        },
        {
            label: `Pesa menos de ${MAX_SIZE_MB} MB`,
            state: file ? 'ok' : 'idle',
        },
        {
            label: newIsPdf
                ? 'Es PDF: se verá igual en cualquier equipo'
                : file
                  ? 'Mejor en PDF para que se vea igual en cualquier equipo'
                  : 'Recomendado: PDF',
            state: !file ? 'idle' : newIsPdf ? 'ok' : 'warn',
        },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Mi CV', href: cvRoute.url() }]}>
            <Head title="Mi CV" />
            <style>{styles}</style>

            <PageContainer>
                <Heading
                    variant="small"
                    title="Mi CV"
                    description="Sube tu currículum para completar tu perfil de prácticas. Revísalo en la vista previa antes de enviarlo."
                />

                <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
                    {/* ------------------------- Columna de acciones ------------------------- */}
                    <div className="space-y-4">
                        {justSaved && (
                            <div
                                role="status"
                                className="cv-pop flex items-center gap-3 rounded-xl bg-green-500/10 p-3 text-sm text-green-700 ring-1 ring-green-500/20 dark:text-green-400"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="size-6 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        opacity="0.35"
                                    />
                                    <path
                                        className="cv-draw"
                                        d="M7.5 12.5l3 3 6-7"
                                    />
                                </svg>
                                CV actualizado. El anterior se eliminó.
                            </div>
                        )}

                        <SectionCard>
                            <SectionCard.Header>
                                <h3 className="text-sm font-semibold">
                                    {cv ? 'Tu CV vigente' : 'Sube tu CV'}
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Solo se guarda un CV a la vez.
                                </p>
                            </SectionCard.Header>

                            <SectionCard.Body className="space-y-5">
                                {/* CV actual */}
                                {cv && approval && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <FileCheck2 className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className="truncate text-sm font-medium"
                                                    title={cv.name}
                                                >
                                                    {cv.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Actualizado el{' '}
                                                    {formatDateTime(
                                                        cv.updated_at ??
                                                            cv.created_at,
                                                    ) ?? 'fecha no registrada'}
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            className={`flex items-start gap-2 rounded-lg p-3 text-xs ring-1 ${approval.className}`}
                                        >
                                            <approval.icon className="mt-0.5 size-4 shrink-0" />
                                            <div>
                                                <p className="font-medium">
                                                    {approval.label}
                                                </p>
                                                <p className="opacity-80">
                                                    {approval.hint}
                                                </p>
                                                {cv.comment && (
                                                    <p className="mt-2 border-l-2 border-current/30 pl-2 italic">
                                                        {cv.comment}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {cv.path && (
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <a
                                                        href={cv.path}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <ExternalLink className="mr-2 size-4" />
                                                        Abrir
                                                    </a>
                                                </Button>
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <a
                                                        href={cv.path}
                                                        download={cv.name}
                                                    >
                                                        <Download className="mr-2 size-4" />
                                                        Descargar
                                                    </a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {cv && <hr className="border-dashed" />}

                                {/* Zona de carga */}
                                <div
                                    key={errorKey}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={
                                        cv
                                            ? 'Elegir un archivo para reemplazar tu CV'
                                            : 'Elegir tu CV'
                                    }
                                    onClick={pickFile}
                                    onKeyDown={onZoneKey}
                                    onDragEnter={onDragEnter}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                        error
                                            ? 'cv-shake border-destructive/60'
                                            : ''
                                    } ${
                                        dragging
                                            ? 'scale-[1.02] border-primary bg-primary/5'
                                            : 'hover:border-primary/50 hover:bg-muted/30'
                                    }`}
                                >
                                    <div
                                        className={`mb-3 flex size-12 items-center justify-center rounded-full transition-all duration-200 ${
                                            dragging
                                                ? 'cv-float bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        <Upload className="size-6" />
                                    </div>
                                    <p className="text-sm font-medium">
                                        {dragging
                                            ? 'Suelta el archivo aquí'
                                            : cv
                                              ? 'Arrastra tu nuevo CV o haz clic'
                                              : 'Arrastra tu CV o haz clic'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        PDF, DOC o DOCX · hasta {MAX_SIZE_MB} MB
                                    </p>
                                </div>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="sr-only"
                                    tabIndex={-1}
                                    onChange={(event) => {
                                        acceptFile(event.target.files?.[0]);
                                        event.target.value = '';
                                    }}
                                />

                                {error && (
                                    <p
                                        role="alert"
                                        className="cv-swap flex items-start gap-2 text-xs text-destructive"
                                    >
                                        <CircleAlert className="mt-0.5 size-4 shrink-0" />
                                        {error}
                                    </p>
                                )}

                                {/* Archivo elegido */}
                                {file && (
                                    <div className="cv-pop flex items-center gap-3 rounded-lg border p-3">
                                        <FileText className="size-6 shrink-0 text-primary" />
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className="truncate text-sm font-medium"
                                                title={file.name}
                                            >
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatSize(file.size)}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Quitar archivo"
                                            disabled={processing}
                                            onClick={removeFile}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                )}

                                {/* Comprobaciones */}
                                <ul className="space-y-2 text-xs">
                                    {checks.map((item) => (
                                        <li
                                            key={item.label}
                                            className={`flex items-center gap-2 transition-colors duration-300 ${
                                                item.state === 'ok'
                                                    ? 'text-green-700 dark:text-green-400'
                                                    : item.state === 'warn'
                                                      ? 'text-amber-700 dark:text-amber-400'
                                                      : 'text-muted-foreground'
                                            }`}
                                        >
                                            <span
                                                className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                                                    item.state === 'ok'
                                                        ? 'scale-110 border-transparent bg-green-500 text-white'
                                                        : item.state === 'warn'
                                                          ? 'scale-110 border-transparent bg-amber-500 text-white'
                                                          : 'border-current'
                                                }`}
                                            >
                                                {item.state === 'ok' && (
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        className="size-3"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        aria-hidden
                                                    >
                                                        <path
                                                            key={file?.name}
                                                            className="cv-draw"
                                                            d="M5 12.5l4.5 4.5L19 7.5"
                                                        />
                                                    </svg>
                                                )}
                                                {item.state === 'warn' && (
                                                    <span className="text-[10px] leading-none font-bold">
                                                        !
                                                    </span>
                                                )}
                                            </span>
                                            {item.label}
                                        </li>
                                    ))}
                                </ul>

                                {/* Botón principal con progreso integrado */}
                                <Button
                                    className="relative w-full overflow-hidden"
                                    disabled={!file || processing}
                                    onClick={handleSubmit}
                                >
                                    {processing && (
                                        <span
                                            aria-hidden
                                            className="absolute inset-y-0 left-0 bg-primary-foreground/25 transition-[width] duration-200 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    )}
                                    <span className="relative flex items-center">
                                        <Upload className="mr-2 size-4" />
                                        {processing
                                            ? `Subiendo… ${progress}%`
                                            : cv
                                              ? 'Reemplazar CV'
                                              : 'Subir CV'}
                                    </span>
                                </Button>

                                {cv && (
                                    <p className="text-xs text-muted-foreground">
                                        Al reemplazarlo, el archivo anterior se
                                        elimina permanentemente.
                                    </p>
                                )}
                            </SectionCard.Body>
                        </SectionCard>
                    </div>

                    {/* ------------------------- Vista previa ------------------------- */}
                    <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {cv && file ? (
                                <div
                                    role="tablist"
                                    aria-label="Qué CV ver"
                                    className="relative grid grid-cols-2 rounded-lg bg-muted p-1 text-xs font-medium"
                                >
                                    <span
                                        aria-hidden
                                        className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-background shadow-sm transition-transform duration-300 ease-out ${
                                            mode === 'new'
                                                ? 'translate-x-full'
                                                : ''
                                        }`}
                                    />
                                    {(
                                        [
                                            ['current', 'CV vigente'],
                                            ['new', 'Nuevo CV'],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            role="tab"
                                            aria-selected={mode === value}
                                            onClick={() => setMode(value)}
                                            className={`relative z-10 rounded-md px-4 py-1.5 transition-colors ${
                                                mode === value
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm font-medium">
                                    Vista previa
                                </p>
                            )}

                            {activeName && (
                                <p
                                    key={activeName}
                                    className="cv-swap min-w-0 flex-1 truncate text-xs text-muted-foreground"
                                >
                                    {activeName}
                                </p>
                            )}

                            {activePdfUrl && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="ml-auto"
                                    onClick={() => setFullscreen(true)}
                                >
                                    <Maximize2 className="mr-2 size-4" />
                                    Pantalla completa
                                </Button>
                            )}
                        </div>

                        <div className="cv-rise relative h-[min(78vh,48rem)] min-h-[28rem] overflow-hidden rounded-lg border bg-white shadow-lg ring-1 shadow-black/5 ring-black/5 dark:bg-card">
                            <div
                                key={`${showing}-${activeName}`}
                                className="cv-swap size-full"
                            >
                                {activePdfUrl ? (
                                    <PdfFrame
                                        url={activePdfUrl}
                                        title={`Vista previa de ${activeName}`}
                                        toolbar={false}
                                    />
                                ) : showing === 'empty' ? (
                                    <EmptyPaper onPick={pickFile} />
                                ) : (
                                    <NoPreview
                                        extension={extensionOf(
                                            activeName ?? '',
                                        )}
                                        onDownload={
                                            showing === 'current'
                                                ? cv?.path
                                                : null
                                        }
                                    />
                                )}
                            </div>

                            {/* Línea de escaneo mientras se sube */}
                            {processing && (
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 bg-primary/5"
                                >
                                    <div className="cv-scan absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_16px_2px] shadow-primary/60" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </PageContainer>

            {/* Pantalla completa */}
            {fullscreen && activePdfUrl && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Vista previa del CV"
                    className="cv-swap fixed inset-0 z-50 flex flex-col bg-background/90 p-4 backdrop-blur-sm"
                >
                    <div className="mb-3 flex items-center gap-3">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">
                            {activeName}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFullscreen(false)}
                        >
                            <X className="mr-2 size-4" />
                            Cerrar
                        </Button>
                    </div>
                    <div className="cv-pop mx-auto min-h-0 w-full max-w-5xl flex-1 overflow-hidden rounded-lg border shadow-2xl">
                        <PdfFrame
                            url={activePdfUrl}
                            title={`Vista previa de ${activeName}`}
                            toolbar
                        />
                    </div>
                </div>
            )}

            <ConfirmDeleteDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="¿Reemplazar tu CV actual?"
                description={
                    <>
                        Esta acción es permanente. El CV que tienes registrado (
                        {cv?.name ?? 'actual'}) se eliminará y no podrás
                        recuperarlo. Se guardará únicamente el archivo que
                        acabas de seleccionar.
                    </>
                }
                confirmLabel="Sí, reemplazar"
                processing={processing}
                icon={AlertTriangle}
                onConfirm={() => submit()}
            />
        </AppLayout>
    );
}
