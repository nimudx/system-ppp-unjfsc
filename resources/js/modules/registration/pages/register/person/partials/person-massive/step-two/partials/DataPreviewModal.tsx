import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import { CsvPreview } from "../../step-one/components/CsvPreview";

interface DataPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: any[];
}

export function DataPreviewModal({ open, onOpenChange, data }: DataPreviewModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90%] max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Vista Previa de Datos</DialogTitle>
                    <DialogDescription>
                        Lista de registros que serán procesados en la carga masiva.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 mt-4">
                    <CsvPreview data={data} errors={[]} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
