import { useForm, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
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

interface PendingRequest {
    id: number;
    type: string;
    reason: string;
    justification: string | null;
    approval_status: number;
    created_at: string;
}

interface Props {
    assignment: Assignment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const ACTION_LABELS: Record<string, string> = {
    DELETE_ASSIGNMENT: 'Eliminar Asignación',
    DISABLE_ASSIGNMENT: 'Deshabilitar (Solo Lectura)',
    ENABLE_ASSIGNMENT: 'Habilitar Acceso',
};

function PendingRequestModalContent({
    assignment,
    open,
    onOpenChange,
    onSuccess,
}: Props) {
    const { role } = usePage().props;
    const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(
        null,
    );
    const [loading, setLoading] = useState(true);

    const isAdmin = role === 1 || role === 2;

    const { data, setData, patch, processing, errors, reset } = useForm({
        approval_status: '',
        justification: '',
    });

    // Fetch the pending request when the modal opens
    useEffect(() => {
        if (open && assignment) {
            fetch(assignments.api.requests.get.url(assignment.id))
                .then((res) => res.json())
                .then((json) => {
                    setPendingRequest(json.data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [open, assignment]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!pendingRequest) return;

        patch(assignments.api.requests.status.url(pendingRequest.id), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        if (!pendingRequest) return;

        // Set form data for cancellation, then submit
        setData('approval_status', '3');
        setData('justification', 'Solicitud cancelada por el usuario.');

        patch(assignments.api.requests.status.url(pendingRequest.id), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                onSuccess?.();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[475px]">
                <DialogHeader>
                    <DialogTitle>Solicitud Pendiente</DialogTitle>
                    <DialogDescription>
                        Revise los detalles de la solicitud de gestión para este
                        usuario.
                    </DialogDescription>
                </DialogHeader>

                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                            Cargando solicitud...
                        </span>
                    </div>
                )}

                {!loading && !pendingRequest && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        No se encontró ninguna solicitud pendiente.
                    </div>
                )}

                {!loading && pendingRequest && (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            {/* User info */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Usuario
                                </Label>
                                <p className="font-medium">
                                    {assignment?.user.person.surnames}{' '}
                                    {assignment?.user.person.names}
                                </p>
                            </div>

                            {/* Request type */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Acción Solicitada
                                </Label>
                                <p className="font-medium text-orange-600">
                                    {ACTION_LABELS[pendingRequest.type] ||
                                        pendingRequest.type}
                                </p>
                            </div>

                            {/* Sender reason */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Motivo (Solicitante)
                                </Label>
                                <p className="rounded-md bg-muted p-2 text-sm">
                                    {pendingRequest.reason}
                                </p>
                            </div>

                            {/* Admin: approve/reject */}
                            {isAdmin && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="approval_status">
                                            Decisión
                                        </Label>
                                        <Select
                                            value={data.approval_status}
                                            onValueChange={(value: string) =>
                                                setData(
                                                    'approval_status',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger id="approval_status">
                                                <SelectValue placeholder="Seleccione una decisión" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">
                                                    Aprobar Solicitud
                                                </SelectItem>
                                                <SelectItem value="3">
                                                    Rechazar Solicitud
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.approval_status && (
                                            <p className="text-sm font-medium text-destructive">
                                                {errors.approval_status}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="justification">
                                            Justificación (Revisor)
                                        </Label>
                                        <textarea
                                            id="justification"
                                            value={data.justification}
                                            onChange={(e) =>
                                                setData(
                                                    'justification',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Escriba su justificación..."
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        {errors.justification && (
                                            <p className="text-sm font-medium text-destructive">
                                                {errors.justification}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                            >
                                Cerrar
                            </Button>

                            {/* Non-admin: only cancel */}
                            {!isAdmin && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleCancel}
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Cancelando...'
                                        : 'Cancelar Solicitud'}
                                </Button>
                            )}

                            {/* Admin: submit decision */}
                            {isAdmin && (
                                <Button
                                    type="submit"
                                    disabled={
                                        processing || !data.approval_status
                                    }
                                >
                                    {processing
                                        ? 'Procesando...'
                                        : 'Confirmar Decisión'}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default function PendingRequestModal(props: Props) {
    return props.open ? (
        <PendingRequestModalContent
            key={props.assignment?.id ?? 'none'}
            {...props}
        />
    ) : null;
}
