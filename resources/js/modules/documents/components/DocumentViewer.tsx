import FilePreview from './FilePreview';
import UploadZone from './UploadZone';

export default function DocumentViewer({
    currentFile,
    canUpload,
    onUpload,
    previewEnabled,
}: {
    currentFile: {
        code?: string;
        title?: string;
        latest?: { path?: string | null; name?: string } | null;
    };
    canUpload: boolean;
    onUpload: (file: File) => void;
    previewEnabled: boolean;
}) {
    return (
        <div className="flex flex-1 flex-col items-stretch">
            {canUpload ? (
                <div className="flex flex-1 items-center justify-center py-24">
                    <UploadZone code={currentFile.code} onUpload={onUpload} />
                </div>
            ) : (
                <FilePreview
                    path={currentFile.latest?.path}
                    name={currentFile.latest?.name || currentFile.title}
                    previewEnabled={previewEnabled}
                />
            )}
        </div>
    );
}
