import { useForm } from '@inertiajs/react';
import type { InternshipGroup } from '@/modules/supervision';
import groups from '@/routes/academic/groups';
import ConfirmDeleteDialog from '@/shared/components/confirm-delete-dialog';

interface Props {
    group: InternshipGroup | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function DeleteGroupModal({
    group,
    open,
    onOpenChange,
    onSuccess,
}: Props) {
    const { delete: destroyRequest, processing } = useForm();

    const handleConfirm = () => {
        if (!group) return;

        destroyRequest(groups.delete(group.id).url, {
            onSuccess: () => {
                onOpenChange(false);
                if (onSuccess) onSuccess();
            },
        });
    };

    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Eliminar Grupo de Prácticas"
            description={
                <>
                    ¿Estás seguro de que deseas eliminar el grupo{' '}
                    <span className="font-bold text-foreground">
                        {group?.name}
                    </span>
                    ? Esta acción no se puede deshacer y solo es posible si el
                    grupo no tiene estudiantes asignados.
                </>
            }
            confirmLabel="Eliminar Grupo"
            processing={processing}
            onConfirm={handleConfirm}
        />
    );
}
