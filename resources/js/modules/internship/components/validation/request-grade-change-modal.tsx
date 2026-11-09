import { router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import internship from '@/routes/academic/internship';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface Props {
    internshipId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

function RequestGradeChangeModalContent({
    internshipId,
    open,
    onOpenChange,
    onSuccess,
}: Props) {
    const [newGrade, setNewGrade] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const url = internship.gradeChangeRequest.url(internshipId);

        router.post(
            url,
            {
                new_grade: newGrade,
                reason: reason,
            },
            {
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
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Solicitar Cambio de Nota</DialogTitle>
                        <DialogDescription>
                            Envíe una justificación para solicitar el cambio de
                            calificación final.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="new_grade">
                                Nueva Calificación
                            </Label>
                            <Input
                                id="new_grade"
                                type="number"
                                min="0"
                                max="20"
                                step="0.01"
                                placeholder="Ej. 18.0"
                                value={newGrade}
                                onChange={(e) => setNewGrade(e.target.value)}
                            />
                            {errors.new_grade && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.new_grade}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="reason">
                                Motivo / Justificación
                            </Label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Describa por qué es necesario corregir esta nota..."
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.reason && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.reason}
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
                        <Button
                            type="submit"
                            disabled={isSubmitting || !newGrade || !reason}
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function RequestGradeChangeModal(props: Props) {
    return props.open ? (
        <RequestGradeChangeModalContent key={props.internshipId} {...props} />
    ) : null;
}
