import { usePage } from '@inertiajs/react';
import { Eye, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter 
} from '@/shared/components/ui/dialog';

export function AssignmentAccessNotice() {
    const { academic } = usePage().props as any;
    const [isOpen, setIsOpen] = useState(false);

    // Detectamos cambios en la asignación seleccionada o en su estado de acceso
    useEffect(() => {
        if (academic?.accessStatus === 3) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [academic?.selectedAssignmentId, academic?.accessStatus]);

    const handleClose = () => setIsOpen(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[450px] border-blue-500/20 bg-background/95 backdrop-blur-sm shadow-2xl rounded-2xl">
                <DialogHeader className="space-y-3 text-left">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                            <Eye className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Acceso en Modo Lectura</DialogTitle>
                            <DialogDescription className="text-blue-600 dark:text-blue-400 font-medium">
                                Restricción de Gestión Académica
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4 text-sm text-muted-foreground leading-relaxed">
                    <div className="flex gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                        <p className="text-blue-700 dark:text-blue-300">
                            Tu acceso ha sido configurado como <span className="font-bold underline">Solo Lectura</span> por el administrador del sistema.
                        </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                        <p className="font-semibold text-foreground mb-2 text-xs uppercase tracking-wider">¿Qué significa esto?</p>
                        <ul className="space-y-2 text-xs">
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                Puedes navegar y revisar todos tus registros actuales.
                            </li>
                            <li className="flex items-center gap-2 text-red-500/80">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                No puedes subir documentos ni realizar nuevas solicitudes.
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-600/20 rounded-xl py-6"
                    >
                        Entendido, continuar revisando
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
