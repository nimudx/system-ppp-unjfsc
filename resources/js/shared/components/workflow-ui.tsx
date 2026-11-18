import type { ReactNode } from 'react';

/* -------------------------------------------------------------------------- */
/* Primitivas compartidas por los flujos de empresa y prácticas               */
/* -------------------------------------------------------------------------- */

export function Field({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="grid gap-2 text-sm font-medium">
            {label}
            {children}
        </label>
    );
}

/**
 * Lee `errors` por duck-typing: sirve tanto para `WorkflowError` como para
 * cualquier otro error que exponga un mapa de errores de validación.
 */
function errorDetails(error: unknown): Array<[string, string[]]> {
    if (!error || typeof error !== 'object' || !('errors' in error)) return [];

    const errors = (error as { errors?: unknown }).errors;

    if (!errors || typeof errors !== 'object') return [];

    return Object.entries(errors as Record<string, string[]>);
}

export function WorkflowErrors({ error }: { error: unknown }) {
    if (!error) return null;
    const message = error instanceof Error ? error.message : String(error);
    const details = errorDetails(error);
    return (
        <div
            role="alert"
            className="space-y-2 rounded-lg border border-destructive p-3 text-sm text-destructive"
        >
            <p>{message}</p>
            {details.length > 1 && (
                <ul className="list-disc pl-4">
                    {details.map(([key, values]) => (
                        <li key={key}>{values.join(' ')}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function DataItem({
    label,
    value,
    href,
}: {
    label: string;
    value?: string | null;
    href?: string;
}) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            {value && href ? (
                <a
                    href={href}
                    className="text-sm font-medium break-words text-primary hover:underline"
                >
                    {value}
                </a>
            ) : (
                <p className="text-sm font-medium break-words">
                    {value || '—'}
                </p>
            )}
        </div>
    );
}
