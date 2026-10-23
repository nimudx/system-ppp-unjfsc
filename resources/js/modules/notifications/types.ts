// Los tipos de notificación viajan en los datos de sesión, por eso se
// definen en shared y aquí solo se reexportan.
export type {
    NotificationAction,
    NotificationMeta,
    NotificationParams,
    NotificationSummary,
} from '@/shared/types/session';
