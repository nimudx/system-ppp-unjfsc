import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import groups from '@/routes/academic/groups';

interface Props {
    group: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function DeleteGroupModal({ group, open, onOpenChange, onSuccess }: Props) {
    const { delete: destroyRequest, processing } = useForm();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!group) return;

        destroyRequest(groups.delete(group.id).url, {
            onSuccess: () => {
                onOpenChange(false);
                if (onSuccess) onSuccess();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Eliminar Grupo de Prácticas</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que deseas eliminar el grupo{' '}
                        <span className="font-bold text-foreground">
                            {group?.name}
                        </span>
                        ? Esta acción no se puede deshacer y solo es posible si el grupo no tiene estudiantes asignados.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
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
                            variant="destructive"
                            disabled={processing}
                        >
                            {processing ? 'Eliminando...' : 'Eliminar Facultad'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
