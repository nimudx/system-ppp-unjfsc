import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    CalendarClock,
    CheckCircle2,
    FileText,
    History as HistoryIcon,
    MessageSquare,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { DocumentRequirement } from '@/modules/documents/types';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import { cn, truncateMiddle } from '@/shared/lib/utils';

import {
    DOCUMENT_STATUS,
    getDocumentStatusMeta,
    resolveDocumentStatus,
} from '../status';

export const enter =
    'animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both motion-reduce:animate-none';

export const MAX_FILE_SIZE = 350 * 1024; // 350 KB
export const HISTORY_PREVIEW = 3;

export interface DossierHistoryRecord {
    id: number;
    approval_status: number;
    comment?: string | null;
    name?: string;
    created_at?: string;
    approved_at?: string | null;
    updated_at?: string | null;
    documentTitle: string;
    documentCode: string;
    /** Evento del historial: subida del archivo o dictamen del revisor. */
    event?: 'upload' | 'review';
    /** Identificador único del evento para usarlo como key. */
    event_id?: string;
    /** Nombre del docente que emitió el dictamen. */
    reviewed_by?: string | null;
}

export function formatDateTime(value?: string | null) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return format(date, 'd MMM yyyy, HH:mm', { locale: es });
}

/* -------------------------------------------------------------------------- */
/* Estado de un requisito                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Estado real de un requisito: manda el último archivo subido
 * (es lo que el revisor aprobó/observó) y, si no hay, el del requisito.
 */
export const resolveStatus = resolveDocumentStatus;

/**
 * Variante histórica del expediente: cualquier estado distinto de aprobado u
 * observado se presenta como "Pendiente".
 */
export function getStatusMeta(status: number) {
    const meta = getDocumentStatusMeta(
        status === DOCUMENT_STATUS.APPROVED ||
            status === DOCUMENT_STATUS.OBSERVED
            ? status
            : DOCUMENT_STATUS.PENDING,
    );

    return {
        ...meta,
        icon:
            status === DOCUMENT_STATUS.APPROVED
                ? CheckCircle2
                : status === DOCUMENT_STATUS.OBSERVED
                  ? MessageSquare
                  : CalendarClock,
    };
}

/* -------------------------------------------------------------------------- */
/* Utilidades de animación                                                    */
/* -------------------------------------------------------------------------- */

export function useCountUp(target: number, duration = 700) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            const reducedFrame = requestAnimationFrame(() => setValue(target));

            return () => cancelAnimationFrame(reducedFrame);
        }

        let frame = 0;
        const start = performance.now();

        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);

            setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return value;
}

export function useReady() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setReady(true));

        return () => cancelAnimationFrame(frame);
    }, []);

    return ready;
}

/* -------------------------------------------------------------------------- */
/* Resumen de avance: un segmento por documento, clicable                     */
/* -------------------------------------------------------------------------- */

export function DossierProgress({
    requirements,
    selectedType,
}: {
    requirements: DocumentRequirement[];
    selectedType: number;
}) {
    const ready = useReady();
    const total = requirements.length;
    const approved = requirements.filter(
        (item) => resolveStatus(item) === 1,
    ).length;
    const observed = requirements.filter(
        (item) => resolveStatus(item) === 3,
    ).length;
    const shown = useCountUp(approved);

    return (
        <div className="flex w-full flex-col gap-2 md:w-72">
            <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium tabular-nums">
                    {shown} / {total} aprobados
                </span>

                {observed > 0 && (
                    <span className="text-xs font-medium text-destructive tabular-nums">
                        {observed} por corregir
                    </span>
                )}
            </div>

            <div
                className="flex items-center gap-1"
                role="img"
                aria-label={`${approved} de ${total} documentos aprobados`}
            >
                {requirements.map((item, index) => {
                    const meta = getStatusMeta(resolveStatus(item));
                    const hasUpload = Boolean(item.latest);
                    const active = index === selectedType;

                    return (
                        <div
                            key={item.code}
                            title={`${item.title}: ${hasUpload ? meta.label : 'Sin subir'}`}
                            className={cn(
                                'h-1.5 flex-1 origin-left rounded-full transition-all duration-500 ease-out motion-reduce:transition-none',
                                hasUpload ? meta.dot : 'bg-muted',
                                active && 'h-2.5',
                                ready ? 'scale-x-100' : 'scale-x-0',
                            )}
                            style={{ transitionDelay: `${index * 50}ms` }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Historial general de documentos (todo en una sola línea de tiempo)         */
/* -------------------------------------------------------------------------- */

export function DocumentHistoryPanel({
    history,
    elevated = false,
    compact = false,
}: {
    history: DossierHistoryRecord[];
    /** Sombra mínima de la tarjeta; opt-in para no alterar otras pantallas. */
    elevated?: boolean;
    /** Una entrada por evento, sin fechas ni estado duplicados; opt-in. */
    compact?: boolean;
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
        <SectionCard className="min-w-0" elevated={elevated}>
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
                            <p
                                className="mt-1 truncate text-xs text-muted-foreground"
                                title="Movimientos de tus documentos"
                            >
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
                        <div
                            className={cn(
                                'relative space-y-4 before:absolute before:inset-y-2 before:left-[9px] before:w-px before:bg-border',
                                showAll &&
                                    'max-h-96 overflow-y-auto overscroll-contain pr-1',
                            )}
                        >
                            {visible.map((record, index) => {
                                const status = getStatusMeta(
                                    record.approval_status,
                                );
                                const StatusIcon = status.icon;

                                return (
                                    <article
                                        key={
                                            record.event_id ??
                                            `${record.documentCode}-${record.id}`
                                        }
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
                                            {compact ? (
                                                <div className="flex items-start gap-2">
                                                    <StatusIcon
                                                        className={cn(
                                                            'mt-0.5 size-4 shrink-0',
                                                            status.text,
                                                        )}
                                                    />

                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className="truncate text-xs font-semibold"
                                                            title={
                                                                record.name ??
                                                                'Documento adjunto'
                                                            }
                                                        >
                                                            {truncateMiddle(
                                                                record.name ??
                                                                    'Documento adjunto',
                                                                30,
                                                            )}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {record.event ===
                                                            'review' ? (
                                                                <>
                                                                    <span
                                                                        className={cn(
                                                                            'font-medium',
                                                                            status.text,
                                                                        )}
                                                                    >
                                                                        {
                                                                            status.label
                                                                        }
                                                                    </span>{' '}
                                                                    ·{' '}
                                                                    {formatDateTime(
                                                                        record.created_at,
                                                                    ) ??
                                                                        'fecha desconocida'}
                                                                    {record.reviewed_by
                                                                        ? ` · ${record.reviewed_by}`
                                                                        : ''}
                                                                </>
                                                            ) : record.event ===
                                                              'upload' ? (
                                                                <>
                                                                    Subido{' '}
                                                                    {formatDateTime(
                                                                        record.created_at,
                                                                    ) ??
                                                                        'fecha desconocida'}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Subido{' '}
                                                                    {formatDateTime(
                                                                        record.created_at,
                                                                    ) ??
                                                                        'fecha desconocida'}{' '}
                                                                    <span
                                                                        aria-hidden
                                                                    >
                                                                        →
                                                                    </span>{' '}
                                                                    <span
                                                                        className={cn(
                                                                            'font-medium',
                                                                            status.text,
                                                                        )}
                                                                    >
                                                                        {
                                                                            status.label
                                                                        }
                                                                    </span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span
                                                            className={cn(
                                                                'text-xs font-semibold',
                                                                status.text,
                                                            )}
                                                        >
                                                            {status.label}
                                                        </span>

                                                        <span className="text-xs text-muted-foreground tabular-nums">
                                                            {formatDateTime(
                                                                record.created_at,
                                                            ) ??
                                                                'Fecha desconocida'}
                                                        </span>
                                                    </div>

                                                    <div className="rounded-lg border bg-muted/20 p-3">
                                                        <div className="flex items-start gap-2">
                                                            <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                            <div className="min-w-0 flex-1">
                                                                <p
                                                                    className="truncate text-xs font-semibold"
                                                                    title={
                                                                        record.name ??
                                                                        'Documento adjunto'
                                                                    }
                                                                >
                                                                    {truncateMiddle(
                                                                        record.name ??
                                                                            'Documento adjunto',
                                                                        30,
                                                                    )}
                                                                </p>

                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    {
                                                                        record.documentTitle
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    {record.event ===
                                                                    'review' ? (
                                                                        <>
                                                                            Revisado
                                                                            el{' '}
                                                                            {formatDateTime(
                                                                                record.created_at,
                                                                            ) ??
                                                                                'fecha desconocida'}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            Subido
                                                                            el{' '}
                                                                            {formatDateTime(
                                                                                record.created_at,
                                                                            ) ??
                                                                                'fecha desconocida'}
                                                                        </>
                                                                    )}
                                                                </p>

                                                                {record.event ===
                                                                    'review' &&
                                                                    record.reviewed_by && (
                                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                                            por{' '}
                                                                            {
                                                                                record.reviewed_by
                                                                            }
                                                                        </p>
                                                                    )}

                                                                {!record.event &&
                                                                    record.approval_status ===
                                                                        1 && (
                                                                        <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">
                                                                            Aprobado
                                                                            el{' '}
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
                                                    </div>
                                                </>
                                            )}

                                            {record.comment && (
                                                <div className="flex gap-2 rounded-md border bg-background/70 p-2.5">
                                                    <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />

                                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                                        {record.comment}
                                                    </p>
                                                </div>
                                            )}
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

/**
 * Fecha de aprobación del archivo vigente, tomada de su historial.
 * Devuelve `undefined` si el archivo no está aprobado.
 */
export function findApprovedAt(
    history: DossierHistoryRecord[],
    requirement?: DocumentRequirement | null,
) {
    const latest = requirement?.latest;

    if (!latest || latest.approval_status !== DOCUMENT_STATUS.APPROVED) {
        return undefined;
    }

    const record = history.find(
        (item) =>
            item.id === latest.id && item.documentCode === requirement?.code,
    );

    return record?.approved_at ?? latest.approved_at ?? null;
}

/** Une el historial de todos los requisitos, con su título y código de origen. */
export function buildDossierHistory(
    requirements: DocumentRequirement[],
): DossierHistoryRecord[] {
    return requirements.flatMap((requirement) =>
        (requirement.history ?? []).map((record) => ({
            ...record,
            documentTitle: requirement.title,
            documentCode: requirement.code,
        })),
    );
}
