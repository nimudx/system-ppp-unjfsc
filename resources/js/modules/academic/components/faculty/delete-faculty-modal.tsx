import { useForm } from '@inertiajs/react';
import type { Faculty } from '@/modules/academic/types';
import { destroy } from '@/routes/academic/faculties';
import ConfirmDeleteDialog from '@/shared/components/confirm-delete-dialog';

interface Props {
    faculty: Faculty | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteFacultyModal({
    faculty,
    open,
    onOpenChange,
}: Props) {
    const { delete: destroyRequest, processing } = useForm();

    const handleConfirm = () => {
        if (!faculty) return;

        destroyRequest(destroy(faculty.id).url, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Eliminar Facultad"
            description={
                <>
                    ¿Estás seguro de que deseas eliminar la facultad{' '}
                    <span className="font-bold text-foreground">
                        {faculty?.name}
                    </span>
                    ? Esta acción no se puede deshacer.
                </>
            }
            confirmLabel="Eliminar Facultad"
            processing={processing}
            onConfirm={handleConfirm}
        />
    );
}
