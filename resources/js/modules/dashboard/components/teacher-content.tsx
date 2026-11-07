import { Users, Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import StudentList from '@/modules/dashboard/components/student-list';
import type { TeacherStats } from '@/modules/dashboard/types';
import { formatDate, formatNumber } from '@/modules/dashboard/utils';
import EmptyState from '@/shared/components/empty-state';
import StatCard from '@/shared/components/stat-card';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';

export default function TeacherDashboardContent({
    stats,
}: {
    stats: TeacherStats;
}) {
    const { pendingReports } = stats;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                <StatCard
                    title="Alumnos Asignados"
                    value={formatNumber(stats.students)}
                    description={`Ciclo ${stats.semester ?? '—'}`}
                    icon={Users}
                />
                <StatCard
                    title="Visitas de Supervisión"
                    value={formatNumber(stats.pendingVisits)}
                    description="Evaluaciones de supervisores por revisar"
                    icon={Calendar}
                />
                <StatCard
                    title="Informes por Revisar"
                    value={formatNumber(pendingReports.total)}
                    description={`${pendingReports.plans} planes · ${pendingReports.reports} informes`}
                    descriptionClassName={
                        pendingReports.total > 0
                            ? 'text-orange-500 font-medium'
                            : ''
                    }
                    icon={CheckSquare}
                />
                <StatCard
                    title="Mensajes Nuevos"
                    value={formatNumber(stats.unreadMessages)}
                    description="Notificaciones sin leer"
                    icon={MessageSquare}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Mi Calendario de Supervisión</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.agenda.length === 0 ? (
                            <EmptyState
                                className="py-10"
                                title="No hay fechas próximas de inicio o fin de práctica."
                            />
                        ) : (
                            <ul className="space-y-3">
                                {stats.agenda.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-4 border-b pb-3 last:border-0"
                                    >
                                        <div className="w-24 shrink-0 rounded-md bg-primary/10 px-2 py-1 text-center text-xs font-semibold text-primary">
                                            {formatDate(item.date)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {item.event} · {item.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {item.company ?? 'Sin empresa'}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Alumnos Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StudentList
                            students={stats.recentStudents}
                            empty="Aún no tienes alumnos en tu sección."
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
