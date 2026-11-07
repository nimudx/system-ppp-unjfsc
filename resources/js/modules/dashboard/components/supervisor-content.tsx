import {
    ClipboardList,
    MapPin,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';
import StudentList from '@/modules/dashboard/components/student-list';
import type { SupervisorStats } from '@/modules/dashboard/types';
import { formatNumber, timeAgo } from '@/modules/dashboard/utils';
import StatCard from '@/shared/components/stat-card';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';

export default function SupervisorDashboardContent({
    stats,
}: {
    stats: SupervisorStats;
}) {
    const { students, visits, validatedReports, incidents } = stats;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                <StatCard
                    title="Alumnos a Cargo"
                    value={formatNumber(students.total)}
                    description={`En ${students.companies} ${
                        students.companies === 1
                            ? 'empresa'
                            : 'empresas diferentes'
                    }`}
                    icon={ClipboardList}
                />
                <StatCard
                    title="Visitas Realizadas"
                    value={formatNumber(visits.done)}
                    description={`${visits.approvedPercent}% aprobadas por el docente titular`}
                    icon={MapPin}
                />
                <StatCard
                    title="Informes Validados"
                    value={formatNumber(validatedReports.total)}
                    description={
                        validatedReports.lastAt
                            ? `Última validación: ${timeAgo(validatedReports.lastAt)}`
                            : 'Aún sin validaciones'
                    }
                    icon={CheckCircle2}
                />
                <StatCard
                    title="Incidencias"
                    value={formatNumber(incidents)}
                    description="Planes o informes observados"
                    valueClassName={incidents > 0 ? 'text-orange-600' : ''}
                    icon={AlertTriangle}
                />
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
