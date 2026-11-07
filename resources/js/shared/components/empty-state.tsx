import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface EmptyStateProps {
    title: ReactNode;
    /** Texto de apoyo que explica cómo continuar. */
    description?: ReactNode;
    icon?: LucideIcon;
    className?: string;
    children?: ReactNode;
}

/**
 * Estado vacío reutilizable para tablas, listas y paneles sin contenido.
 */
export default function EmptyState({
    title,
    description,
    icon: Icon,
    className,
    children,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-1.5 text-center text-muted-foreground',
                className,
            )}
        >
            {Icon && <Icon className="size-8 opacity-30" aria-hidden />}
            <p className="text-sm font-medium">{title}</p>
            {description && <p className="text-xs opacity-80">{description}</p>}
            {children}
        </div>
    );
}
