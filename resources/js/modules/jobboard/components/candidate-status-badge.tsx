import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { CandidateStatus } from '../types';

const STATUS_STYLES: Record<CandidateStatus, string> = {
    proposed:
        'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    contacted:
        'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    hired: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    discarded:
        'border-neutral-500/20 bg-neutral-500/10 text-neutral-600 dark:text-neutral-400',
};

export default function CandidateStatusBadge({
    status,
    label,
    className,
}: {
    status: CandidateStatus;
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
