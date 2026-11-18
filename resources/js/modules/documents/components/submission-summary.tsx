import { Check } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import { DOCUMENT_STATUS } from '../status';
import { useReady } from './dossier-shared';

export interface SubmissionSummaryItem {
    /** Estado efectivo del documento (0 sin iniciar, 1 aprobado, 2 pendiente, 3 observado). */
    status: number;
    /** El documento tiene un archivo subido. */
    hasFile: boolean;
}

interface SubmissionSummaryProps {
    items: SubmissionSummaryItem[];
    /** `banner` destaca el expediente completo; `plain` solo muestra el anillo. */
    variant?: 'banner' | 'plain';
    completeTitle?: string;
    completeDetail?: string;
    /** Texto de espera cuando todo está entregado pero aún en revisión. */
    reviewDetail?: string;
}

const RING_RADIUS = 18;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/**
 * Resumen del expediente: anillo de avance + una frase que indica qué sigue.
 * Lo comparten dossier, formalización, anexos y revisión de prácticas.
 */
export default function SubmissionSummary({
    items,
    variant = 'plain',
    completeTitle = 'Expediente completo',
    completeDetail = 'Todos tus documentos fueron aprobados.',
    reviewDetail = 'Espera la respuesta del revisor.',
}: SubmissionSummaryProps) {
    const ready = useReady();
    const total = items.length;

    if (total === 0) {
        return null;
    }

    const approved = items.filter(
        (item) => item.hasFile && item.status === DOCUMENT_STATUS.APPROVED,
    ).length;
    const observed = items.filter(
        (item) => item.hasFile && item.status === DOCUMENT_STATUS.OBSERVED,
    ).length;
    const missing = items.filter((item) => !item.hasFile).length;
    const inReview = total - approved - observed - missing;
    const complete = approved === total;

    let headline: string;
    let detail: string | undefined;

    if (complete) {
        headline = completeTitle;
        detail = completeDetail;
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
        detail = reviewDetail;
    }

    const tone = complete
        ? 'stroke-green-500'
        : observed > 0
          ? 'stroke-destructive'
          : 'stroke-primary';

    const offset = ready ? RING_LENGTH * (1 - approved / total) : RING_LENGTH;

    return (
        <div
            className={cn(
                'flex flex-col gap-2',
                variant === 'banner' &&
                    complete &&
                    'w-full rounded-xl border border-green-500/25 bg-green-500/5 p-3',
            )}
            role="status"
            aria-label={`${approved} de ${total} documentos aprobados. ${headline}`}
        >
            <div className="flex items-center gap-3">
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

                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums">
                        {complete ? (
                            <Check className="size-4 text-green-500" />
                        ) : (
                            `${approved}/${total}`
                        )}
                    </span>
                </div>

                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-sm leading-tight font-medium">
                            {headline}
                        </p>

                        {detail && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {detail}
                            </p>
                        )}
                    </div>

                    {variant === 'banner' && complete && (
                        <span className="shrink-0 text-xs font-semibold text-green-700 tabular-nums dark:text-green-400">
                            {approved}/{total}
                        </span>
                    )}
                </div>
            </div>

            {variant === 'banner' && complete && (
                <div
                    className="h-1.5 overflow-hidden rounded-full bg-green-500/15"
                    aria-hidden
                >
                    <div className="h-full w-full rounded-full bg-green-500" />
                </div>
            )}
        </div>
    );
}
