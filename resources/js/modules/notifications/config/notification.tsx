import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, FileUp, AlertCircle, Bell, BriefcaseBusiness, ClipboardCheck, UserCheck, XCircle } from 'lucide-react';
import type { NotificationMeta } from '@/shared/types/session';

export type { NotificationMeta };

/** Los estados numéricos son los del flujo académico; JobBoard usa strings. */
type NotificationStatus = number | string | null;

/**
 * Escapa el texto que escriben los usuarios (comentarios, nombres de documento)
 * antes de insertarlo en el HTML de la notificación, para evitar XSS.
 */
const esc = (value: unknown): string =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

export interface NotificationConfig {
    icon: LucideIcon | ((status?: NotificationStatus) => LucideIcon);
    color: string | ((status?: NotificationStatus) => string);
    bg: string | ((status?: NotificationStatus) => string);
    render: (meta: NotificationMeta) => string;
}

export const NOTIFICATION_CONFIG: Record<string, NotificationConfig> = {
    DOSSIER_UPLOAD: {
        icon: FileUp,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        render: (meta) =>
            `Subió <strong>'${esc(meta.document)}'</strong> para ser validado.`,
    },
    DOSSIER_VALIDATION: {
        icon: (status?: NotificationStatus) =>
            status === 1 ? CheckCircle2 : AlertCircle,
        color: (status?: NotificationStatus) =>
            status === 1 ? 'text-green-500' : 'text-amber-500',
        bg: (status?: NotificationStatus) =>
            status === 1
                ? 'bg-green-500/10 dark:bg-green-500/20'
                : 'bg-amber-500/10 dark:bg-amber-500/20',
        render: (meta) => {
            if (meta.status === 1)
                return `El documento <strong>'${esc(meta.document)}'</strong> ha sido <span class="text-green-600 dark:text-green-500 font-medium">aprobado</span>.`;
            if (meta.status === 2 || meta.status === 3)
                return `Se ha marcado <strong>'${esc(meta.document)}'</strong> con una observación: <em class="text-neutral-600 dark:text-neutral-400">"${esc(meta.comment)}"</em>.`;
            return `El documento <strong>'${esc(meta.document)}'</strong> ha sido rechazado.`;
        },
    },
    PRACTICE_REVIEW: {
        icon: (status?: NotificationStatus) =>
            status === 1 ? CheckCircle2 : AlertCircle,
        color: (status?: NotificationStatus) =>
            status === 1 ? 'text-green-500' : 'text-amber-500',
        bg: (status?: NotificationStatus) =>
            status === 1
                ? 'bg-green-500/10 dark:bg-green-500/20'
                : 'bg-amber-500/10 dark:bg-amber-500/20',
        render: (meta) =>
            meta.status === 1
                ? `Tu <strong>'${esc(meta.document)}'</strong> fue <span class="text-green-600 dark:text-green-500 font-medium">aprobado</span>.`
                : `Tu <strong>'${esc(meta.document)}'</strong> fue observado: <em class="text-neutral-600 dark:text-neutral-400">"${esc(meta.comment)}"</em>.`,
    },
    PLACEMENT_REGISTER: {
        icon: FileUp,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        render: (meta) =>
            `Registró su <strong>'${esc(meta.document)}'</strong> para ser validada.`,
    },
    PLACEMENT_UPDATE: {
        icon: FileUp,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        render: (meta) =>
            `Actualizó su <strong>'${esc(meta.document)}'</strong> para ser validada.`,
    },
    PLACEMENT_DATA_VALIDATION: {
        icon: (status?: NotificationStatus) =>
            status === 1 ? CheckCircle2 : AlertCircle,
        color: (status?: NotificationStatus) =>
            status === 1 ? 'text-green-500' : 'text-amber-500',
        bg: (status?: NotificationStatus) =>
            status === 1
                ? 'bg-green-500/10 dark:bg-green-500/20'
                : 'bg-amber-500/10 dark:bg-amber-500/20',
        render: (meta) => {
            if (meta.status === 1)
                return `Los datos de formalización han sido <span class="text-green-600 dark:text-green-500 font-medium">aprobados</span>.`;
            return `Se han marcado los datos con una observación: <em class="text-neutral-600 dark:text-neutral-400">"${esc(meta.comment)}"</em>.`;
        },
    },
    PLACEMENT_DOCUMENT_VALIDATION: {
        icon: (status?: NotificationStatus) =>
            status === 1 ? CheckCircle2 : AlertCircle,
        color: (status?: NotificationStatus) =>
            status === 1 ? 'text-green-500' : 'text-amber-500',
        bg: (status?: NotificationStatus) =>
            status === 1
                ? 'bg-green-500/10 dark:bg-green-500/20'
                : 'bg-amber-500/10 dark:bg-amber-500/20',
        render: (meta) => {
            if (meta.status === 1)
                return `El documento <strong>'${esc(meta.document)}'</strong> ha sido <span class="text-green-600 dark:text-green-500 font-medium">aprobado</span>.`;
            return `Se ha marcado <strong>'${esc(meta.document)}'</strong> con una observación: <em class="text-neutral-600 dark:text-neutral-400">"${esc(meta.comment)}"</em>.`;
        },
    },
    PLACEMENT_FINALIZED: {
        icon: CheckCircle2,
        color: 'text-green-500',
        bg: 'bg-green-500/10 dark:bg-green-500/20',
        render: () =>
            `La formalización de prácticas ha sido <span class="text-green-600 dark:text-green-500 font-medium">aprobada</span>.`,
    },
    VACANCY_SUBMITTED: {
        icon: ClipboardCheck,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        render: (meta) =>
            `La vacante <strong>'${esc(meta.document)}'</strong> fue enviada para revisión.`,
    },
    VACANCY_REVIEWED: {
        icon: (status?: NotificationStatus) => {
            if (status === 'published') return CheckCircle2;
            if (status === 'rejected') return XCircle;

            return AlertCircle;
        },
        color: (status?: NotificationStatus) => {
            if (status === 'published') return 'text-green-500';
            if (status === 'rejected') return 'text-red-500';

            return 'text-amber-500';
        },
        bg: (status?: NotificationStatus) => {
            if (status === 'published')
                return 'bg-green-500/10 dark:bg-green-500/20';
            if (status === 'rejected')
                return 'bg-red-500/10 dark:bg-red-500/20';

            return 'bg-amber-500/10 dark:bg-amber-500/20';
        },
        render: (meta) => {
            if (meta.status === 'published')
                return `La vacante <strong>'${esc(meta.document)}'</strong> fue <span class="text-green-600 dark:text-green-500 font-medium">publicada</span>.`;
            if (meta.status === 'rejected')
                return `La vacante <strong>'${esc(meta.document)}'</strong> fue <span class="text-red-600 dark:text-red-500 font-medium">rechazada</span>.${meta.comment ? ` Motivo: <em class="text-neutral-600 dark:text-neutral-400">"${esc(meta.comment)}"</em>.` : ''}`;

            return `La vacante <strong>'${esc(meta.document)}'</strong> fue observada: <em class="text-neutral-600 dark:text-neutral-400">"${esc(meta.comment)}"</em>.`;
        },
    },
    VACANCY_PUBLISHED: {
        icon: BriefcaseBusiness,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        render: (meta) =>
            `Nueva vacante publicada para tu escuela: <strong>'${esc(meta.document)}'</strong>.`,
    },
    CANDIDATE_PROPOSED: {
        icon: UserCheck,
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        render: (meta) =>
            `Se propuso un candidato para la vacante <strong>'${esc(meta.document)}'</strong>.${meta.comment ? ` Nota: <em class="text-neutral-600 dark:text-neutral-400">"${esc(meta.comment)}"</em>.` : ''}`,
    },
};

/**
 * Helper para resolver propiedades que pueden ser estáticas o dinámicas.
 * Evita el conflicto de tipos de LucideIcon (que es una función)
 */
export const resolveConfig = (type: string, status?: NotificationStatus) => {
    const config = NOTIFICATION_CONFIG[type] || {
        icon: Bell,
        color: 'text-neutral-500',
        bg: 'bg-neutral-500/10',
        render: () => 'Tienes una nueva notificación',
    };

    // Si es un icono de Lucide, no lo "llamamos" como función, simplemente lo devolvemos.
    // Solo llamamos si es una función que nosotros definimos (que NO tiene la propiedad $$typeof de React)
    const icon = config.icon;
    const Icon =
        '$$typeof' in icon
            ? (icon as LucideIcon)
            : (icon as (status?: NotificationStatus) => LucideIcon)(status);

    return {
        Icon,
        color:
            typeof config.color === 'function'
                ? config.color(status)
                : config.color,
        bg: typeof config.bg === 'function' ? config.bg(status) : config.bg,
        render: config.render,
    };
};
