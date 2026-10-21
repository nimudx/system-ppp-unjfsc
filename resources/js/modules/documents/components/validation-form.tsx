import {
    CheckCircle2,
    AlertCircle,
    Clock,
    ArrowRight,
    MessageSquare,
    Loader2,
    XCircle,
    FileText,
} from 'lucide-react';
import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { cn } from '@/shared/lib/utils';

interface ValidationFormProps {
    status?: number; // Current status: 1: Approved, 3: Observed
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
    extendForm, // Extend form with additional fields for supervision, bool
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
            <div
                className={cn(
                    'animate-in space-y-4 duration-300 fade-in',
                    className,
                )}
            >
                <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <Clock className="mt-0.5 size-4 shrink-0 text-slate-600" />
                    <div className="space-y-1">
                        <p className="text-sm leading-none font-bold tracking-tight text-slate-900">
                            No iniciado
                        </p>
                        <p className="text-xs leading-relaxed text-slate-700">
                            Aún no se ha realizado la validación de este
                            documento.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Determine what to show if already evaluated
    if (status === 1 && valStatus === null) {
        return (
            <div
                className={cn(
                    'animate-in space-y-4 duration-300 fade-in',
                    className,
                )}
            >
                <div className="flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <div className="space-y-1">
                        <p className="text-sm leading-none font-bold tracking-tight text-emerald-900">
                            Aprobado
                        </p>
                        <p className="text-xs leading-relaxed text-emerald-700">
                            Este documento ha sido validado correctamente.
                        </p>
                    </div>
                </div>
                {showFileInfo && (
                    <FileInfoCard
                        name={showFileInfo.name}
                        meta={showFileInfo.meta}
                    />
                )}
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
            <div
                className={cn(
                    'animate-in space-y-4 duration-300 fade-in',
                    className,
                )}
            >
                <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div className="space-y-1">
                        <p className="text-sm leading-none font-bold tracking-tight text-destructive">
                            Observado
                        </p>
                        <p className="text-xs leading-relaxed font-medium text-destructive/80">
                            Se han notificado observaciones. Pendiente de
                            corrección.
                        </p>
                    </div>
                </div>
                {showFileInfo && (
                    <FileInfoCard
                        name={showFileInfo.name}
                        meta={showFileInfo.meta}
                    />
                )}
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
        <form
            onSubmit={handleSubmit}
            className={cn(
                'animate-in space-y-5 duration-300 fade-in slide-in-from-right-1',
                className,
            )}
        >
            {showFileInfo && (
                <FileInfoCard
                    name={showFileInfo.name}
                    meta={showFileInfo.meta}
                    grade={showFileInfo?.grade}
                />
            )}

            <div className="space-y-3">
                <Label className="px-1 text-xs text-muted-foreground">
                    Dictamen de Evaluación
                </Label>
                <div className="grid grid-cols-2 gap-2.5">
                    <button
                        type="button"
                        onClick={() => setValStatus(1)}
                        className={cn(
                            'group flex items-center justify-center gap-2 rounded-lg border transition-all focus:ring-2 focus:ring-emerald-500/20 focus:outline-none',
                            valStatus === 1
                                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-500/10'
                                : 'border-slate-200 bg-background text-slate-500 hover:border-slate-300 hover:bg-slate-50/50',
                        )}
                    >
                        <CheckCircle2
                            className={cn(
                                'size-4 transition-colors',
                                valStatus === 1
                                    ? 'text-emerald-600'
                                    : 'text-slate-300 group-hover:text-slate-400',
                            )}
                        />
                        <span className="text-xs font-bold">Aprobar</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setValStatus(3)}
                        className={cn(
                            'group flex items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:ring-red-500/20 focus:outline-none',
                            valStatus === 3
                                ? 'border-red-500 bg-red-50/30 text-red-700 ring-1 ring-red-500/10'
                                : 'border-slate-200 bg-background text-slate-500 hover:border-slate-300 hover:bg-slate-50/50',
                        )}
                    >
                        <AlertCircle
                            className={cn(
                                'size-4 transition-colors',
                                valStatus === 3
                                    ? 'text-red-600'
                                    : 'text-slate-300 group-hover:text-slate-400',
                            )}
                        />
                        <span className="text-xs font-bold">Observar</span>
                    </button>
                </div>
            </div>

            {/* Observation Types */}
            {extendForm && (valStatus ?? 0) >= 3 && (
                <div className="animate-in space-y-3 rounded-xl border border-red-100 bg-red-50/50 p-4 duration-200 zoom-in-95">
                    <Label className="text-[10px] font-bold tracking-widest text-red-900 uppercase">
                        ¿Qué requiere corrección?
                    </Label>
                    <RadioGroup
                        value={String(valStatus)}
                        onValueChange={(v) => {
                            const val = Number(v);
                            setValStatus(val);
                        }}
                        className="space-y-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="5"
                                id="r1"
                                className="border-red-300 text-red-600"
                            />
                            <Label
                                htmlFor="r1"
                                className="cursor-pointer text-xs font-bold text-red-800"
                            >
                                Solo Archivo / Anexo
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="4"
                                id="r2"
                                className="border-red-300 text-red-600"
                            />
                            <Label
                                htmlFor="r2"
                                className="cursor-pointer text-xs font-bold text-red-800"
                            >
                                Solo Calificación / Nota
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="3"
                                id="r3"
                                className="border-red-300 text-red-600"
                            />
                            <Label
                                htmlFor="r3"
                                className="cursor-pointer text-xs font-bold text-red-800"
                            >
                                Ambos (Archivo y Nota)
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            )}

            {/* Slot for extra fields (Supervision observation type, etc) */}
            {children && (
                <div className="animate-in duration-200 zoom-in-95 fade-in">
                    {children}
                </div>
            )}

            <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                    <Label className="text-xs text-muted-foreground">
                        Observaciones
                    </Label>
                    {(valStatus ?? 0) >= 3 && (
                        <span className="text-[9px] font-bold tracking-tighter text-red-500 uppercase">
                            Requerido
                        </span>
                    )}
                </div>
                <div className="relative transition-all group-focus-within:ring-2 group-focus-within:ring-primary/20">
                    <MessageSquare className="absolute top-3 left-3 size-4 text-slate-300 transition-colors group-focus-within:text-primary" />
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[100px] w-full rounded-lg border border-slate-200 bg-slate-50/20 p-3 pl-10 text-xs transition-all placeholder:text-slate-300 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:outline-none"
                        placeholder={
                            (valStatus ?? 0) >= 3
                                ? 'Detalla los motivos de la observación...'
                                : 'Opcional: Añade un comentario adicional...'
                        }
                        required={(valStatus ?? 0) >= 3}
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={
                    !valStatus ||
                    ((valStatus ?? 0) >= 3 && !comment.trim()) ||
                    isSubmitting
                }
                className={cn(
                    'w-full transition-all',
                    valStatus === 1
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : (valStatus ?? 0) >= 3
                          ? 'bg-red-600 hover:bg-red-700'
                          : '',
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

function FileInfoCard({
    name,
    meta,
    grade,
}: {
    name: string;
    meta?: string;
    grade?: number;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border p-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border">
                <FileText className="size-4.5 text-muted-foreground/60" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-xs leading-none font-bold">
                    {name}
                </span>
                {meta && (
                    <span className="mt-0.5 text-[10px] leading-none font-medium tracking-widest text-muted-foreground uppercase">
                        {meta}
                    </span>
                )}
                {grade != null && (
                    <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                            Calificación:
                        </span>
                        <span className="text-xs font-extrabold text-foreground">
                            {grade} / 20
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
