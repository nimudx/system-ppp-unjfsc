import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { store } from '@/routes/academic/faculties';
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
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateFacultyModal({ open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        status: true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(store().url, {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Nueva Facultad</DialogTitle>
                        <DialogDescription>
                            Ingresa el nombre de la nueva facultad y define su estado inicial.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre de la Facultad</Label>
                            <Input
                                id="name"
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
                                <Label htmlFor="status" className="cursor-pointer text-base">
                                    Estado Activo
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Habilita o deshabilita la facultad en el sistema.
                                </p>
                            </div>
                            <Switch
                                id="status"
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
                            {processing ? 'Creando...' : 'Crear Facultad'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
