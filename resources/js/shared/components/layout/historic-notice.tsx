import { usePage } from '@inertiajs/react';
import { Lock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';

function HistoricNoticeDialog() {
    const { academic } = usePage().props;
    const historicMode = academic?.historicMode;
    const currentSemester = academic?.currentSemester;
    const assignmentId = academic?.selectedAssignmentId;
    const sessionToken = academic?.sessionToken;
    const [open, setOpen] = useState(() => {
        if (
            !historicMode ||
            !assignmentId ||
            !sessionToken ||
            typeof window === 'undefined'
        )
            return false;
        return !sessionStorage.getItem(
            'notice_' + sessionToken + '_' + assignmentId,
        );
    });

    const handleClose = () => {
        if (assignmentId && sessionToken) {
            const key = `notice_${sessionToken}_${assignmentId}`;
            sessionStorage.setItem(key, 'true');
        }
        setOpen(false);
    };

    if (!historicMode) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="border-orange-500/20 shadow-lg shadow-orange-500/10 sm:max-w-[450px]">
                <DialogHeader>
                    <div className="mb-2 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-500">
                            <Lock className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                Periodo Finalizado
                            </DialogTitle>
                            <DialogDescription className="font-medium text-orange-600 dark:text-orange-500">
                                Ciclo Académico {currentSemester?.code}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4 text-sm leading-relaxed text-muted-foreground">
                    <div className="flex gap-3 rounded-lg border border-orange-500/10 bg-orange-500/5 p-4">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-orange-500" />
                        <p className="text-orange-200/80">
                            Has ingresado a un semestre que ya ha sido{' '}
                            <span className="font-bold text-orange-500">
                                finalizado
                            </span>
                            . El sistema se encuentra en modo{' '}
                            <span className="font-bold underline">
                                Solo Lectura
                            </span>
                            .
                        </p>
                    </div>

                    <ul className="list-disc space-y-2 pl-5 text-xs italic">
                        <li>
                            No podrás registrar nuevas asistencias o documentos.
                        </li>
                        <li>
                            Las modificaciones a registros existentes están
                            bloqueadas.
                        </li>
                        <li>
                            Si necesitas realizar un cambio urgente, contacta al
                            administrador.
                        </li>
                    </ul>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleClose}
                        className="w-full bg-orange-600 text-white hover:bg-orange-700"
                    >
                        Entendido, continuar en modo lectura
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function HistoricNotice() {
    const { academic } = usePage().props;
    return (
        <HistoricNoticeDialog
            key={
                String(academic?.sessionToken) +
                ':' +
                String(academic?.selectedAssignmentId) +
                ':' +
                String(academic?.historicMode)
            }
        />
    );
}
