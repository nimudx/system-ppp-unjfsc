import { useForm } from '@inertiajs/react';
import type { School } from '@/modules/academic/types';
import { destroy } from '@/routes/academic/schools';
import ConfirmDeleteDialog from '@/shared/components/confirm-delete-dialog';

interface Props {
    school: School | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteSchoolModal({
    school,
    open,
    onOpenChange,
}: Props) {
    const { delete: destroyRequest, processing } = useForm();

    const handleConfirm = () => {
        if (!school) return;

        destroyRequest(destroy(school.id).url, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Eliminar Escuela"
            description={
                <>
                    ¿Estás seguro de que deseas eliminar la escuela{' '}
                    <span className="font-bold text-foreground">
                        {school?.name}
                    </span>
                    ? Esta acción no se puede deshacer.
                </>
            }
            confirmLabel="Eliminar Escuela"
            processing={processing}
            onConfirm={handleConfirm}
        />
    );
}
