import { router } from '@inertiajs/react';
import { AlertTriangle, Power } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { close } from '@/routes/academic/semesters';

import type { Semester } from '@/shared/types';

interface Props {
    semester: Semester | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CloseSemesterModal({
    semester,
    open,
    onOpenChange,
}: Props) {
    const handleClose = () => {
        if (!semester) return;
        router.post(
            close(semester.id).url,
            {},
            {
                onSuccess: () => onOpenChange(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-orange-500/20 shadow-lg shadow-orange-500/10 sm:max-w-125">
                <DialogHeader>
                    <div className="mb-2 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-500">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                Finalizar Ciclo Académico
                            </DialogTitle>
                            <DialogDescription className="font-medium text-orange-600 dark:text-orange-500">
                                Esta acción es irreversible y tiene impacto
                                global.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        Está a punto de cerrar el semestre{' '}
                        <span className="font-bold text-foreground">
                            {semester?.code}
                        </span>
                        . Antes de continuar, asegúrese de lo siguiente:
                    </p>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>
                            Todos los usuarios han terminado de cargar sus
                            archivos y reportes.
                        </li>
                        <li>
                            Las validaciones y seguimientos de prácticas han
                            concluido.
                        </li>
                        <li>
                            No hay procesos de registro pendientes para este
                            periodo.
                        </li>
                    </ul>
                    <div className="mt-4 rounded-lg border border-border bg-muted p-4">
                        <p className="flex items-center gap-2 font-semibold text-foreground">
                            <Power className="h-4 w-4 text-emerald-500" /> ¿Qué
                            pasará después?
                        </p>
                        <p className="mt-1">
                            El sistema creará automáticamente el siguiente
                            semestre correlativo con estado{' '}
                            <span className="font-bold text-emerald-500 uppercase">
                                Activo
                            </span>
                            . Este semestre actual pasará a modo{' '}
                            <span className="font-bold">Lectura</span> para
                            todos los roles.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="default"
                        className="bg-orange-600 text-white shadow-orange-500/20 hover:bg-orange-700"
                        onClick={handleClose}
                    >
                        Entiendo los riesgos, Finalizar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
