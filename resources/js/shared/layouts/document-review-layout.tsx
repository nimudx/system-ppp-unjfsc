import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface DocumentReviewLayoutProps {
    /** Columna izquierda: requisitos del expediente. */
    requirements: ReactNode;
    /** Columna central: visor o formulario del documento activo. */
    document: ReactNode;
    /** Columna derecha: detalle de envío e historial. */
    aside: ReactNode;
    /** Oculta la columna derecha, por ejemplo en la vista expandida. */
    hideAside?: boolean;
    /** Clases adicionales para la columna central. */
    documentClassName?: string;
}

/**
 * Layout de revisión documental: requisitos, documento activo y detalle.
 * En pantallas pequeñas las columnas se apilan con el documento primero.
 */
export default function DocumentReviewLayout({
    requirements,
    document,
    aside,
    hideAside = false,
    documentClassName,
}: DocumentReviewLayoutProps) {
    return (
        <div className="flex flex-col items-start gap-6 lg:flex-row">
            <div className="order-3 flex w-full shrink-0 flex-col gap-6 lg:order-none lg:w-64 xl:w-72">
                {requirements}
            </div>

            <div
                className={cn(
                    'order-1 min-w-0 flex-1 lg:order-none',
                    documentClassName,
                )}
            >
                {document}
            </div>

            {!hideAside && (
                <aside className="order-2 flex w-full min-w-0 shrink-0 flex-col gap-6 lg:order-none lg:w-64 xl:w-72">
                    {aside}
                </aside>
            )}
        </div>
    );
}
