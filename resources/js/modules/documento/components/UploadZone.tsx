import { UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UploadZoneProps {
    code?: string;
    onUpload: (file: File) => void;
}

export default function UploadZone({ code, onUpload }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error(
                'El archivo excede el tamaño máximo permitido de 10MB.',
            );
            return;
        }
        onUpload(file);
    };

    return (
        <div className="w-full max-w-md">
            <label
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFile(file);
                }}
                className={`flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 bg-muted/30 hover:bg-muted/50'
                }`}
            >
                <div className="flex flex-col items-center justify-center px-4 pt-5 pb-6 text-center">
                    <div className="mb-4 rounded-full bg-background p-3 shadow-sm">
                        <UploadCloud
                            className={`size-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                    </div>
                    <p className="mb-1 text-sm font-semibold">
                        Haz clic para subir o arrastra tu archivo
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Solo archivos PDF (Máx. 10MB)
                    </p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                />
            </label>
        </div>
    );
}
