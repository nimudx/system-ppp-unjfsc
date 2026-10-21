import { Users, GraduationCap, FileText, ClipboardCheck } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';

export default function AcademicAdminContent() {
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
                        <div className="text-2xl font-bold">1,280</div>
                        <p className="text-xs text-muted-foreground">
                            +40 este semestre
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
                        <div className="text-2xl font-bold">85</div>
                        <p className="text-xs text-muted-foreground">
                            En 12 especialidades
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
                        <div className="text-2xl font-bold">320</div>
                        <p className="text-xs text-muted-foreground">
                            75% con supervisor asignado
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
                        <div className="text-2xl font-bold">14</div>
                        <p className="text-xs font-medium text-red-500">
                            Requieren firma urgente
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Estado por Escuelas</CardTitle>
                    </CardHeader>
                    <CardContent className="flex h-75 items-center justify-center rounded-lg border-2 border-dashed">
                        <p className="text-muted-foreground italic">
                            Gráfico de distribución por facultades (Admin Demo)
                        </p>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Alertas Académicas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                {
                                    t: 'Falta asignar supervisores',
                                    d: 'Escuela de Ing. Civil',
                                    c: 'text-orange-600',
                                },
                                {
                                    t: 'Convenio por vencer',
                                    d: 'Empresa Tech Corp',
                                    c: 'text-red-600',
                                },
                                {
                                    t: 'Registro de notas cerrado',
                                    d: 'Semestre 2025-II',
                                    c: 'text-green-600',
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col gap-1 border-b pb-2 last:border-0"
                                >
                                    <p
                                        className={`text-sm font-semibold ${item.c}`}
                                    >
                                        {item.t}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.d}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
