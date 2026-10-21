import { router } from '@inertiajs/react';
import { RotateCcw, ShieldAlert, History } from 'lucide-react';
import type { Semester } from '@/modules/academic/types';
import { back } from '@/routes/academic/semesters';
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
    semester: Semester | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function BackSemesterModal({
    semester,
    open,
    onOpenChange,
}: Props) {
    const handleBack = () => {
        if (!semester) return;
        router.post(
            back(semester.id).url,
            {},
            {
                onSuccess: () => onOpenChange(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-destructive/20 shadow-lg shadow-destructive/10 sm:max-w-125">
                <DialogHeader>
                    <div className="mb-2 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-500">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                Retroceder Semestre Académico
                            </DialogTitle>
                            <DialogDescription className="font-medium whitespace-nowrap text-red-600 dark:text-red-500">
                                ¡Atención! Esta acción eliminará el registro
                                actual.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        Está intentando retroceder al semestre anterior al{' '}
                        <span className="font-bold text-foreground">
                            {semester?.code}
                        </span>
                        . Tenga en cuenta las siguientes{' '}
                        <span className="font-bold text-red-600 uppercase underline">
                            condiciones críticas
                        </span>
                        :
                    </p>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>
                            El semestre{' '}
                            <span className="font-bold text-foreground">
                                Actual
                            </span>{' '}
                            será eliminado permanentemente de la base de datos.
                        </li>
                        <li>
                            Esta acción{' '}
                            <span className="font-bold text-red-600 italic">
                                SOLO
                            </span>{' '}
                            se permite si no existen asignaciones, grupos o
                            registros vinculados al semestre actual.
                        </li>
                        <li>
                            El semestre previo volverá a tener el estado{' '}
                            <span className="font-bold text-emerald-500 uppercase">
                                Activo
                            </span>
                            .
                        </li>
                    </ul>

                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                        <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-red-700 uppercase dark:text-red-400">
                            <History className="h-3 w-3" /> Impacto de Auditoría
                        </p>
                        <p className="mt-1 text-xs text-red-600/80 dark:text-red-500/80">
                            Si el sistema detecta registros previos vinculados
                            (Asignaciones, Prácticas), la acción será bloqueada
                            por el servidor por seguridad de la integridad de
                            datos.
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
                        variant="destructive"
                        className="shadow-md"
                        onClick={handleBack}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" /> Sí, Retroceder
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
