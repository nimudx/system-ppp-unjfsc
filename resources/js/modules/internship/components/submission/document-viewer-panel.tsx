import { FileText } from 'lucide-react';

import { DocumentViewer } from '@/modules/documents';
import type { DocumentRequirement } from '@/modules/documents';

import { Spinner } from '@/shared/components/ui/spinner';

interface DocumentViewerPanelProps {
    currentRequirement: DocumentRequirement | null;
    tempFile: File | null;
    previewUrl: string | null;
    uploading: boolean;
    canUpload: boolean;
    onUpload: (file: File) => void;
    previewEnabled: boolean;
}

export function DocumentViewerPanel({
    currentRequirement,
    tempFile,
    previewUrl,
    uploading,
    canUpload,
    onUpload,
    previewEnabled,
}: DocumentViewerPanelProps) {
    return (
        <div className="relative flex min-h-[500px] w-full flex-1 flex-col overflow-hidden rounded-xl border bg-card">
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

            <div className="flex flex-row items-center justify-between border-b bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/20 bg-primary/5">
                        <FileText className="size-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-sm leading-none font-semibold tracking-tight">
                            {currentRequirement?.title ??
                                'Selecciona un documento'}
                        </h3>
                        <p className="mt-1 text-[11px] font-bold tracking-widest text-muted-foreground uppercase opacity-60">
                            {tempFile
                                ? 'Vista previa local'
                                : currentRequirement?.latest
                                  ? 'Versión cargada'
                                  : 'Sin archivo'}
                        </p>
                    </div>
                </div>
            </div>

            <DocumentViewer
                currentFile={{
                    ...currentRequirement,
                    latest: tempFile
                        ? { path: previewUrl, name: tempFile.name }
                        : currentRequirement?.latest,
                }}
                canUpload={canUpload}
                onUpload={onUpload}
                previewEnabled={previewEnabled}
            />
        </div>
    );
}
