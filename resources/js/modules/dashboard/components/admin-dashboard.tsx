import { Users, GraduationCap, FileText, ClipboardCheck } from 'lucide-react';
import type { AdminStats } from '@/modules/dashboard/types';
import { formatNumber } from '@/modules/dashboard/utils';
import EmptyState from '@/shared/components/empty-state';
import StatCard from '@/shared/components/stat-card';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

const alertColor = {
    warning: 'text-orange-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
};

export default function AcademicAdminContent({ stats }: { stats: AdminStats }) {
    const { students, teachers, internships, pendingDocuments } = stats;
    const maxStudents = Math.max(1, ...stats.bySchool.map((s) => s.students));

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                <StatCard
                    title="Total Estudiantes"
                    value={formatNumber(students.total)}
                    description={`+${formatNumber(students.thisMonth)} este mes`}
                    icon={Users}
                />
                <StatCard
                    title="Docentes Activos"
                    value={formatNumber(teachers.total)}
                    description={`En ${teachers.schools} ${
                        teachers.schools === 1 ? 'escuela' : 'escuelas'
                    }`}
                    icon={GraduationCap}
                />
                <StatCard
                    title="Prácticas en Curso"
                    value={formatNumber(internships.total)}
                    description={`${internships.withSupervisorPercent}% con supervisor asignado`}
                    icon={ClipboardCheck}
                />
                <StatCard
                    title="Documentos Pendientes"
                    value={formatNumber(pendingDocuments)}
                    description={
                        pendingDocuments > 0
                            ? 'Requieren revisión'
                            : 'Todo revisado'
                    }
                    descriptionClassName={
                        pendingDocuments > 0 ? 'text-red-500 font-medium' : ''
                    }
                    icon={FileText}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Estado por Escuelas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.bySchool.length === 0 ? (
                            <EmptyState
                                className="py-10"
                                title="Aún no hay estudiantes registrados en este semestre."
                            />
                        ) : (
                            <ul className="space-y-4">
                                {stats.bySchool.map((row) => (
                                    <li key={row.school} className="space-y-1">
                                        <div className="flex items-center justify-between gap-2 text-sm">
                                            <span className="truncate font-medium">
                                                {row.school}
                                            </span>
                                            <span className="shrink-0 text-muted-foreground">
                                                {formatNumber(row.students)}{' '}
                                                estudiantes
                                            </span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary"
                                                style={{
                                                    width: `${(row.students / maxStudents) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Alertas Académicas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.alerts.length === 0 ? (
                            <p className="text-sm font-medium text-green-600">
                                Sin alertas pendientes.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {stats.alerts.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col gap-1 border-b pb-2 last:border-0"
                                    >
                                        <p
                                            className={cn(
                                                'text-sm font-semibold',
                                                alertColor[item.level],
                                            )}
                                        >
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.detail}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
