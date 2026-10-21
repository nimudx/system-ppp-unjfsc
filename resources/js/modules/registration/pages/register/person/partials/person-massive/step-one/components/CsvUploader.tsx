import { UploadCloud } from 'lucide-react';
import type { CsvRow, CsvValidationError } from '@/modules/registration/types';
import { parseCSV, validateRows } from '../csv.utils';

interface CsvUploaderProps {
    onChange: (result: {
        file: File;
        rows: CsvRow[];
        valid: CsvRow[];
        errors: CsvValidationError[];
    }) => void;
}

export function CsvUploader({ onChange }: CsvUploaderProps) {
    const handleFile = async (file: File) => {
        const rows = await parseCSV(file);
        const { valid, errors } = validateRows(rows);

        onChange({
            file,
            rows,
            valid,
            errors,
        });
    };

    return (
        <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors hover:bg-muted/30"
            onClick={() => document.getElementById('fileInput')?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
            }}
        >
            <UploadCloud className="mb-4 h-10 w-10 text-muted-foreground" />

            <p className="text-sm font-medium">Arrastra tu archivo CSV aquí</p>
            <p className="mt-1 text-xs text-muted-foreground">
                o haz click para seleccionar
            </p>

            <input
                id="fileInput"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />
        </div>
    );
}
