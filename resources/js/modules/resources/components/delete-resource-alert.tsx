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
        if (!fres || isDeleting) return;

        setIsDeleting(true);

        router.delete(resource.destroy.url(fres.id), {
            preserveScroll: true,

            onSuccess: () => {
                toast.success('Recurso eliminado correctamente.');
                onClose();
            },

            onError: () => {
                toast.error(
                    'No se pudo eliminar el recurso. Inténtalo nuevamente.',
                );
            },

            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <ConfirmDeleteDialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && !isDeleting) {
                    onClose();
                }
            }}
            title="¿Eliminar este recurso?"
            description={
                <>
                    Esta acción no se puede deshacer. Se eliminará
                    permanentemente el recurso
                    <strong className="ml-1 text-foreground">
                        {fres?.name}
                    </strong>{' '}
                    y se removerá su archivo de nuestros servidores.
                </>
            }
            confirmLabel="Sí, eliminar recurso"
            processing={isDeleting}
            onConfirm={handleDelete}
        />
    );
}
