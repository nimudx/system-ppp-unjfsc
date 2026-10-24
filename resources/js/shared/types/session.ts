// Datos que Laravel comparte en todas las páginas (HandleInertiaRequests):
// el semestre de la sesión académica y el resumen de notificaciones.
// Viven en shared porque los usan el layout y los tipos de sesión; los
// módulos academic y notifications los reexportan.

export interface Semester {
    id: number;
    code: string;
    cycle: string;
    status: number;
}

export type NotificationParams = Record<
    string,
    string | number | boolean | null | undefined
>;

export interface NotificationAction {
    route?: string;
    params?: NotificationParams;
}

export interface NotificationMeta {
    title?: string;
    role?: string;
    document?: string;
    status?: number | null;
    comment?: string | null;
    entity?: string | null;
}

export interface NotificationSummary {
    id: number;
    notification_id: number;
    type: string;
    actor: string;
    created_at: string;
    payload: { action?: NotificationAction; meta?: NotificationMeta };
}
