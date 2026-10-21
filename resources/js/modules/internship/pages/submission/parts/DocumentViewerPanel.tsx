import DocumentViewer from "@/shared/components/document/DocumentViewer";
import { FileText } from "lucide-react";
import { Spinner } from "@/shared/components/ui/spinner";

interface DocumentViewerPanelProps {
    currentRequirement: any;
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
    previewEnabled
}: DocumentViewerPanelProps) {
    return (
        <div className="flex-1 w-full rounded-xl border bg-card flex flex-col min-h-[500px] overflow-hidden relative">
            {uploading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Spinner className="animate-spin text-primary" />
                        <span className="text-xs font-medium">Subiendo documento...</span>
                    </div>
                </div>
            )}

            <div className="flex flex-row items-center justify-between px-4 py-3 border-b bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-primary/5 border-primary/20">
                        <FileText className="size-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-sm font-semibold leading-none tracking-tight">
                            {currentRequirement?.title ?? "Selecciona un documento"}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-1 uppercase font-bold tracking-widest opacity-60">
                            {tempFile ? 'Vista previa local' : currentRequirement?.latest ? 'Versión cargada' : 'Sin archivo'}
                        </p>
                    </div>
                </div>
            </div>

            <DocumentViewer
                currentFile={{
                    ...currentRequirement,
                    latest: tempFile
                        ? { path: previewUrl, name: tempFile.name }
                        : currentRequirement?.latest
                }}
                canUpload={canUpload}
                onUpload={onUpload}
                previewEnabled={previewEnabled}
            />
        </div>
    );
}
