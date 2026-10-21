import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, AlertCircle, LayoutPanelLeft } from 'lucide-react';
import Heading from '@/shared/components/heading';

import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';

interface SummaryReportProps {
    report: {
        total: number;
        success_count: number;
        failed_count: number;
        errors: Array<{
            row: number;
            dni: string;
            email: string;
            message: string;
        }>;
    };
    onFinish: () => void;
}

export function CardSmall({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
}) {
    return (
        <Card size="sm" className="mx-auto w-full max-w-sm">
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle>
                    <span className="text-2xl font-bold">{value}</span>
                </CardTitle>

                <CardAction>
                    <div className={`rounded-lg border bg-white/50 p-2`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                </CardAction>
            </CardHeader>
        </Card>
    );
}

export function MassiveRStepThree({ report, onFinish }: SummaryReportProps) {
    const hasErrors = report.failed_count > 0;

    return (
        <div className="animate-in space-y-6 duration-300 fade-in">
            {/* Cabecera del Reporte */}
            <div className="border-b pb-2">
                <Heading
                    variant="small"
                    title="Reporte de Procesamiento Masivo"
                    description={`Resumen detallado de los usuarios procesados en esta carga.`}
                />
            </div>

            {/* Estadísticas en Cards Sobrias */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <CardSmall
                    title="Total Procesados"
                    value={report.total}
                    icon={LayoutPanelLeft}
                    color="text-blue-600"
                />
                <CardSmall
                    title="Exitosos"
                    value={report.success_count}
                    icon={CheckCircle2}
                    color="text-emerald-600"
                />
                <CardSmall
                    title="Fallidos"
                    value={report.failed_count}
                    icon={AlertCircle}
                    color={hasErrors ? 'text-red-600' : 'text-muted-foreground'}
                />
            </div>

            {hasErrors && (
                <Card className="border-red-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xs font-bold tracking-tight uppercase">
                                Detalles de inconsistencias
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                            Los siguientes registros no pudieron ser procesados
                            debido a inconsistencias de datos o reglas de
                            negocio.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="rounded-md border bg-card">
                            <Table className="text-sm">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fila</TableHead>
                                        <TableHead>Identificación</TableHead>
                                        <TableHead>Motivo del Fallo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.errors.map((error, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">
                                                {error.row}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-light">
                                                        {error.dni}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {error.email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-red-500">
                                                {error.message}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

            {!hasErrors && (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 p-12 text-center">
                    <div className="mb-4 rounded-full bg-emerald-100 p-4 shadow-inner">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                        ¡Carga completa sin errores!
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                        Todos los usuarios del archivo fueron registrados y
                        asignados exitosamente al sistema.
                    </p>
                </div>
            )}

            {/* Acciones Finales */}
            <div className="flex justify-end pt-4">
                <Button
                    onClick={onFinish}
                    className="w-full px-10 font-bold sm:w-auto"
                >
                    Finalizar y Volver
                </Button>
            </div>
        </div>
    );
}
