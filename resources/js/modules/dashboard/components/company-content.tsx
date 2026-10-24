import { Link } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    FileText,
    Mail,
    UserRound,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';

const previewStudents = [
    {
        name: 'María Torres Flores',
        status: 'Aceptado',
        supervisor: 'Ana Vargas Luna',
        area: 'Marketing digital',
    },
    {
        name: 'Diego Mendoza Ríos',
        status: 'En revisión',
        supervisor: 'Luis Castillo Díaz',
        area: 'Desarrollo de software',
    },
    {
        name: 'Renzo Salazar Vega',
        status: 'Pendiente',
        supervisor: '—',
        area: 'Administración',
    },
];

export function CompanyContent() {
    const [preview, setPreview] = useState(false);
    const metrics = preview
        ? [
              { label: 'Practicantes activos', value: '12', icon: Users },
              { label: 'Vacantes publicadas', value: '4', icon: FileText },
              {
                  label: 'Estudiantes aceptados',
                  value: '7',
                  icon: CheckCircle2,
              },
          ]
        : [
              { label: 'Practicantes activos', value: '—', icon: Users },
              { label: 'Vacantes publicadas', value: '—', icon: FileText },
              {
                  label: 'Estudiantes aceptados',
                  value: '—',
                  icon: CheckCircle2,
              },
          ];
    const students = preview ? previewStudents : [];

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">
                    Portal de empresa
                </h2>
                <p className="text-sm text-muted-foreground">
                    Consulta las solicitudes de estudiantes y la información
                    corporativa asociada.
                </p>
            </div>

            {import.meta.env.DEV && (
                <Alert>
                    <Building2 className="size-4" />
                    <AlertTitle>
                        {preview
                            ? 'Vista previa de desarrollo'
                            : 'Datos empresariales pendientes'}
                    </AlertTitle>
                    <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                        <span>
                            {preview
                                ? 'Los valores y estudiantes son ilustrativos; no provienen del backend ni se guardan.'
                                : 'No se encontró una API de resumen o solicitudes empresariales. No se muestran datos inventados.'}
                        </span>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setPreview((value) => !value)}
                        >
                            {preview ? 'Ocultar demostración' : 'Vista previa'}
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                {metrics.map(({ label, value, icon: Icon }) => (
                    <Card key={label}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardDescription>{label}</CardDescription>
                                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                    <Icon className="size-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold tracking-tight">
                                {value}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <Building2 className="size-5" />
                            </div>
                            <div>
                                <CardTitle>Perfil de la empresa</CardTitle>
                                <CardDescription>
                                    Revisa la información asociada a tu cuenta.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <Link href="/settings/profile">
                                <UserRound className="mr-2 size-4" />
                                Ver perfil empresarial
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                                <Mail className="size-5" />
                            </div>
                            <div>
                                <CardTitle>Solicitudes y gestión</CardTitle>
                                <CardDescription>
                                    Las decisiones y solicitudes se reflejarán
                                    aquí cuando se implementen las API
                                    correspondientes.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            {preview
                                ? 'La aceptación de estudiantes y el registro del jefe inmediato son solo ilustrativos en esta vista previa.'
                                : 'El backend aún no expone los endpoints para listar solicitudes o aceptar estudiantes.'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Practicantes vinculados</CardTitle>
                    <CardDescription>
                        Las solicitudes de estudiantes se cargarán desde el
                        servicio empresarial cuando esté disponible.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="py-3 pr-4 font-medium">
                                        Estudiante
                                    </th>
                                    <th className="py-3 pr-4 font-medium">
                                        Estado
                                    </th>
                                    <th className="py-3 pr-4 font-medium">
                                        Supervisor
                                    </th>
                                    <th className="py-3 pr-4 font-medium">
                                        Área
                                    </th>
                                    <th className="py-3 pr-4 font-medium">
                                        Acción
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <tr
                                            key={student.name}
                                            className="border-b last:border-b-0"
                                        >
                                            <td className="py-3 pr-4 font-medium">
                                                {student.name}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className="rounded-full border border-border bg-muted px-2 py-1 text-xs">
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground">
                                                {student.supervisor}
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground">
                                                {student.area}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    disabled
                                                >
                                                    Aceptar al estudiante
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-8 text-center text-sm text-muted-foreground"
                                        >
                                            {preview
                                                ? 'No hay estudiantes de demostración configurados.'
                                                : 'No hay datos disponibles del backend.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
