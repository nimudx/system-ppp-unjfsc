import {
    ClipboardList,
    MapPin,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function SupervisorDashboardContent() {
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
                        <div className="text-2xl font-bold">10</div>
                        <p className="text-xs text-muted-foreground">
                            En 6 empresas diferentes
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
                        <div className="text-2xl font-bold">12 / 20</div>
                        <p className="text-xs text-muted-foreground">
                            60% de la meta mensual
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
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">
                            Última validación: Hoy 9:00 AM
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
                        <div className="text-2xl font-bold text-orange-600">
                            2
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pendientes de resolución
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Ruta de Supervisión</CardTitle>
                    </CardHeader>
                    <CardContent className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed">
                        <p className="text-muted-foreground italic">
                            Vista de mapa / Hoja de ruta (Supervisor Demo)
                        </p>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Estados en Alumno</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                {
                                    n: 'Maria Ramos',
                                    e: 'Consorcio J&M',
                                    s: 'Crítico',
                                    c: 'bg-red-100 text-red-700',
                                },
                                {
                                    n: 'Kevin Soto',
                                    e: 'Tech Solutions',
                                    s: 'Excelente',
                                    c: 'bg-green-100 text-green-700',
                                },
                                {
                                    n: 'Andrea Vera',
                                    e: 'Inversiones PPP',
                                    s: 'Regular',
                                    c: 'bg-yellow-100 text-yellow-700',
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between border-b pb-2 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {item.n}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.e}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-[10px] ${item.c} rounded-full px-2 py-0.5 font-bold uppercase`}
                                    >
                                        {item.s}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
