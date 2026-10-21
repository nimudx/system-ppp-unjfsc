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
import { destroy } from '@/routes/academic/schools';
import type { School } from '@/shared/types';

interface Props {
    school: School | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteSchoolModal({ school, open, onOpenChange }: Props) {
    const { delete: destroyRequest, processing } = useForm();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!school) return;

        destroyRequest(destroy(school.id).url, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Eliminar Escuela</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar la escuela{' '}
                            <span className="font-bold text-foreground">
                                {school?.name}
                            </span>
                            ? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-4">
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
                            {processing ? 'Eliminando...' : 'Eliminar Escuela'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
