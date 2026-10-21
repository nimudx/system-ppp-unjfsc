import { CheckCircle2, FileUp, AlertCircle, Bell, LucideIcon } from "lucide-react";

export interface NotificationMeta {
    title?: string;
    role?: string;
    document?: string;
    status?: number | null;
    comment?: string | null;
    entity?: string | null;
}

export interface NotificationConfig {
    icon: LucideIcon | ((status?: number | null) => LucideIcon);
    color: string | ((status?: number | null) => string);
    bg: string | ((status?: number | null) => string);
    render: (meta: NotificationMeta) => string;
}

export const NOTIFICATION_CONFIG: Record<string, NotificationConfig> = {
    DOSSIER_UPLOAD: {
        icon: FileUp,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        render: (meta) => `Subió <strong>'${meta.document}'</strong> para ser validado.`
    },
    DOSSIER_VALIDATION: {
        icon: (status?: number | null) => status === 1 ? CheckCircle2 : AlertCircle,
        color: (status?: number | null) => status === 1 ? 'text-green-500' : 'text-amber-500',
        bg: (status?: number | null) => status === 1 ? 'bg-green-500/10 dark:bg-green-500/20' : 'bg-amber-500/10 dark:bg-amber-500/20',
        render: (meta) => {
            if (meta.status === 1) return `El documento <strong>'${meta.document}'</strong> ha sido <span class="text-green-600 dark:text-green-500 font-medium">aprobado</span>.`;
            if (meta.status === 2 || meta.status === 3) return `Se ha marcado <strong>'${meta.document}'</strong> con una observación: <em class="text-neutral-600 dark:text-neutral-400">"${meta.comment}"</em>.`;
            return `El documento <strong>'${meta.document}'</strong> ha sido rechazado.`;
        }
    },
    PLACEMENT_REGISTER: {
        icon: FileUp,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        render: (meta) => `Registró su <strong>'${meta.document}'</strong> para ser validada.`
    },
    PLACEMENT_UPDATE: {
        icon: FileUp,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        render: (meta) => `Actualizó su <strong>'${meta.document}'</strong> para ser validada.`
    },
    PLACEMENT_DATA_VALIDATION: {
        icon: (status?: number | null) => status === 1 ? CheckCircle2 : AlertCircle,
        color: (status?: number | null) => status === 1 ? 'text-green-500' : 'text-amber-500',
        bg: (status?: number | null) => status === 1 ? 'bg-green-500/10 dark:bg-green-500/20' : 'bg-amber-500/10 dark:bg-amber-500/20',
        render: (meta) => {
            if (meta.status === 1) return `Los datos de formalización han sido <span class="text-green-600 dark:text-green-500 font-medium">aprobados</span>.`;
            return `Se han marcado los datos con una observación: <em class="text-neutral-600 dark:text-neutral-400">"${meta.comment}"</em>.`;
        }
    },
    PLACEMENT_DOCUMENT_VALIDATION: {
        icon: (status?: number | null) => status === 1 ? CheckCircle2 : AlertCircle,
        color: (status?: number | null) => status === 1 ? 'text-green-500' : 'text-amber-500',
        bg: (status?: number | null) => status === 1 ? 'bg-green-500/10 dark:bg-green-500/20' : 'bg-amber-500/10 dark:bg-amber-500/20',
        render: (meta) => {
            if (meta.status === 1) return `El documento <strong>'${meta.document}'</strong> ha sido <span class="text-green-600 dark:text-green-500 font-medium">aprobado</span>.`;
            return `Se ha marcado <strong>'${meta.document}'</strong> con una observación: <em class="text-neutral-600 dark:text-neutral-400">"${meta.comment}"</em>.`;
        }
    },
    PLACEMENT_FINALIZED: {
        icon: CheckCircle2,
        color: 'text-green-500',
        bg: 'bg-green-500/10 dark:bg-green-500/20',
        render: () => `La formalización de prácticas ha sido <span class="text-green-600 dark:text-green-500 font-medium">aprobada</span>.`
    }
};

/**
 * Helper para resolver propiedades que pueden ser estáticas o dinámicas.
 * Evita el conflicto de tipos de LucideIcon (que es una función)
 */
export const resolveConfig = (type: string, status?: number | null) => {
    const config = NOTIFICATION_CONFIG[type] || {
        icon: Bell,
        color: 'text-neutral-500',
        bg: 'bg-neutral-500/10',
        render: () => 'Tienes una nueva notificación'
    };

    // Si es un icono de Lucide, no lo "llamamos" como función, simplemente lo devolvemos.
    // Solo llamamos si es una función que nosotros definimos (que NO tiene la propiedad $$typeof de React)
    const resolve = (val: any) => {
        if (typeof val === 'function' && !val.$$typeof) {
            return val(status);
        }
        return val;
    };

    return {
        Icon: resolve(config.icon) as LucideIcon,
        color: resolve(config.color) as string,
        bg: resolve(config.bg) as string,
        render: config.render
    };
};