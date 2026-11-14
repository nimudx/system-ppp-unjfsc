import { Head, useForm } from '@inertiajs/react';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    Download,
    FileText,
    History as HistoryIcon,
    Maximize2,
    MessageSquare,
    Minimize2,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
    DocumentViewer,
    enter,
    formatDateTime,
    getStatusMeta,
    HISTORY_PREVIEW,
    MAX_FILE_SIZE,
    RequirementsList,
    resolveStatus,
    SubmissionPanel,
    type DossierHistoryRecord,
    type DocumentRequirement,
} from '@/modules/documents';
import type { AssignmentRecord } from '@/modules/identity';

import dossiers from '@/routes/academic/dossiers';
import Heading from '@/shared/components/heading';
import PageContainer from '@/shared/components/page-container';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import { Spinner } from '@/shared/components/ui/spinner';
import AppLayout from '@/shared/layouts/app-layout';
import DocumentReviewLayout from '@/shared/layouts/document-review-layout';
import { cn } from '@/shared/lib/utils';

import type { BreadcrumbItem } from '@/shared/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Documentación',
        href: dossiers.submission.toString(),
    },
];

const MAX_FILE_KB = Math.round(MAX_FILE_SIZE / 1024);

/* -------------------------------------------------------------------------- */
/* Utilidades                                                                 */
/* -------------------------------------------------------------------------- */

/* true en el siguiente frame: dispara la animación de entrada una sola vez. */
function useReady() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setReady(true));

        return () => cancelAnimationFrame(frame);
    }, []);

    return ready;
}

/* -------------------------------------------------------------------------- */
/* Resumen del expediente: anillo + una frase que dice qué sigue              */
/* -------------------------------------------------------------------------- */

const RING_RADIUS = 18;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function DossierSummary({
    requirements,
}: {
    requirements: DocumentRequirement[];
}) {
    const ready = useReady();
    const total = requirements.length;

    if (total === 0) {
        return null;
    }

    const approved = requirements.filter(
        (item) => item.latest && resolveStatus(item) === 1,
    ).length;
    const observed = requirements.filter(
        (item) => item.latest && resolveStatus(item) === 3,
    ).length;
    const missing = requirements.filter((item) => !item.latest).length;
    const inReview = total - approved - observed - missing;

    const complete = approved === total;

    let headline: string;
    let detail: string | undefined;

    if (complete) {
        headline = 'Expedientes completos';
        detail = 'Todos tus documentos fueron aprobados.';
    } else if (observed > 0) {
        headline =
            observed === 1
                ? '1 documento por corregir'
                : `${observed} documentos por corregir`;
        detail =
            observed === 1
                ? 'Revisa el comentario y súbelo de nuevo.'
                : 'Revisa los comentarios y súbelos de nuevo.';
    } else if (missing > 0) {
        headline =
            missing === 1
                ? 'Falta 1 documento por subir'
                : `Faltan ${missing} documentos por subir`;
        detail = inReview > 0 ? `${inReview} en revisión.` : undefined;
    } else {
        headline = 'En revisión';
        detail = 'Espera la respuesta del revisor.';
    }

    const tone = complete
        ? 'stroke-green-500'
        : observed > 0
          ? 'stroke-destructive'
          : 'stroke-primary';

    const offset = ready
        ? RING_LENGTH * (1 - approved / total)
        : RING_LENGTH;

    return (
        <div
            className="flex items-center gap-3"
            role="status"
            aria-label={`${approved} de ${total} documentos aprobados. ${headline}`}
        >
            <div className="relative size-11 shrink-0">
                <svg
                    viewBox="0 0 44 44"
                    className="size-full -rotate-90"
                    aria-hidden
                >
                    <circle
                        cx="22"
                        cy="22"
                        r={RING_RADIUS}
                        fill="none"
                        strokeWidth="4"
                        className="stroke-muted"
                    />
                    {approved > 0 && (
                        <circle
                            cx="22"
                            cy="22"
                            r={RING_RADIUS}
                            fill="none"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={RING_LENGTH}
                            strokeDashoffset={offset}
                            className={cn(
                                'transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none',
                                tone,
                            )}
                        />
                    )}
                </svg>

                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums">
                    {complete ? (
                        <Check className="size-4 text-green-500" />
                    ) : (
                        `${approved}/${total}`
                    )}
                </span>
            </div>

            <div className="min-w-0">
                <p className="text-sm leading-tight font-medium">{headline}</p>

                {detail && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {detail}
                    </p>
                )}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Guía: cómo subir un documento (reemplaza "Por atender" y "Plantilla")      */
/* -------------------------------------------------------------------------- */

function HowToSubmitCard({ hasTemplate }: { hasTemplate: boolean }) {
    const steps = [
        {
            title: 'Descarga el documento oficial',
            description:
                'Debe ser el documento oficial, descargado de la intranet de la universidad.',
        },
        {
            title: 'Súbelo aquí',
            description: 'Sin modificarlo ni escanearlo.',
        },
        {
            title: 'Espera la revisión del Docente Titular',
            description: 'Si lo observan, corrígelo y vuelve a subirlo.',
        },
    ];

    return (
        <SectionCard>
            <SectionCard.Header>
                <div className="flex h-9 items-center">
                    <h3 className="text-sm leading-none font-semibold tracking-tight">
                        Subir tu documento correctamente
                    </h3>
                </div>
            </SectionCard.Header>

            <SectionCard.Body>
                <ol className="space-y-3">
                    {steps.map((step, index) => (
                        <li key={step.title} className="flex gap-3">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium tabular-nums">
                                {index + 1}
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium">
                                    {step.title}
                                </p>
                                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                    {step.description}
                                </p>

                                {index === 0 && hasTemplate && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 w-full"
                                    >
                                        <Download />
                                        Descargar formato
                                    </Button>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>
                <div className="mt-4 flex items-start gap-2 border-t pt-3">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />

                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Si tu documento no cumple con los requerimientos, no podrá ser cargado y/o posteriormente observado
                    </p>
                </div>
            </SectionCard.Body>
        </SectionCard>
    );
}

/* -------------------------------------------------------------------------- */
/* Historial general de documentos (todo en una sola línea de tiempo)         */
/* -------------------------------------------------------------------------- */

function DocumentHistoryPanel({
    history,
}: {
    history: DossierHistoryRecord[];
}) {
    const [showAll, setShowAll] = useState(false);

    const sorted = useMemo(
        () =>
            [...history].sort((a, b) => {
                const dateA = a.created_at
                    ? new Date(a.created_at).getTime()
                    : 0;
                const dateB = b.created_at
                    ? new Date(b.created_at).getTime()
                    : 0;

                return dateB - dateA;
            }),
        [history],
    );

    const visible = showAll ? sorted : sorted.slice(0, HISTORY_PREVIEW);
    const hidden = sorted.length - visible.length;

    return (
        <SectionCard className="min-w-0">
            <SectionCard.Header>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                            <HistoryIcon className="size-4 text-muted-foreground" />
                        </div>

                        <div className="min-w-0">
                            <h3 className="text-sm leading-none font-semibold tracking-tight">
                                Historial
                            </h3>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                Movimientos de tus documentos
                            </p>
                        </div>
                    </div>

                    <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium tabular-nums">
                        {history.length}
                    </span>
                </div>
            </SectionCard.Header>

            <SectionCard.Body className="space-y-4">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-9 text-center">
                        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
                            <HistoryIcon className="size-5 text-muted-foreground/60" />
                        </div>

                        <h4 className="text-sm font-semibold">
                            Aún no hay movimientos
                        </h4>

                        <p className="mt-1 max-w-56 text-xs leading-relaxed text-muted-foreground">
                            Cuando subas un documento, sus versiones y
                            revisiones aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="relative space-y-4 before:absolute before:inset-y-2 before:left-[9px] before:w-px before:bg-border">
                            {visible.map((record, index) => {
                                const status = getStatusMeta(
                                    record.approval_status,
                                );
                                const StatusIcon = status.icon;

                                return (
                                    <article
                                        key={`${record.documentCode}-${record.id}`}
                                        className={cn('relative pl-8', enter)}
                                        style={{
                                            animationDelay: `${Math.min(index, 8) * 40}ms`,
                                        }}
                                    >
                                        <span
                                            className={cn(
                                                'absolute top-1 left-0 flex size-[19px] items-center justify-center rounded-full border-[3px] border-background shadow-sm',
                                                status.dot,
                                            )}
                                        />

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={cn(
                                                        'text-xs font-semibold',
                                                        status.text,
                                                    )}
                                                >
                                                    {status.label}
                                                </span>

                                                <span className="text-[11px] text-muted-foreground tabular-nums">
                                                    {formatDateTime(
                                                        record.created_at,
                                                    ) ?? 'Fecha desconocida'}
                                                </span>
                                            </div>

                                            <div className="rounded-lg border bg-muted/20 p-3">
                                                <div className="flex items-start gap-2">
                                                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-semibold">
                                                            {record.name ??
                                                                'Documento adjunto'}
                                                        </p>

                                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                                            {
                                                                record.documentTitle
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                                            Subido el{' '}
                                                            {formatDateTime(
                                                                record.created_at,
                                                            ) ??
                                                                'fecha desconocida'}
                                                        </p>

                                                        {record.approval_status ===
                                                            1 && (
                                                            <p className="text-[11px] text-green-600 dark:text-green-400">
                                                                Aprobado el{' '}
                                                                {formatDateTime(
                                                                    record.approved_at ??
                                                                        record.updated_at,
                                                                ) ??
                                                                    'fecha no registrada'}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <StatusIcon
                                                        className={cn(
                                                            'size-4 shrink-0',
                                                            status.text,
                                                        )}
                                                    />
                                                </div>

                                                {record.comment && (
                                                    <div className="mt-3 flex gap-2 rounded-md border bg-background/70 p-2.5">
                                                        <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />

                                                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                                                            {record.comment}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {(hidden > 0 || showAll) &&
                            sorted.length > HISTORY_PREVIEW && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs"
                                    aria-expanded={showAll}
                                    onClick={() => setShowAll((v) => !v)}
                                >
                                    {showAll
                                        ? 'Ver menos'
                                        : `Ver ${hidden} más`}
                                </Button>
                            )}
                    </>
                )}
            </SectionCard.Body>
        </SectionCard>
    );
}

/* -------------------------------------------------------------------------- */
/* Página                                                                     */
/* -------------------------------------------------------------------------- */

export default function MyDossier({
    requirements,
    dossier,
}: {
    assignment: AssignmentRecord;
    requirements: DocumentRequirement[];
    dossier: number;
}) {
    const [selectedType, setSelectedType] = useState(0);
    const [previewEnabled, setPreviewEnabled] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const list = useMemo(() => requirements ?? [], [requirements]);
    const currentFile = list[selectedType];
    const currentStatus = tempFile ? 0 : resolveStatus(currentFile);

    const { post, processing, transform } = useForm({
        file: null as File | null,
        code: '',
        target_id: dossier,
    });

    /*
     * Combina el historial de todos los requisitos.
     * Cada registro conserva el título y código del documento de origen.
     */
    const allHistory = useMemo<DossierHistoryRecord[]>(() => {
        return list.flatMap((requirement) =>
            (requirement.history ?? []).map((record) => ({
                ...record,
                documentTitle: requirement.title,
                documentCode: requirement.code,
            })),
        );
    }, [list]);

    /* Libera la URL temporal al cambiar o salir de la página. */
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    /* Pantalla completa: Escape para cerrar y sin scroll de fondo. */
    useEffect(() => {
        if (!expanded) return;

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setExpanded(false);
            }
        };

        const previous = document.body.style.overflow;

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener('keydown', onKey);
        };
    }, [expanded]);

    const onUpload = (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            toast.error(
                `El archivo pesa ${Math.round(file.size / 1024)} KB. El máximo es ${MAX_FILE_KB} KB.`,
            );
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setTempFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const removeTempFile = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setTempFile(null);
        setPreviewUrl(null);
        setIsEditing(false);
    };

    const selectType = (index: number) => {
        if (index === selectedType || index < 0 || index >= list.length) {
            return;
        }

        removeTempFile();
        setSelectedType(index);
    };

    /* Atajos: ← y → cambian de documento (si no estás escribiendo). */
    const selectRef = useRef(selectType);
    const indexRef = useRef(selectedType);

    useEffect(() => {
        selectRef.current = selectType;
        indexRef.current = selectedType;
    });

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;

            const target = event.target as HTMLElement | null;
            const typing =
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable);

            if (typing) return;

            if (event.key === 'ArrowLeft') {
                selectRef.current(indexRef.current - 1);
            } else if (event.key === 'ArrowRight') {
                selectRef.current(indexRef.current + 1);
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const canUpload = (!currentFile?.latest || isEditing) && !tempFile;

    const hasFile = Boolean(tempFile || currentFile?.latest);

    const handleSubmit = (event?: React.FormEvent) => {
        event?.preventDefault();

        if (!tempFile || !currentFile) {
            toast.error('Selecciona un archivo antes de enviar.');
            return;
        }

        transform((data) => ({
            ...data,
            code: currentFile.code,
            file: tempFile,
        }));

        post(dossiers.document.store().url, {
            onSuccess: () => {
                removeTempFile();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0] as
                    | string
                    | undefined;

                toast.error(firstError || 'Error al procesar la solicitud', {
                    duration: 10000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documentación" />

            <PageContainer>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-1xl font-semibold tracking-tight">
                            Validación de documentos
                        </h1>
                        <p className="text-sm text-foreground/70">
                            Sube y sigue los archivos requeridos para tu expediente.
                        </p>
                    </div>

                    <DossierSummary requirements={list} />
                </div>

                <DocumentReviewLayout
                    hideAside={expanded}
                    documentClassName={
                        expanded
                            ? 'fixed inset-0 z-50 h-dvh overflow-auto bg-background p-3 md:p-6'
                            : 'relative h-full w-full overflow-hidden'
                    }
                    requirements={
                        <>
                            <RequirementsList
                                requirements={list}
                                selectedType={selectedType}
                                onSelectType={selectType}
                                previewEnabled={previewEnabled}
                                onTogglePreview={() =>
                                    setPreviewEnabled((value) => !value)
                                }
                            />

                            <HowToSubmitCard
                                hasTemplate={Boolean(currentFile?.has_template)}
                            />
                        </>
                    }
                    document={
                        <>
                            {processing && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-2">
                                        <Spinner className="animate-spin text-primary" />
                                        <span className="text-xs font-medium">
                                            Validando documento...
                                        </span>
                                    </div>
                                </div>
                            )}

                            {currentFile ? (
                                <SectionCard>
                                    <SectionCard.Header>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div
                                                key={
                                                    currentFile.code ??
                                                    selectedType
                                                }
                                                className={cn(
                                                    'flex min-w-0 items-center gap-3',
                                                    enter,
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors',
                                                        hasFile
                                                            ? 'border-primary/20 bg-primary/5'
                                                            : 'bg-muted/50',
                                                    )}
                                                >
                                                    <FileText
                                                        className={cn(
                                                            'size-4',
                                                            hasFile
                                                                ? 'text-primary'
                                                                : 'text-muted-foreground',
                                                        )}
                                                    />
                                                </div>

                                                <div className="flex min-w-0 flex-col">
                                                    <h3 className="truncate text-sm leading-none font-semibold tracking-tight">
                                                        {currentFile.title}
                                                    </h3>

                                                    {/* El estado ya lo muestra el panel lateral; aquí solo avisamos del archivo sin enviar. */}
                                                    {tempFile && (
                                                        <p className="mt-1 text-[11px] text-primary">
                                                            Archivo listo para
                                                            enviar
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center justify-between gap-1 sm:justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label="Documento anterior"
                                                    disabled={
                                                        selectedType === 0
                                                    }
                                                    onClick={() =>
                                                        selectType(
                                                            selectedType - 1,
                                                        )
                                                    }
                                                >
                                                    <ChevronLeft />
                                                </Button>

                                                <span className="text-xs text-muted-foreground tabular-nums">
                                                    {selectedType + 1}/
                                                    {list.length}
                                                </span>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label="Documento siguiente"
                                                    disabled={
                                                        selectedType >=
                                                        list.length - 1
                                                    }
                                                    onClick={() =>
                                                        selectType(
                                                            selectedType + 1,
                                                        )
                                                    }
                                                >
                                                    <ChevronRight />
                                                </Button>

                                                {hasFile && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="ml-auto h-8 px-2.5 text-xs sm:ml-1"
                                                        onClick={() =>
                                                            setExpanded(
                                                                (value) =>
                                                                    !value,
                                                            )
                                                        }
                                                    >
                                                        {expanded ? (
                                                            <Minimize2 className="size-3.5 text-muted-foreground sm:mr-2" />
                                                        ) : (
                                                            <Maximize2 className="size-3.5 text-muted-foreground sm:mr-2" />
                                                        )}

                                                        <span className="hidden sm:inline">
                                                            {expanded
                                                                ? 'Cerrar'
                                                                : 'Expandir'}
                                                        </span>
                                                        <span className="sr-only sm:hidden">
                                                            {expanded
                                                                ? 'Cerrar vista completa'
                                                                : 'Expandir vista'}
                                                        </span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </SectionCard.Header>

                                    <SectionCard.Body className="p-0">
                                        <DocumentViewer
                                            currentFile={{
                                                ...currentFile,
                                                latest: tempFile
                                                    ? {
                                                          id: 0,
                                                          approval_status: 0,
                                                          path: previewUrl,
                                                          name: tempFile.name,
                                                          size: tempFile.size,
                                                      }
                                                    : currentFile.latest,
                                            }}
                                            canUpload={canUpload}
                                            onUpload={onUpload}
                                            previewEnabled={previewEnabled}
                                        />
                                    </SectionCard.Body>
                                </SectionCard>
                            ) : (
                                <SectionCard>
                                    <SectionCard.Body className="flex min-h-64 flex-col items-center justify-center text-center">
                                        <FileText className="mb-3 size-8 text-muted-foreground/50" />
                                        <p className="text-sm font-medium">
                                            No hay documentos requeridos
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            No se encontraron requisitos para
                                            este expediente.
                                        </p>
                                    </SectionCard.Body>
                                </SectionCard>
                            )}
                        </>
                    }
                    aside={
                        <>
                            {currentFile && (
                                <SubmissionPanel
                                    status={currentStatus}
                                    currentRequirement={currentFile}
                                    tempFile={tempFile}
                                    isEditing={isEditing}
                                    onSetEditing={setIsEditing}
                                    onRemoveTemp={removeTempFile}
                                    uploading={processing}
                                    showFileInfo={{
                                        name: currentFile.latest?.name,
                                        meta: 'Documento oficial',
                                        size: currentFile.latest?.size,
                                    }}
                                    onSubmit={handleSubmit}
                                />
                            )}

                            <DocumentHistoryPanel history={allHistory} />
                        </>
                    }
                />
            </PageContainer>
        </AppLayout>
    );
}