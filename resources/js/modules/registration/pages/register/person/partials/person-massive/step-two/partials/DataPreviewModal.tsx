import type { CsvRow } from '@/modules/registration/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/shared/components/ui/dialog';
import { CsvPreview } from '../../step-one/components/CsvPreview';

interface DataPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: CsvRow[];
}

export function DataPreviewModal({
    open,
    onOpenChange,
    data,
}: DataPreviewModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] max-w-[90%] flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Vista Previa de Datos</DialogTitle>
                    <DialogDescription>
                        Lista de registros que serán procesados en la carga
                        masiva.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 flex-1 overflow-y-auto pr-2">
                    <CsvPreview data={data} errors={[]} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
