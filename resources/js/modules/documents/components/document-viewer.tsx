import FilePreview from './file-preview';
import UploadZone from './upload-zone';

export default function DocumentViewer({
    currentFile,
    canUpload,
    onUpload,
    previewEnabled,
    maxSizeMB,
    approvedAt,
    onRequestPreview,
}: {
    currentFile: {
        code?: string;
        title?: string;
        latest?: {
            path?: string | null;
            name?: string;
            size?: number;
            created_at?: string;
        } | null;
    };
    canUpload: boolean;
    onUpload: (file: File) => void;
    previewEnabled: boolean;
    maxSizeMB?: number;
    /** Fecha de aprobación del archivo vigente (opt-in para la ficha). */
    approvedAt?: string | null;
    /** Reactiva la vista previa desde la ficha del archivo (opt-in). */
    onRequestPreview?: () => void;
}) {
    return (
        <div className="flex flex-1 flex-col items-stretch">
            {canUpload ? (
                <div className="flex flex-1 items-center justify-center py-24">
                    <UploadZone
                        code={currentFile.code}
                        onUpload={onUpload}
                        maxSizeMB={maxSizeMB}
                    />
                </div>
            ) : (
                <FilePreview
                    path={currentFile.latest?.path}
                    name={currentFile.latest?.name || currentFile.title}
                    previewEnabled={previewEnabled}
                    fileInfo={
                        onRequestPreview && currentFile.latest
                            ? {
                                  name:
                                      currentFile.latest.name ||
                                      currentFile.title,
                                  size: currentFile.latest.size,
                                  uploadedAt: currentFile.latest.created_at,
                                  approvedAt,
                              }
                            : undefined
                    }
                    onRequestPreview={onRequestPreview}
                />
            )}
        </div>
    );
}
