import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { VacancyStatus } from '../types';

const STATUS_STYLES: Record<VacancyStatus, string> = {
    draft: 'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-300',
    pending_review:
        'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    observed:
        'border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400',
    rejected:
        'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400',
    published:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    closed: 'border-neutral-500/20 bg-neutral-500/10 text-neutral-600 dark:text-neutral-400',
};

export default function VacancyStatusBadge({
    status,
    label,
    className,
}: {
    status: VacancyStatus;
    label: string;
    className?: string;
}) {
    return (
        <Badge
            variant="outline"
            className={cn('font-medium', STATUS_STYLES[status], className)}
        >
            {label}
        </Badge>
    );
}
