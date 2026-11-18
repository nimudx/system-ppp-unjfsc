import type { ReactNode } from 'react';

interface SubmissionPageHeaderProps {
    title: string;
    description: string;
    /** Resumen o indicador alineado a la derecha en escritorio. */
    children?: ReactNode;
}

/**
 * Encabezado común de las pantallas de presentación de documentos.
 */
export default function SubmissionPageHeader({
    title,
    description,
    children,
}: SubmissionPageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {children && (
                <div className="w-full shrink-0 md:w-64 xl:w-72">
                    {children}
                </div>
            )}
        </div>
    );
}
