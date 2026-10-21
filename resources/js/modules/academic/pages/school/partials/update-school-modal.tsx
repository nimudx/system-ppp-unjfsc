import { useForm } from '@inertiajs/react';
import type { FormEvent} from 'react';
import { useEffect } from 'react';
import type { Faculty, School } from '@/modules/academic/types';
import { update } from '@/routes/academic/schools';
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

interface Props {
    school: School | null;
    faculties: Faculty[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UpdateSchoolModal({ school, faculties, open, onOpenChange }: Props) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: '',
        faculty_id: '',
        status: true,
    });

    useEffect(() => {
        if (school) {
            setData({
                name: school.name,
                faculty_id: school.faculty_id.toString(),
                status: school.status === 1,
            });
        }
    }, [school]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!school) return;

        patch(update({ faculty: Number(data.faculty_id), school: school.id }).url, {
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
                        <DialogTitle>Editar Escuela</DialogTitle>
                        <DialogDescription>
                            Modifique los detalles de la escuela profesional.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-faculty_id">Facultad</Label>
                            <Select
                                value={data.faculty_id}
                                onValueChange={(value) => setData('faculty_id', value)}
                            >
                                <SelectTrigger id="edit-faculty_id" className={errors.faculty_id ? 'border-destructive' : ''}>
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
                            <Label htmlFor="edit-name">Nombre de la Escuela</Label>
                            <Input
                                id="edit-name"
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
                                <Label htmlFor="edit-status" className="cursor-pointer text-base">
                                    Estado Activo
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Permite que la escuela sea seleccionada en otros módulos.
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
                            {processing ? 'Actualizando...' : 'Actualizar Escuela'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
