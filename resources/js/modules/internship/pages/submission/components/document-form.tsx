import { useState } from 'react';

import { DocumentViewer } from '@/modules/documents';
import type { DocumentRequirement } from '@/modules/documents/types';

import { Spinner } from '@/shared/components/ui/spinner';

interface DocumentFormProps {
    placementId?: number;
    requirement: DocumentRequirement;
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
        latest: tempFile
            ? { path: previewUrl, name: tempFile.name }
            : requirement?.latest,
    };

    return (
        <div className="relative flex h-full w-full flex-1 animate-in flex-col overflow-hidden duration-500 zoom-in-95 fade-in">
            {uploading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <Spinner className="animate-spin text-primary" />
                        <span className="text-xs font-medium">
                            Subiendo documento...
                        </span>
                    </div>
                </div>
            )}

            {/* Visor de Documento */}
            <div className="relative flex-1 overflow-auto bg-muted/10">
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
