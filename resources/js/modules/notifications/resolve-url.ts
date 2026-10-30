import academic from '@/routes/academic';
import type { NotificationParams } from './types';

export function resolveWayfinderUrl(
    routeName: string | undefined,
    params: NotificationParams = {},
): string | null {
    if (routeName === 'dashboard') return '/dashboard';
    if (!routeName) return null;
    if (routeName === 'company-validation.requests.show') {
        const id = Number(params.companyRequest);
        return Number.isSafeInteger(id) && id > 0
            ? `/solicitudes-empresa/${id}`
            : null;
    }
    let current: unknown = { academic };
    for (const part of routeName.split('.')) {
        if (
            (typeof current !== 'object' && typeof current !== 'function') ||
            current === null
        )
            return null;
        current = (current as Record<string, unknown>)[part];
    }
    if (
        (typeof current !== 'object' && typeof current !== 'function') ||
        current === null
    )
        return null;
    const url = (current as { url?: unknown }).url;
    if (typeof url !== 'function') return null;
    return (url as (options: { query: NotificationParams }) => string)({
        query: params,
    });
}
