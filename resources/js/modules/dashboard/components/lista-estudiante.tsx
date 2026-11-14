import type { StudentRow } from '@/modules/dashboard/types';
import { toneClasses } from '@/modules/dashboard/utils';
import { cn } from '@/shared/lib/utils';

export default function StudentList({
    students,
    showAddress = false,
    empty,
}: {
    students: StudentRow[];
    showAddress?: boolean;
    empty: string;
}) {
    if (students.length === 0) {
        return <p className="text-sm text-muted-foreground">{empty}</p>;
    }

    return (
        <div className="space-y-4">
            {students.map((student) => (
                <div
                    key={student.id}
                    className="flex items-center justify-between gap-3 border-b pb-2 last:border-0"
                >
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                            {student.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {student.company}
                            {showAddress && student.address
                                ? ` · ${student.address}`
                                : ''}
                        </p>
                    </div>
                    <span
                        className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                            toneClasses[student.status.tone],
                        )}
                    >
                        {student.status.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
