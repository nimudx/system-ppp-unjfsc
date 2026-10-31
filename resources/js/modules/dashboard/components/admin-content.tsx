import { Users, GraduationCap, FileText, ClipboardCheck } from 'lucide-react';
import type { AdminStats } from '@/modules/dashboard/types';
import { formatNumber } from '@/modules/dashboard/utils';
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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Estudiantes
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(students.total)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +{formatNumber(students.thisMonth)} este mes
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Docentes Activos
                        </CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(teachers.total)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            En {teachers.schools}{' '}
                            {teachers.schools === 1 ? 'escuela' : 'escuelas'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Prácticas en Curso
                        </CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(internships.total)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {internships.withSupervisorPercent}% con supervisor
                            asignado
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Documentos Pendientes
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(pendingDocuments)}
                        </div>
                        <p
                            className={cn(
                                'text-xs font-medium',
                                pendingDocuments > 0
                                    ? 'text-red-500'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {pendingDocuments > 0
                                ? 'Requieren revisión'
                                : 'Todo revisado'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Estado por Escuelas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.bySchool.length === 0 ? (
                            <p className="py-10 text-center text-sm text-muted-foreground">
                                Aún no hay estudiantes registrados en este
                                semestre.
                            </p>
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
