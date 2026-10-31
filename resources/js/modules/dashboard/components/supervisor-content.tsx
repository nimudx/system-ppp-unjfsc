import {
    ClipboardList,
    MapPin,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';
import StudentList from '@/modules/dashboard/components/student-list';
import type { SupervisorStats } from '@/modules/dashboard/types';
import { formatNumber, timeAgo } from '@/modules/dashboard/utils';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

export default function SupervisorDashboardContent({
    stats,
}: {
    stats: SupervisorStats;
}) {
    const { students, visits, validatedReports, incidents } = stats;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Alumnos a Cargo
                        </CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(students.total)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            En {students.companies}{' '}
                            {students.companies === 1
                                ? 'empresa'
                                : 'empresas diferentes'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Visitas Realizadas
                        </CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(visits.done)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {visits.approvedPercent}% aprobadas por el docente
                            titular
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Informes Validados
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(validatedReports.total)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {validatedReports.lastAt
                                ? `Última validación: ${timeAgo(validatedReports.lastAt)}`
                                : 'Aún sin validaciones'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Incidencias
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div
                            className={cn(
                                'text-2xl font-bold',
                                incidents > 0 && 'text-orange-600',
                            )}
                        >
                            {formatNumber(incidents)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Planes o informes observados
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Ruta de Supervisión</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StudentList
                            students={stats.route}
                            showAddress
                            empty="Aún no tienes alumnos asignados en tus grupos."
                        />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Estados en Alumno</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StudentList
                            students={stats.statuses}
                            empty="Sin alumnos que mostrar."
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
