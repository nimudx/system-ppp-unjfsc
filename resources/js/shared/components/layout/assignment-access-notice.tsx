import { usePage } from '@inertiajs/react';
import { Eye, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';

function AssignmentAccessNoticeDialog() {
    const { academic } = usePage().props;
    const [isOpen, setIsOpen] = useState(academic?.accessStatus === 3);

    // Detectamos cambios en la asignación seleccionada o en su estado de acceso

    const handleClose = () => setIsOpen(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="rounded-2xl border-blue-500/20 bg-background/95 shadow-2xl backdrop-blur-sm sm:max-w-[450px]">
                <DialogHeader className="space-y-3 text-left">
                    <div className="mb-2 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                            <Eye className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                Acceso en Modo Lectura
                            </DialogTitle>
                            <DialogDescription className="font-medium text-blue-600 dark:text-blue-400">
                                Restricción de Gestión Académica
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4 text-sm leading-relaxed text-muted-foreground">
                    <div className="flex gap-3 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                        <AlertCircle className="h-5 w-5 shrink-0 text-blue-500" />
                        <p className="text-blue-700 dark:text-blue-300">
                            Tu acceso ha sido configurado como{' '}
                            <span className="font-bold underline">
                                Solo Lectura
                            </span>{' '}
                            por el administrador del sistema.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-muted/50 p-4">
                        <p className="mb-2 text-xs font-semibold tracking-wider text-foreground uppercase">
                            ¿Qué significa esto?
                        </p>
                        <ul className="space-y-2 text-xs">
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                Puedes navegar y revisar todos tus registros
                                actuales.
                            </li>
                            <li className="flex items-center gap-2 text-red-500/80">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                No puedes subir documentos ni realizar nuevas
                                solicitudes.
                            </li>
                            <li className="flex items-center gap-2 text-red-500/80">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                La edición de datos existentes está bloqueada.
                            </li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleClose}
                        className="w-full rounded-xl bg-blue-600 py-6 text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
                    >
                        Entendido, continuar revisando
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function AssignmentAccessNotice() {
    const { academic } = usePage().props;
    return (
        <AssignmentAccessNoticeDialog
            key={
                String(academic?.selectedAssignmentId) +
                ':' +
                String(academic?.accessStatus)
            }
        />
    );
}
