/** Formatea una fecha ISO (YYYY-MM-DD) para mostrarla en la vista de lectura. */
export function formatPracticeDate(value?: string | null): string {
    const iso = value?.slice(0, 10);
    if (!iso) return '—';
    const [year, month, day] = iso.split('-').map(Number);
    if (!year || !month || !day) return iso;

    return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}
