import type { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Recorta un texto largo por el centro para conservar el inicio (nombre) y el
 * final (extensión). Devuelve el texto intacto si ya cabe en `max`.
 */
export function truncateMiddle(value: string, max: number): string {
    if (max <= 0) return '';

    if (value.length <= max) return value;

    const ellipsis = '…';
    const keep = max - ellipsis.length;

    if (keep <= 0) return ellipsis.slice(0, max);

    const head = Math.ceil(keep / 2);
    const tail = keep - head;

    return `${value.slice(0, head)}${ellipsis}${value.slice(value.length - tail)}`;
}
