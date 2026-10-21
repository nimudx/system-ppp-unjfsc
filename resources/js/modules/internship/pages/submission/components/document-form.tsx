import { useState } from 'react';
import { DocumentViewer } from '@/modules/documents';
import { Spinner } from '@/shared/components/ui/spinner';

interface DocumentFormProps {
    placementId: number;
    requirement: any;
    tempFile: File | null;
    previewUrl: string | null;
    canUpload: boolean;
    onUpload: (file: File) => void;
    previewEnabled: boolean;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    onClearTemp: () => void;
}

export default function DocumentForm({
    placementId,
    requirement,
    tempFile,
    previewUrl,
    canUpload,
    onUpload,
    previewEnabled,
}: DocumentFormProps) {
    const [uploading] = useState(false);

    // Preparamos el currentFile inyectando el tempFile si existe (para el DocumentViewer)
    const viewerFile = {
        ...requirement,
        latest: tempFile ? { path: previewUrl, name: tempFile.name } : requirement?.latest
    };

    return (
        <div className="flex-1 w-full flex flex-col h-full overflow-hidden relative animate-in fade-in zoom-in-95 duration-500">

            {uploading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Spinner className="animate-spin text-primary" />
                        <span className="text-xs font-medium">Subiendo documento...</span>
                    </div>
                </div>
            )}

            {/* Visor de Documento */}
            <div className="flex-1 overflow-auto bg-muted/10 relative">
                <DocumentViewer
                    currentFile={viewerFile}
                    canUpload={canUpload}
                    onUpload={onUpload}
                    previewEnabled={previewEnabled}
                />
            </div>
        </div>
    );
}
