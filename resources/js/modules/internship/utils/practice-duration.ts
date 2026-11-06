/**
 * Reglas legales de duración de las prácticas.
 *
 * Mínimo 320 horas y un máximo de 6 horas diarias. La validación cuenta
 * días hábiles (lunes a viernes), igual que el backend.
 */
export const MINIMUM_PRACTICE_HOURS = 320;
export const MAX_DAILY_HOURS = 6;
export const MINIMUM_BUSINESS_DAYS = Math.ceil(
    MINIMUM_PRACTICE_HOURS / MAX_DAILY_HOURS,
);

function parseDate(value?: string | null): Date | null {
    const iso = value?.slice(0, 10);

    if (!iso) return null;

    const [year, month, day] = iso.split('-').map(Number);

    if (!year || !month || !day) return null;

    return new Date(Date.UTC(year, month - 1, day));
}

function toIso(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function countBusinessDays(
    start?: string | null,
    end?: string | null,
): number {
    const from = parseDate(start);
    const to = parseDate(end);

    if (!from || !to || to.getTime() < from.getTime()) return 0;

    let days = 0;
    const cursor = new Date(from);

    while (cursor.getTime() <= to.getTime()) {
        const weekday = cursor.getUTCDay();

        if (weekday !== 0 && weekday !== 6) days++;

        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return days;
}

export function estimatedPracticeHours(businessDays: number): number {
    return businessDays * MAX_DAILY_HOURS;
}

/** Fecha de término mínima para cubrir las 320 horas. */
export function minimumPracticeEndDate(start?: string | null): string | null {
    const from = parseDate(start);

    if (!from) return null;

    const cursor = new Date(from);
    let counted = 0;

    while (counted < MINIMUM_BUSINESS_DAYS) {
        const weekday = cursor.getUTCDay();

        if (weekday !== 0 && weekday !== 6) counted++;
        if (counted < MINIMUM_BUSINESS_DAYS) {
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
    }

    return toIso(cursor);
}
