import { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { store } from '@/routes/academic/schools';
import type { Faculty } from '@/shared/types';

interface Props {
    faculties: Faculty[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateSchoolModal({ faculties, open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        faculty_id: '',
        status: true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post(store({ faculty: Number(data.faculty_id) }).url, {
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
                        <DialogTitle>Registrar Nueva Escuela</DialogTitle>
                        <DialogDescription>
                            Ingrese los detalles para registrar una nueva escuela profesional.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="faculty_id">Facultad</Label>
                            <Select
                                value={data.faculty_id}
                                onValueChange={(value) => setData('faculty_id', value)}
                            >
                                <SelectTrigger id="faculty_id" className={errors.faculty_id ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Seleccione una facultad" />
                                </SelectTrigger>
                                <SelectContent>
                                    {faculties.map((faculty) => (
                                        <SelectItem key={faculty.id} value={faculty.id.toString()}>
                                            {faculty.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.faculty_id && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.faculty_id}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre de la Escuela</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej. Ingeniería de Sistemas"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && (
                                <p className="text-xs font-medium text-destructive">
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
                                    Permite que la escuela sea seleccionada en otros módulos.
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
                            {processing ? 'Registrando...' : 'Registrar Escuela'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
