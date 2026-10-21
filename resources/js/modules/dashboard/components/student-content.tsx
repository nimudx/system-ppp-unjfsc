import { Clock, Calendar, FileCheck, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function StudentDashboardContent() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Horas Realizadas
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">120 / 480</div>
                        <p className="text-xs text-muted-foreground">
                            25% completado
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Días Restantes
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground">
                            Finaliza el 15 de Julio
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Informes Aprobados
                        </CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2 / 4</div>
                        <p className="text-xs text-muted-foreground">
                            Próximo vence en 5 días
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Calificación Promedio
                        </CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">16.5</div>
                        <p className="text-xs text-muted-foreground">
                            Basado en primer informe
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Mi Progreso de Prácticas</CardTitle>
                    </CardHeader>
                    <CardContent className="flex h-75 items-center justify-center rounded-lg border-2 border-dashed">
                        <p className="text-muted-foreground italic">
                            Gráfico de progreso / Timeline (Estudiante Demo)
                        </p>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Tareas Pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                {
                                    t: 'Subir Informe Mensual #3',
                                    d: 'Vence mañana',
                                    priority: 'high',
                                },
                                {
                                    t: 'Registrar asistencia semanal',
                                    d: 'Vence hoy',
                                    priority: 'medium',
                                },
                                {
                                    t: 'Encuesta de satisfacción',
                                    d: 'Opcional',
                                    priority: 'low',
                                },
                            ].map((task, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between border-b pb-2 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {task.t}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {task.d}
                                        </p>
                                    </div>
                                    <div
                                        className={`h-2 w-2 rounded-full ${task.priority === 'high'
                                                ? 'bg-red-500'
                                                : task.priority === 'medium'
                                                    ? 'bg-orange-500'
                                                    : 'bg-gray-400'
                                            }`}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
