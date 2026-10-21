import { usePage } from '@inertiajs/react';
import { Lock, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

export function HistoricNotice() {
    const { academic } = usePage().props as any;
    const historicMode = academic?.historicMode;
    const currentSemester = academic?.currentSemester;
    const assignmentId = academic?.selectedAssignmentId;
    const sessionToken = academic?.sessionToken;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (historicMode && assignmentId && sessionToken) {
            const key = `notice_${sessionToken}_${assignmentId}`;
            const hasSeenNotice = sessionStorage.getItem(key);
            if (!hasSeenNotice) {
                setOpen(true);
            }
        }
    }, [historicMode, assignmentId, sessionToken]);

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
                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-500">
                            <Lock className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Periodo Finalizado</DialogTitle>
                            <DialogDescription className="text-orange-600 dark:text-orange-500 font-medium">
                                Ciclo Académico {currentSemester?.code}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4 text-sm text-muted-foreground leading-relaxed">
                    <div className="flex gap-3 p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
                        <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                        <p className="text-orange-200/80">
                            Has ingresado a un semestre que ya ha sido <span className="text-orange-500 font-bold">finalizado</span>.
                            El sistema se encuentra en modo <span className="font-bold underline">Solo Lectura</span>.
                        </p>
                    </div>

                    <ul className="list-disc pl-5 space-y-2 text-xs italic">
                        <li>No podrás registrar nuevas asistencias o documentos.</li>
                        <li>Las modificaciones a registros existentes están bloqueadas.</li>
                        <li>Si necesitas realizar un cambio urgente, contacta al administrador.</li>
                    </ul>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleClose}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        Entendido, continuar en modo lectura
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
