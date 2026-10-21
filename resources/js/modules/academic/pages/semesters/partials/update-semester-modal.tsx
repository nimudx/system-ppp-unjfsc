import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
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
import { update } from '@/routes/academic/semesters';

import type { Semester } from '@/shared/types';

interface Props {
    semester: Semester | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UpdateSemesterModal({
    semester,
    open,
    onOpenChange,
}: Props) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        cycle: semester?.cycle || '',
    });

    // Update form data when semester changes
    if (semester && data.cycle !== semester.cycle && !processing) {
        setData('cycle', semester.cycle);
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!semester) return;

        patch(update(semester.id).url, {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Editar Semestre</DialogTitle>
                        <DialogDescription>
                            Actualiza el ciclo académico para el semestre{' '}
                            {semester?.code}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Código (No editable)</Label>
                            <Input
                                id="code"
                                value={semester?.code || ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cycle">Ciclo Académico</Label>
                            <Input
                                id="cycle"
                                value={data.cycle}
                                onChange={(e) =>
                                    setData('cycle', e.target.value)
                                }
                                placeholder="Ej: Ciclo 2024-I"
                                required
                            />
                            {errors.cycle && (
                                <p className="text-sm text-destructive">
                                    {errors.cycle}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
