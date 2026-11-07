import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface PageContainerProps {
    children: ReactNode;
    /** Mantiene la altura mínima de pantalla en vistas de trabajo. */
    fullHeight?: boolean;
    className?: string;
}

/**
 * Contenedor estándar del contenido de una página.
 */
export default function PageContainer({
    children,
    fullHeight = false,
    className,
}: PageContainerProps) {
    return (
        <div
            className={cn(
                'flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8',
                fullHeight && 'min-h-screen',
                className,
            )}
        >
            {children}
        </div>
    );
}
