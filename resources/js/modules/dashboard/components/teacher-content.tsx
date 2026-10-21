import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Users, Calendar, CheckSquare, MessageSquare } from 'lucide-react';

export default function TeacherDashboardContent() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alumnos Asignados</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">15</div>
                        <p className="text-xs text-muted-foreground">Ciclo 2026-I</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitas de Supervisión</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">Programadas para esta semana</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Informes por Revisar</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-orange-500 font-medium">3 vencen mañana</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mensajes Nuevos</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">De alumnos en práctica</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Mi Calendario de Supervisión</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground italic">Vista de calendario / Agenda (Docente Demo)</p>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Alumnos Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { n: 'Carlos Mendoza', e: 'Empresa Alfa S.A.', s: 'En curso' },
                                { n: 'Lucía Fernández', e: 'Construcciones S.A.', s: 'Pendiente Visita' },
                                { n: 'Roberto Gómez', e: 'Minera del Norte', s: 'Informe Enviado' }
                            ].map((student, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium">{student.n}</p>
                                        <p className="text-xs text-muted-foreground">{student.e}</p>
                                    </div>
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase font-bold">
                                        {student.s}
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
