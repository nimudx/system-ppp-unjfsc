import type { StudentRow } from './types';

const numberFormat = new Intl.NumberFormat('es-PE');

export const formatNumber = (value: number) => numberFormat.format(value);

export function formatBytes(bytes: number | null): string {
    if (bytes === null) return '—';
    if (bytes < 1024) return `${bytes} B`;

    const units = ['KB', 'MB', 'GB', 'TB'];
    let value = bytes / 1024;
    let unit = 0;

    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }

    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

export function timeAgo(iso: string | null): string {
    if (!iso) return '';

    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;

    const hours = Math.round(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;

    const days = Math.round(hours / 24);
    return days === 1 ? 'Ayer' : `Hace ${days} días`;
}

export function formatDate(value: string | null): string {
    if (!value) return '';

    return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString(
        'es-PE',
        { day: '2-digit', month: 'short', year: 'numeric' },
    );
}

export const toneClasses: Record<StudentRow['status']['tone'], string> = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    muted: 'bg-muted text-muted-foreground',
};
