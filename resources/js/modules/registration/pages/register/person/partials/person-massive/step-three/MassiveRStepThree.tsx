import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { CheckCircle2, AlertCircle, RefreshCcw, LayoutPanelLeft } from "lucide-react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import Heading from "@/shared/components/heading";

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

export function CardSmall({ title, value, icon: Icon, color }: any) {
    return (
        <Card size="sm" className="mx-auto w-full max-w-sm">
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle>
                    <span className="text-2xl font-bold">{value}</span>
                </CardTitle>

                <CardAction>
                    <div className={`p-2 rounded-lg bg-white/50 border`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                </CardAction>
            </CardHeader>
        </Card>
    )
}


export function MassiveRStepThree({ report, onFinish }: SummaryReportProps) {
    const hasErrors = report.failed_count > 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Cabecera del Reporte */}
            <div className="pb-2 border-b">
                <Heading
                    variant="small"
                    title="Reporte de Procesamiento Masivo"
                    description={`Resumen detallado de los usuarios procesados en esta carga.`}
                />
            </div>

            {/* Estadísticas en Cards Sobrias */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    color={hasErrors ? "text-red-600" : "text-muted-foreground"}
                />
            </div>

            {hasErrors && (
                <Card className="border-red-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-tight">Detalles de inconsistencias</CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                            Los siguientes registros no pudieron ser procesados debido a inconsistencias de datos o reglas de negocio.
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
                                            <TableCell className="font-medium">{error.row}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-light">{error.dni}</span>
                                                    <span className="text-[10px] text-muted-foreground">{error.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-red-500">{error.message}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

            {!hasErrors && (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed bg-muted/20">
                    <div className="p-4 bg-emerald-100 rounded-full mb-4 shadow-inner">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground">¡Carga completa sin errores!</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-2 leading-relaxed">
                        Todos los usuarios del archivo fueron registrados y asignados exitosamente al sistema.
                    </p>
                </div>
            )}

            {/* Acciones Finales */}
            <div className="flex justify-end pt-4">
                <Button
                    onClick={onFinish}
                    className="w-full sm:w-auto px-10 font-bold"
                >
                    Finalizar y Volver
                </Button>
            </div>
        </div >
    );
}
