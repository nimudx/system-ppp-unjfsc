import { DocumentViewer } from '@/modules/documents';
import type { DocumentRequirement } from '@/modules/documents';

interface DocumentFormProps {
    requirement: DocumentRequirement;
    tempFile: File | null;
    previewUrl: string | null;
    canUpload: boolean;
    onUpload: (file: File) => void;
    previewEnabled: boolean;
}

export default function DocumentForm({
    requirement,
    tempFile,
    previewUrl,
    canUpload,
    onUpload,
    previewEnabled,
}: DocumentFormProps) {
    // Preparamos el currentFile inyectando el tempFile si existe (para el DocumentViewer)
    const viewerFile = {
        ...requirement,
        latest: tempFile
            ? { path: previewUrl, name: tempFile.name }
            : requirement?.latest,
    };

    return (
        <div className="relative flex h-full w-full flex-1 animate-in flex-col overflow-hidden duration-500 zoom-in-95 fade-in">
            {/* Visor de Documento */}
            <div className="relative flex-1 overflow-auto bg-muted/10">
                <DocumentViewer
                    currentFile={viewerFile}
                    canUpload={canUpload}
                    onUpload={onUpload}
                    previewEnabled={previewEnabled}
                    maxSizeMB={2}
                />
            </div>
        </div>
    );
}
