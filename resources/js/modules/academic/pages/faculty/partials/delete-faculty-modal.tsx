import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type { Faculty } from '@/modules/academic/types';
import { destroy } from '@/routes/academic/faculties';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';

interface Props {
    faculty: Faculty | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteFacultyModal({ faculty, open, onOpenChange }: Props) {
    const { delete: destroyRequest, processing } = useForm();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!faculty) return;

        destroyRequest(destroy(faculty.id).url, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Eliminar Facultad</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que deseas eliminar la facultad{' '}
                        <span className="font-bold text-foreground">
                            {faculty?.name}
                        </span>
                        ? Esta acción no se puede deshacer.
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
