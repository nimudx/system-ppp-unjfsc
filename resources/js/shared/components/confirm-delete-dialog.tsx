import type { LucideIcon } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';

interface ConfirmDeleteDialogProps {
    /** Controla la visibilidad del diálogo. */
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    /** Permite texto enriquecido, por ejemplo el nombre del registro. */
    description: ReactNode;
    /** Acción que ejecuta la eliminación. */
    onConfirm: () => void;
    confirmLabel?: string;
    processingLabel?: string;
    cancelLabel?: string;
    /** Deshabilita las acciones mientras la petición está en curso. */
    processing?: boolean;
    /** Ícono opcional para reforzar el carácter destructivo de la acción. */
    icon?: LucideIcon;
    className?: string;
}

/**
 * Diálogo de confirmación reutilizable para acciones de eliminación.
 */
export default function ConfirmDeleteDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmLabel = 'Eliminar',
    processingLabel = 'Eliminando...',
    cancelLabel = 'Cancelar',
    processing = false,
    icon: Icon,
    className,
}: ConfirmDeleteDialogProps) {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (processing) {
            return;
        }

        onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn('sm:max-w-md', className)}>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        {Icon && (
                            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                <Icon className="size-5" />
                            </div>
                        )}
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={processing}
                            onClick={() => onOpenChange(false)}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={processing}
                        >
                            {processing ? processingLabel : confirmLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
