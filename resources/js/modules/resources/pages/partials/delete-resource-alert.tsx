import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import resource from "@/routes/resource";

interface ResourceItem {
    id: number;
    name: string;
}

interface DeleteResourceAlertProps {
    fres: ResourceItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export function DeleteResourceAlert({ fres, isOpen, onClose }: DeleteResourceAlertProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!fres) return;
        setIsDeleting(true);
        router.delete(resource.destroy.url(fres.id), {
            onSuccess: () => {
                onClose();
            },
            onError: () => {
                toast.error('Ocurrió un error al eliminar el recurso');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el recurso
                        <strong className="text-foreground ml-1">{fres?.name}</strong> y removerá el archivo de nuestros servidores.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="ghost" disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        variant="destructive"
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? "Eliminando..." : "Sí, eliminar recurso"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
