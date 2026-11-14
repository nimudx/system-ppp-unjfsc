import type { SelectOption, VacancyCloseReason } from './types';

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

export function formatDate(value?: string | null): string {
    if (!value) return 'Sin fecha';

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? 'Sin fecha' : dateFormatter.format(date);
}

/** Convierte un ISO a `YYYY-MM-DD` para los inputs date. */
export function toDateInput(value?: string | null): string {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    return date.toISOString().slice(0, 10);
}

export const CLOSE_REASONS: SelectOption[] = [
    { value: 'filled', label: 'Cubierta' },
    { value: 'expired', label: 'Vencida' },
    { value: 'withdrawn', label: 'Retirada' },
];

export function closeReasonLabel(
    reason: VacancyCloseReason | null,
): string | null {
    return CLOSE_REASONS.find((option) => option.value === reason)?.label ?? null;
}

/** Agrupa las escuelas por facultad para el selector del formulario. */
export function groupSchoolsByFaculty<
    T extends { faculty: string | null },
>(schools: T[]): Array<{ faculty: string; schools: T[] }> {
    const groups = new Map<string, T[]>();

    for (const school of schools) {
        const faculty = school.faculty ?? 'Sin facultad';
        groups.set(faculty, [...(groups.get(faculty) ?? []), school]);
    }

    return [...groups.entries()]
        .map(([faculty, items]) => ({ faculty, schools: items }))
        .sort((a, b) => a.faculty.localeCompare(b.faculty));
}
