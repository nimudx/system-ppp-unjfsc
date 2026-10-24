import { Head } from '@inertiajs/react';
import { Building2, CircleAlert, Eye } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/shared/components/heading';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import { Textarea } from '@/shared/components/ui/textarea';
import AppLayout from '@/shared/layouts/app-layout';

interface Company {
    id: number;
    name: string;
    ruc: string;
    razon: string;
    email: string;
    phone: string;
    status: number;
    placements_count: number;
}

interface Props {
    companies: Company[];
    standalonePreview?: boolean;
}

export default function CompanyIndex({
    companies,
    standalonePreview = false,
}: Props) {
    const [preview, setPreview] = useState(standalonePreview);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Empresas', href: '/empresas' },
    ];

    const content = (
        <>
            <Head title="Empresas" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <Heading
                    variant="small"
                    title="Empresas"
                    description="Consulta las empresas y revisa las solicitudes de incorporación."
                />

                {preview && (
                    <Alert>
                        <Eye className="size-4" />
                        <AlertTitle>Vista previa de desarrollo</AlertTitle>
                        <AlertDescription>
                            La solicitud que se muestra es ilustrativa. Las
                            acciones no se guardan ni envían al backend.
                        </AlertDescription>
                    </Alert>
                )}

                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-semibold">
                                Solicitudes de incorporación
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Revisa los datos y documentos enviados por
                                estudiantes.
                            </p>
                        </div>
                        {import.meta.env.DEV && (
                            <Button
                                variant={preview ? 'default' : 'outline'}
                                onClick={() => setPreview((value) => !value)}
                            >
                                {preview
                                    ? 'Cerrar vista previa'
                                    : 'Vista previa'}
                            </Button>
                        )}
                    </div>
                    {!preview && (
                        <Alert>
                            <CircleAlert className="size-4" />
                            <AlertTitle>
                                API de solicitudes pendiente
                            </AlertTitle>
                            <AlertDescription>
                                El backend disponible no expone un listado de
                                solicitudes de incorporación ni acciones para
                                aprobar, observar o rechazar. No se reutiliza la
                                validación de prácticas porque es un flujo
                                distinto.
                            </AlertDescription>
                        </Alert>
                    )}
                    {preview && (
                        <div className="overflow-x-auto rounded-xl border bg-card">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Empresa / RUC</TableHead>
                                        <TableHead>Estudiante</TableHead>
                                        <TableHead>Correo / dominio</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Revisión</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <p className="font-medium">
                                                Empresa de ejemplo S.A.C.
                                            </p>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                20123456789
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            Estudiante de demostración
                                        </TableCell>
                                        <TableCell>
                                            <p>contacto@ejemplo.test</p>
                                            <p className="text-xs text-muted-foreground">
                                                Dominio corporativo (demo)
                                            </p>
                                        </TableCell>
                                        <TableCell>Fecha ilustrativa</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                Pendiente
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-muted-foreground">
                                                Aprobar · Observar · Rechazar
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Pendiente de endpoints; no
                                                ejecuta acciones.
                                            </p>
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-sm font-medium text-primary">
                                                    Ver detalle y documentos
                                                </summary>
                                                <div className="mt-3 min-w-60 space-y-3 rounded-md border p-3">
                                                    <p className="text-sm">
                                                        <span className="font-medium">
                                                            Empresa:
                                                        </span>{' '}
                                                        Empresa de ejemplo
                                                        S.A.C.
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-medium">
                                                            Solicitante:
                                                        </span>{' '}
                                                        Estudiante de
                                                        demostración
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-medium">
                                                            Dominio:
                                                        </span>{' '}
                                                        ejemplo.test
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-medium">
                                                            Documentos:
                                                        </span>{' '}
                                                        No hay archivos reales
                                                        en la vista previa.
                                                    </p>
                                                    <Textarea
                                                        placeholder="Motivo requerido para observar o rechazar"
                                                        disabled
                                                    />
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            size="sm"
                                                            disabled
                                                        >
                                                            Aprobar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled
                                                        >
                                                            Observar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            disabled
                                                        >
                                                            Rechazar
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Los endpoints de
                                                        revisión no existen; las
                                                        acciones están
                                                        deshabilitadas.
                                                    </p>
                                                </div>
                                            </details>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </section>

                <section className="space-y-4">
                    <Heading
                        variant="small"
                        title="Empresas registradas"
                        description="Empresas que actualmente existen en el registro local."
                    />
                    <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
                        <Table>
                            <TableHeader className="border-b bg-muted/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>RUC</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead className="text-center">
                                        Prácticas
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Estado
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companies.length > 0 ? (
                                    companies.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Building2 className="size-4 shrink-0 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">
                                                            {company.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {company.razon}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {company.ruc}
                                            </TableCell>
                                            <TableCell>
                                                <p>{company.email || '—'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {company.phone || '—'}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {company.placements_count}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={
                                                        company.status === 1
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {company.status === 1
                                                        ? 'Activa'
                                                        : 'Inactiva'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            Aún no hay empresas registradas en
                                            la base de datos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>
            </div>
        </>
    );

    return standalonePreview ? (
        <main className="min-h-screen bg-background">{content}</main>
    ) : (
        <AppLayout breadcrumbs={breadcrumbs}>{content}</AppLayout>
    );
}
