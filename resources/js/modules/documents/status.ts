import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Info,
    type LucideIcon,
} from 'lucide-react';
import { DOCUMENT_STATUS } from '@/shared/config/status';
import type { DocumentRequirement } from './types';

export { DOCUMENT_STATUS };

export interface DocumentStatusMeta {
    label: string;
    icon: LucideIcon;
    /** Color de un punto o barra de progreso. */
    dot: string;
    /** Color de texto. */
    text: string;
    /** Clases para un badge con borde. */
    badge: string;
    /** Clases para una superficie (icono o chip de fondo). */
    surface: string;
}

export const DOCUMENT_STATUS_META: Record<number, DocumentStatusMeta> = {
    [DOCUMENT_STATUS.NOT_STARTED]: {
        label: 'Sin iniciar',
        icon: Info,
        dot: 'bg-muted-foreground/40',
        text: 'text-muted-foreground',
        badge: 'bg-muted/60 text-muted-foreground border-transparent',
        surface: 'bg-muted text-muted-foreground',
    },
    [DOCUMENT_STATUS.APPROVED]: {
        label: 'Aprobado',
        icon: CheckCircle2,
        dot: 'bg-green-500',
        text: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-500/10 text-green-700 border-green-200 dark:text-green-400 dark:border-green-500/20',
        surface: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
    },
    [DOCUMENT_STATUS.PENDING]: {
        label: 'Pendiente',
        icon: Clock,
        dot: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-500/20',
        surface: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    },
    [DOCUMENT_STATUS.OBSERVED]: {
        label: 'Observado',
        icon: AlertCircle,
        dot: 'bg-destructive',
        text: 'text-destructive',
        badge: 'bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-500/20',
        surface: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
    },
};

/**
 * Normaliza estados fuera de rango al último estado conocido para no romper
 * los mapas de estilos.
 */
export function getDocumentStatusMeta(
    status?: number | null,
): DocumentStatusMeta {
    const normalized =
        status != null && status > DOCUMENT_STATUS.OBSERVED
            ? DOCUMENT_STATUS.OBSERVED
            : (status ?? DOCUMENT_STATUS.NOT_STARTED);

    return (
        DOCUMENT_STATUS_META[normalized] ??
        DOCUMENT_STATUS_META[DOCUMENT_STATUS.NOT_STARTED]
    );
}

/**
 * Estado real de un requisito: manda el último archivo subido
 * (es lo que el revisor aprobó/observó) y, si no hay, el del requisito.
 */
export function resolveDocumentStatus(
    requirement?: DocumentRequirement | null,
): number {
    if (!requirement) return DOCUMENT_STATUS.NOT_STARTED;

    return (
        requirement.latest?.approval_status ??
        requirement.status ??
        DOCUMENT_STATUS.NOT_STARTED
    );
}

/**
 * Configuración compacta para tablas que solo necesitan etiqueta y clases de
 * badge.
 */
export const DOCUMENT_STATUS_BADGE: Record<
    number,
    { label: string; className: string }
> = Object.fromEntries(
    Object.entries(DOCUMENT_STATUS_META).map(([status, meta]) => [
        Number(status),
        { label: meta.label, className: meta.badge },
    ]),
);
