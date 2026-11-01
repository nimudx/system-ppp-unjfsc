import { Users, Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import StudentList from '@/modules/dashboard/components/student-list';
import type { TeacherStats } from '@/modules/dashboard/types';
import { formatDate, formatNumber } from '@/modules/dashboard/utils';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

export default function TeacherDashboardContent({
    stats,
}: {
    stats: TeacherStats;
}) {
    const { pendingReports } = stats;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Alumnos Asignados
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(stats.students)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Ciclo {stats.semester ?? '—'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Visitas de Supervisión
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(stats.pendingVisits)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Evaluaciones de supervisores por revisar
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Informes por Revisar
                        </CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(pendingReports.total)}
                        </div>
                        <p
                            className={cn(
                                'text-xs font-medium',
                                pendingReports.total > 0
                                    ? 'text-orange-500'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {pendingReports.plans} planes ·{' '}
                            {pendingReports.reports} informes
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Mensajes Nuevos
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(stats.unreadMessages)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Notificaciones sin leer
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Mi Calendario de Supervisión</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.agenda.length === 0 ? (
                            <p className="py-10 text-center text-sm text-muted-foreground">
                                No hay fechas próximas de inicio o fin de
                                práctica.
                            </p>
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
