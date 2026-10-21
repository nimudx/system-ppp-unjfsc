import type { NotificationMeta } from './config/notification';
export type NotificationParams = Record<
    string,
    string | number | boolean | null | undefined
>;
export interface NotificationAction {
    route?: string;
    params?: NotificationParams;
}
export interface NotificationSummary {
    id: number;
    notification_id: number;
    type: string;
    actor: string;
    created_at: string;
    payload: { action?: NotificationAction; meta?: NotificationMeta };
}
