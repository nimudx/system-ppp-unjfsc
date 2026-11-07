import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

interface StatCardProps {
    title: string;
    value: ReactNode;
    /** Texto secundario que contextualiza el valor. */
    description?: ReactNode;
    icon?: LucideIcon;
    /** Permite resaltar el valor según su estado. */
    valueClassName?: string;
    descriptionClassName?: string;
    className?: string;
}

/**
 * Tarjeta de indicador usada en los paneles de resumen.
 */
export default function StatCard({
    title,
    value,
    description,
    icon: Icon,
    valueClassName,
    descriptionClassName,
    className,
}: StatCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className={cn('text-2xl font-bold', valueClassName)}>
                    {value}
                </div>
                {description && (
                    <p
                        className={cn(
                            'text-xs text-muted-foreground',
                            descriptionClassName,
                        )}
                    >
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
