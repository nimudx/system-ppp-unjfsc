import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ResourceItem } from '@/modules/resources/types';
import resource from '@/routes/resource';
import ConfirmDeleteDialog from '@/shared/components/confirm-delete-dialog';

type ResourceItemSummary = Pick<ResourceItem, 'id' | 'name'>;

interface DeleteResourceAlertProps {
    fres: ResourceItemSummary | null;
    isOpen: boolean;
    onClose: () => void;
}

export function DeleteResourceAlert({
    fres,
    isOpen,
    onClose,
}: DeleteResourceAlertProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!fres) return;

        setIsDeleting(true);
        router.delete(resource.destroy.url(fres.id), {
            onSuccess: () => {
                onClose();
            },
            onError: () => {
                toast.error('Ocurrió un error al eliminar el recurso');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <ConfirmDeleteDialog
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            title="¿Estás completamente seguro?"
            description={
                <>
                    Esta acción no se puede deshacer. Esto eliminará
                    permanentemente el recurso
                    <strong className="ml-1 text-foreground">
                        {fres?.name}
                    </strong>{' '}
                    y removerá el archivo de nuestros servidores.
                </>
            }
            confirmLabel="Sí, eliminar recurso"
            processing={isDeleting}
            onConfirm={handleDelete}
        />
    );
}
