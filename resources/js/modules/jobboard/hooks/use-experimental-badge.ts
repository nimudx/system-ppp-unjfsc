import { usePage } from '@inertiajs/react';

export type ExperimentalBadgeState = {
    visible: boolean;
    daysLeft: number | null;
    until: string | null;
};

/**
 * Estado de la etiqueta "Nuevo · Experimental" de la bolsa laboral.
 *
 * Se apaga sola cuando vence `jobboard.experimentalUntil`, que el backend
 * calcula a partir de la fecha de lanzamiento y los días configurados.
 */
export function useExperimentalBadge(): ExperimentalBadgeState {
    const until = usePage().props.jobboard?.experimentalUntil ?? null;

    if (!until) {
        return { visible: false, daysLeft: null, until };
    }

    const expiry = new Date(`${until}T23:59:59`);

    if (Number.isNaN(expiry.getTime())) {
        return { visible: false, daysLeft: null, until };
    }

    const remaining = expiry.getTime() - new Date().getTime();

    if (remaining < 0) {
        return { visible: false, daysLeft: null, until };
    }

    return {
        visible: true,
        daysLeft: Math.max(1, Math.ceil(remaining / 86_400_000)),
        until,
    };
}
