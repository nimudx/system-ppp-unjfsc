import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect } from 'react';
import assignments from '@/routes/academic/assignments';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';

interface Assignment {
    id: number;
    access_status: number;
    review_status: number;
    user: {
        person: {
            names: string;
            surnames: string;
        };
    };
}

interface Props {
    assignment: Assignment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function ManageAssignmentModal({
    assignment,
    open,
    onOpenChange,
    onSuccess,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        action: '',
        reason: '',
    });

    const isReadOnly = assignment?.access_status === 3;
    const isReview = assignment?.review_status === 1;

    useEffect(() => {
        if (open) {
            reset();
            // Default action based on current status
            if (isReadOnly) {
                setData('action', '3'); // Habilitar
            } else {
                setData('action', '2'); // Deshabilitar
            }
        }
    }, [open, isReadOnly, reset, setData]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!assignment) return;

        post(assignments.manage(assignment.id).url, {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                onSuccess?.();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Gestionar Asignación</DialogTitle>
                        <DialogDescription>
                            Configure el estado de la asignación para el usuario
                            seleccionado.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Usuario
                            </Label>
                            <p className="font-medium">
                                {assignment?.user.person.surnames}{' '}
                                {assignment?.user.person.names}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="action">Seleccione Acción</Label>
                            <Select
                                value={data.action}
                                onValueChange={(value: string) =>
                                    setData('action', value)
                                }
                            >
                                <SelectTrigger id="action">
                                    <SelectValue placeholder="Seleccione una acción" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isReadOnly || isReview ? (
                                        <SelectItem value="3">
                                            Habilitar Acceso
                                        </SelectItem>
                                    ) : (
                                        <>
                                            <SelectItem value="2">
                                                Deshabilitar (Solo Lectura)
                                            </SelectItem>
                                            <SelectItem value="1">
                                                Eliminar Asignación
                                            </SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.action && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.action}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="reason">
                                Motivo / Justificación
                            </Label>
                            <textarea
                                id="reason"
                                value={data.reason}
                                onChange={(e) =>
                                    setData('reason', e.target.value)
                                }
                                placeholder="Describa el motivo de esta acción..."
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
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing || !data.action || !data.reason
                            }
                        >
                            {processing ? 'Enviando...' : 'Enviar Solicitud'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
