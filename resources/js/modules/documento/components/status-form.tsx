import { CheckCircle2, Clock, X, XCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "../../../shared/components/ui/button";

interface Props {
    status: number;
    className?: string;
}

export default function StatusForm({ status, className }: Props) {
    if (status === 0) {
        return (
            <div className={cn("space-y-4 animate-in fade-in duration-300", className)}>
                <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <Clock className="size-4 shrink-0 text-slate-600 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-tight leading-none">No iniciado</p>
                        <p className="text-[10px] text-slate-700 leading-relaxed font-medium">Aún no se ha realizado la validación de este componente.</p>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 1) {
        return (
            <div className={cn("space-y-4 animate-in fade-in duration-300", className)}>
                <div className="flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-900 uppercase tracking-tight leading-none">Validación Aprobada</p>
                        <p className="text-[10px] text-emerald-700 leading-relaxed font-medium">Este componente ha sido validado correctamente.</p>
                    </div>
                </div>
                <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-[10px] font-bold text-muted-foreground hover:text-destructive"
                >
                    Cambiar dictamen a Observado
                </Button>
            </div>
        );
    }

    if (status === 2) {
        return (
            <div className={cn("space-y-4 animate-in fade-in duration-300", className)}>
                <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <Clock className="size-4 shrink-0 text-slate-600 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-tight leading-none">No iniciado</p>
                        <p className="text-[10px] text-slate-700 leading-relaxed font-medium">Aún no se ha realizado la validación de este componente.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 3) {
        return (
            <div className={cn("space-y-4 animate-in fade-in duration-300", className)}>
                <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-destructive uppercase tracking-tight leading-none">Componente Observado</p>
                        <p className="text-[10px] text-destructive/80 leading-relaxed font-medium">Se han notificado observaciones. Pendiente de corrección.</p>
                    </div>
                </div>
                <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-[10px] font-bold text-muted-foreground hover:text-emerald-600"
                >
                    Cambiar dictamen a Aprobado
                </Button>
            </div>
        );
    }
}