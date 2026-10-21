import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, MessageSquare, History as HistoryIcon } from 'lucide-react';

export interface HistoryRecord {
    id: number;
    approval_status: number;
    comment?: string | null;
    name?: string;
    created_at?: string;
}

interface FileHistoryProps {
    history: HistoryRecord[];
}

export default function FileHistory({ history }: FileHistoryProps) {
    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                    <HistoryIcon className="size-6 text-muted-foreground/50" />
                </div>
                <h4 className="mb-1 text-sm font-semibold">
                    Sin historial de cambios
                </h4>
                <p className="max-w-[200px] text-xs text-muted-foreground">
                    Las versiones anteriores aparecerán aquí una vez que se
                    realicen actualizaciones.
                </p>
            </div>
        );
    }

    return (
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-px before:bg-linear-to-b before:from-border before:via-border before:to-transparent">
            {history.map((record, index) => {
                const statusColor =
                    record.approval_status === 1
                        ? 'bg-green-500'
                        : record.approval_status === 3
                          ? 'bg-destructive'
                          : 'bg-amber-500';
                const statusLabel =
                    record.approval_status === 1
                        ? 'Aprobado'
                        : record.approval_status === 3
                          ? 'Observado'
                          : 'Pendiente';
                const statusText =
                    record.approval_status === 1
                        ? 'text-green-600'
                        : record.approval_status == 3
                          ? 'text-destructive'
                          : 'text-amber-600';

                return (
                    <div
                        key={record.id ?? index}
                        className="group relative pl-8"
                    >
                        <div
                            className={`absolute left-0 mt-1.5 size-5 rounded-full border-4 border-background shadow-sm transition-transform group-hover:scale-110 ${statusColor}`}
                        />
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col leading-tight">
                                <span
                                    className={`text-[10px] font-bold tracking-widest uppercase ${statusText}`}
                                >
                                    {statusLabel}
                                </span>
                                <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                                    {record.created_at
                                        ? format(
                                              new Date(record.created_at),
                                              "d 'de' MMMM, p",
                                              { locale: es },
                                          )
                                        : 'Fecha desconocida'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-md border border-transparent bg-muted/30 p-2 transition-colors hover:border-border">
                                <FileText className="size-3.5 shrink-0 text-muted-foreground/60" />
                                <span className="flex-1 truncate text-xs font-medium">
                                    {record.name ?? 'Documento adjunto'}
                                </span>
                            </div>
                            {record.comment && (
                                <div className="flex gap-2 rounded-lg border p-2.5">
                                    <MessageSquare className="mt-0.5 size-3 shrink-0" />
                                    <p className="text-[11px] leading-relaxed italic">
                                        {record.comment}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
