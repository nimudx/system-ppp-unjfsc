import { useForm } from '@inertiajs/react';
import type { FormEvent} from 'react';
import { useEffect } from 'react';
import type { Faculty } from '@/modules/academic/types';
import { update } from '@/routes/academic/faculties';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';


interface Props {
    faculty: Faculty | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UpdateFacultyModal({ faculty, open, onOpenChange }: Props) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: faculty?.name || '',
        status: faculty?.status === 1,
    });

    useEffect(() => {
        if (faculty) {
            setData({
                name: faculty.name,
                status: faculty.status === 1,
            });
        }
    }, [faculty]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!faculty) return;

        patch(update(faculty.id).url, {
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
                        <DialogTitle>Editar Facultad</DialogTitle>
                        <DialogDescription>
                            Modifica el nombre o el estado de la facultad seleccionada.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nombre de la Facultad</Label>
                            <Input
                                id="edit-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej. Facultad de Ingeniería"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
                            <div className="space-y-0.5">
                                <Label htmlFor="edit-status" className="cursor-pointer text-base">
                                    Estado Activo
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Habilita o deshabilita la facultad en el sistema.
                                </p>
                            </div>
                            <Switch
                                id="edit-status"
                                checked={data.status}
                                onCheckedChange={(checked) => setData('status', checked)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
