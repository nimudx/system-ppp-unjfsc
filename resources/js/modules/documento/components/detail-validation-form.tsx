import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Loader2,
    MessageSquare,
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { useState } from 'react';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';

interface Props {
    status: number | null;
}

export default function DetailValidationForm({ status }: Props) {
    const [valStatus, setValStatus] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (status === 1) {
        return (
            <div className="animate-in space-y-4 fade-in">
                <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                    <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                    <div>
                        <p className="mb-1 text-xs leading-none font-black text-green-900 uppercase">
                            Aprobado
                        </p>
                        <p className="text-[10px] leading-tight text-green-700">
                            Este componente ha sido validado correctamente.
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-full text-[10px] font-bold text-muted-foreground hover:bg-red-50 hover:text-red-500"
                    onClick={() => {}}
                >
                    Cambiar dictamen
                </Button>
            </div>
        );
    }

    return (
        <div className="animate-in space-y-5 duration-300 slide-in-from-right-2">
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setValStatus(1)}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all ${valStatus === 1 ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200'}`}
                >
                    <CheckCircle2 className="size-4" />
                    <span className="text-[10px] font-black uppercase">
                        Aprobar
                    </span>
                </button>
                <button
                    onClick={() => setValStatus(3)}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all ${valStatus === 3 ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200'}`}
                >
                    <AlertCircle className="size-4" />
                    <span className="text-[10px] font-black uppercase">
                        Observar
                    </span>
                </button>
            </div>

            <div className="space-y-1.5">
                <Label className="ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase opacity-70">
                    Observaciones
                </Label>
                <div className="relative">
                    <MessageSquare className="absolute top-2.5 left-2.5 size-4 text-muted-foreground/30" />
                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[120px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50/30 p-3 pl-10 text-xs transition-all placeholder:text-slate-300 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 focus:outline-none"
                        placeholder="Escribe el motivo del dictamen aquí..."
                    />
                </div>
            </div>

            <Button
                onClick={() => {}}
                disabled={
                    !valStatus || (valStatus === 3 && !comment) || isSubmitting
                }
                className={`w-full rounded-xl text-[11px] font-black shadow-lg transition-all ${valStatus === 1 ? 'bg-green-600 shadow-green-200 hover:bg-green-700' : valStatus === 3 ? 'bg-red-600 shadow-red-200 hover:bg-red-700' : 'bg-primary shadow-primary/20'}`}
            >
                {isSubmitting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                    <ArrowRight className="mr-2 size-4" />
                )}
                FINALIZAR REVISIÓN
            </Button>
        </div>
    );
}
