import { CheckCircle2, AlertCircle, Clock, ArrowRight, MessageSquare, Loader2, XCircle, FileText } from "lucide-react"
import * as React from "react"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { cn } from "@/shared/lib/utils"

interface ValidationFormProps {
    status?: number;            // Current status: 1: Approved, 3: Observed
    onSuccess: (data: { status: number; comment: string }) => void;
    isSubmitting?: boolean;
    children?: React.ReactNode; // For extra fields (like Supervision)
    showFileInfo?: {
        name: string;
        meta?: string;
        grade?: number;
    };
    className?: string;
    extendForm?: boolean;
}

export function ValidationForm({
    status,
    onSuccess,
    isSubmitting = false,
    children,
    showFileInfo,
    className,
    extendForm // Extend form with additional fields for supervision, bool
}: ValidationFormProps) {
    const [valStatus, setValStatus] = React.useState<number | null>(null);
    const [comment, setComment] = React.useState('');

    // Reset local state when external status changes (e.g. after a successful reloadDetail)
    React.useEffect(() => {
        setValStatus(null);
        setComment('');
    }, [status]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!valStatus) return;
        onSuccess({ status: valStatus, comment });
    };

    if (status === 0) {
        return (
            <div className={cn("space-y-4 animate-in fade-in duration-300", className)}>
                <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <Clock className="size-4 shrink-0 text-slate-600 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900 tracking-tight leading-none">No iniciado</p>
                        <p className="text-xs text-slate-700 leading-relaxed">Aún no se ha realizado la validación de este documento.</p>
                    </div>
                </div>
            </div>
        )
    }

    // Determine what to show if already evaluated
    if (status === 1 && valStatus === null) {
        return (
            <div className={cn("space-y-4 animate-in fade-in duration-300", className)}>
                <div className="flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-emerald-900 tracking-tight leading-none">Aprobado</p>
                        <p className="text-xs text-emerald-700 leading-relaxed">Este documento ha sido validado correctamente.</p>
                    </div>
                </div>
                {showFileInfo && <FileInfoCard name={showFileInfo.name} meta={showFileInfo.meta} />}
                <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-[10px] font-bold text-muted-foreground hover:text-destructive"
                    onClick={() => setValStatus(3)}
                >
                    Cambiar dictamen a Observado
                </Button>
            </div>
        );
    }

    if ((status ?? 0) >= 3 && valStatus === null) {
        return (
            <div className={cn("space-y-4 animate-in fade-in duration-300", className)}>
                <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-destructive tracking-tight leading-none">Observado</p>
                        <p className="text-xs text-destructive/80 leading-relaxed font-medium">Se han notificado observaciones. Pendiente de corrección.</p>
                    </div>
                </div>
                {showFileInfo && <FileInfoCard name={showFileInfo.name} meta={showFileInfo.meta} />}
                <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-[10px] font-bold text-muted-foreground hover:text-emerald-600"
                    onClick={() => setValStatus(1)}
                >
                    Cambiar dictamen a Aprobado
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-5 animate-in fade-in slide-in-from-right-1 duration-300", className)}>
            {showFileInfo && <FileInfoCard name={showFileInfo.name} meta={showFileInfo.meta} grade={showFileInfo?.grade} />}

            <div className="space-y-3">
                <Label className="text-xs text-muted-foreground px-1">Dictamen de Evaluación</Label>
                <div className="grid grid-cols-2 gap-2.5">
                    <button
                        type="button"
                        onClick={() => setValStatus(1)}
                        className={cn(
                            "group flex items-center justify-center gap-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                            valStatus === 1
                                ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-500/10"
                                : "border-slate-200 bg-background text-slate-500 hover:border-slate-300 hover:bg-slate-50/50"
                        )}
                    >
                        <CheckCircle2 className={cn("size-4 transition-colors", valStatus === 1 ? "text-emerald-600" : "text-slate-300 group-hover:text-slate-400")} />
                        <span className="text-xs font-bold">Aprobar</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setValStatus(3)}
                        className={cn(
                            "group flex items-center justify-center gap-2 rounded-lg border py-3 px-4 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20",
                            valStatus === 3
                                ? "border-red-500 bg-red-50/30 text-red-700 ring-1 ring-red-500/10"
                                : "border-slate-200 bg-background text-slate-500 hover:border-slate-300 hover:bg-slate-50/50"
                        )}
                    >
                        <AlertCircle className={cn("size-4 transition-colors", valStatus === 3 ? "text-red-600" : "text-slate-300 group-hover:text-slate-400")} />
                        <span className="text-xs font-bold">Observar</span>
                    </button>
                </div>
            </div>

            {/* Observation Types */}
            {extendForm && (valStatus ?? 0) >= 3 && (
                <div className="space-y-3 p-4 rounded-xl bg-red-50/50 border border-red-100 animate-in zoom-in-95 duration-200">
                    <Label className="text-[10px] font-bold text-red-900 uppercase tracking-widest">¿Qué requiere corrección?</Label>
                    <RadioGroup
                        value={String(valStatus)}
                        onValueChange={(v) => {
                            const val = Number(v);
                            setValStatus(val);
                        }}
                        className="space-y-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="5" id="r1" className="text-red-600 border-red-300" />
                            <Label htmlFor="r1" className="text-xs font-bold text-red-800 cursor-pointer">Solo Archivo / Anexo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="4" id="r2" className="text-red-600 border-red-300" />
                            <Label htmlFor="r2" className="text-xs font-bold text-red-800 cursor-pointer">Solo Calificación / Nota</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="3" id="r3" className="text-red-600 border-red-300" />
                            <Label htmlFor="r3" className="text-xs font-bold text-red-800 cursor-pointer">Ambos (Archivo y Nota)</Label>
                        </div>
                    </RadioGroup>
                </div>
            )}

            {/* Slot for extra fields (Supervision observation type, etc) */}
            {children && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                    {children}
                </div>
            )}

            <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                    <Label className="text-xs text-muted-foreground">Observaciones</Label>
                    {(valStatus ?? 0) >= 3 && <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">Requerido</span>}
                </div>
                <div className="relative group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all">
                    <MessageSquare className="absolute left-3 top-3 size-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full min-h-[100px] pl-10 p-3 text-xs rounded-lg border border-slate-200 bg-slate-50/20 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-300"
                        placeholder={(valStatus ?? 0) >= 3 ? "Detalla los motivos de la observación..." : "Opcional: Añade un comentario adicional..."}
                        required={(valStatus ?? 0) >= 3}
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={!valStatus || ((valStatus ?? 0) >= 3 && !comment.trim()) || isSubmitting}
                className={cn(
                    "w-full transition-all",
                    valStatus === 1 ? "bg-emerald-600 hover:bg-emerald-700" : (valStatus ?? 0) >= 3 ? "bg-red-600 hover:bg-red-700" : ""
                )}
            >
                {isSubmitting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                    <ArrowRight className="mr-2 size-4" />
                )}
                Registrar Dictamen
            </Button>
        </form>
    );
}

function FileInfoCard({ name, meta, grade }: { name: string; meta?: string, grade?: number }) {
    return (
        <div className="flex items-center gap-3 p-2.5 rounded-lg border">
            <div className="size-9 rounded-md border flex items-center justify-center shrink-0">
                <FileText className="size-4.5 text-muted-foreground/60" />
            </div>
            <div className="flex flex-col min-w-0 gap-1">
                <span className="truncate text-xs leading-none font-bold">{name}</span>
                {meta && <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-none mt-0.5">{meta}</span>}
                {grade != null && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Calificación:</span>
                        <span className="text-xs font-extrabold text-foreground">{grade} / 20</span>
                    </div>
                )}
            </div>
        </div>
    )
}