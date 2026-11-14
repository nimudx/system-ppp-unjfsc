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
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import type { VacancyCloseReason, VacancyDetail } from '../types';
import { CLOSE_REASONS } from '../utils';

export default function CloseVacancyDialog({
    vacancy,
    open,
    onOpenChange,
    onConfirm,
    processing = false,
}: {
    vacancy: VacancyDetail | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: VacancyCloseReason) => void;
    processing?: boolean;
}) {
    const [reason, setReason] = useState<VacancyCloseReason>('filled');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cerrar vacante</DialogTitle>
                    <DialogDescription>
                        {vacancy
                            ? `La vacante "${vacancy.title}" dejará de estar visible para los docentes titulares.`
                            : 'La vacante dejará de estar visible para los docentes titulares.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-2 py-2">
                    <Label htmlFor="close-reason">Motivo de cierre</Label>
                    <Select
                        value={reason}
                        onValueChange={(value) =>
                            setReason(value as VacancyCloseReason)
                        }
                    >
                        <SelectTrigger id="close-reason">
                            <SelectValue placeholder="Selecciona un motivo" />
                        </SelectTrigger>
                        <SelectContent>
                            {CLOSE_REASONS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => onConfirm(reason)}
                        disabled={processing}
                    >
                        {processing ? 'Cerrando...' : 'Cerrar vacante'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
