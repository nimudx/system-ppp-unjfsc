import { router, useForm } from '@inertiajs/react';
import type { FormEvent} from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';

interface RequestModel {
    id: number;
    payload: {
        old_grade: number;
        new_grade: number;
    };
    reason: string;
    senderable: {
        authenticable: {
            names: string;
            surnames: string;
        }
    }
}

interface Props {
    request: RequestModel | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function PendingGradeChangeModal({ request, open, onOpenChange, onSuccess }: Props) {
    const [approvalStatus, setApprovalStatus] = useState('');
    const [justification, setJustification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (open) {
            setApprovalStatus('');
            setJustification('');
            setErrors({});
        }
    }, [open]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!request?.id) return;

        router.patch(`/requests/${request.id}/management-status`, {
            approval_status: approvalStatus,
            justification: justification,
        }, {
            onBefore: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onSuccess: () => {
                onOpenChange(false);
                if (onSuccess) onSuccess();
            },
            onError: (err) => {
                setErrors(err);
                if (err.message) toast.error(err.message);
                if (err.error) toast.error(err.error);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Revisar Solicitud de Cambio de Nota</DialogTitle>
                        <DialogDescription>
                            El docente {request?.senderable?.authenticable?.names} ha solicitado modificar la calificación final.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-md border">
                            <div>
                                <Label className="text-xs text-muted-foreground uppercase">Nota Actual</Label>
                                <p className="text-xl font-bold line-through text-destructive">{request?.payload?.old_grade}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground uppercase">Nueva Nota</Label>
                                <p className="text-xl font-bold text-green-600">{request?.payload?.new_grade}</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                Motivo del Docente
                            </Label>
                            <p className="text-sm border-l-2 border-primary pl-3 italic text-foreground/80">
                                "{request?.reason}"
                            </p>
                        </div>

                        <div className="grid gap-2 mt-2">
                            <Label htmlFor="approval_status">Veredicto</Label>
                            <select
                                id="approval_status"
                                value={approvalStatus}
                                onChange={(e) => setApprovalStatus(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="" disabled>Seleccione una opción</option>
                                <option value="1">Aprobar Solicitud</option>
                                <option value="3">Rechazar Solicitud</option>
                            </select>
                            {errors.approval_status && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.approval_status}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="justification">Comentario / Respuesta</Label>
                            <textarea
                                id="justification"
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="Escriba un comentario sobre su decisión..."
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.justification && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.justification}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !approvalStatus || !justification}>
                            {isSubmitting ? 'Enviando...' : 'Confirmar Veredicto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
