import { parseCSV, validateRows } from "../csv.utils";

import { UploadCloud } from "lucide-react";

interface CsvUploaderProps {
    onChange: (result: {
        file: File;
        rows: any[];
        valid: any[];
        errors: any[];
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
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center hover:bg-muted/30 transition-colors cursor-pointer"
            onClick={() => document.getElementById("fileInput")?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
            }}
        >
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />

            <p className="text-sm font-medium">
                Arrastra tu archivo CSV aquí
            </p>
            <p className="text-xs text-muted-foreground mt-1">
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