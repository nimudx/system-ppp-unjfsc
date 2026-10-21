import { FileText, MessageSquare, History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface HistoryRecord {
    id: number;
    approval_status: number;
    comment?: string;
    name?: string;
    created_at?: string;
}

interface FileHistoryProps {
    history: HistoryRecord[];
}

export default function FileHistory({ history }: FileHistoryProps) {
    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <HistoryIcon className="size-6 text-muted-foreground/50" />
                </div>
                <h4 className="text-sm font-semibold mb-1">Sin historial de cambios</h4>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                    Las versiones anteriores aparecerán aquí una vez que se realicen actualizaciones.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-px before:bg-linear-to-b before:from-border before:via-border before:to-transparent">
            {history.map((record, index) => {
                const statusColor =
                    record.approval_status === 1 ? 'bg-green-500'
                        : record.approval_status === 3 ? 'bg-destructive'
                            : 'bg-amber-500';
                const statusLabel =
                    record.approval_status === 1 ? 'Aprobado'
                        : record.approval_status === 3 ? 'Observado'
                            : 'Pendiente';
                const statusText =
                    record.approval_status === 1 ? 'text-green-600'
                        : record.approval_status == 3 ? 'text-destructive'
                            : 'text-amber-600';

                return (
                    <div key={record.id ?? index} className="relative pl-8 group">
                        <div className={`absolute left-0 mt-1.5 size-5 rounded-full border-4 border-background shadow-sm transition-transform group-hover:scale-110 ${statusColor}`} />
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col leading-tight">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${statusText}`}>
                                    {statusLabel}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                    {record.created_at
                                        ? format(new Date(record.created_at), "d 'de' MMMM, p", { locale: es })
                                        : 'Fecha desconocida'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-transparent hover:border-border transition-colors">
                                <FileText className="size-3.5 text-muted-foreground/60 shrink-0" />
                                <span className="text-xs font-medium truncate flex-1">{record.name ?? 'Documento adjunto'}</span>
                            </div>
                            {record.comment && (
                                <div className="flex gap-2 p-2.5 rounded-lg border">
                                    <MessageSquare className="size-3 shrink-0 mt-0.5" />
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
