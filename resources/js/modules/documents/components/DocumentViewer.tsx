import FilePreview from "./FilePreview";
import UploadZone from "./UploadZone";

export default function DocumentViewer({ currentFile, canUpload, onUpload, previewEnabled }: any) {
    return (
        <div className="flex-1 flex flex-col items-stretch">
            {canUpload ? (
                <div className="flex-1 flex items-center justify-center py-24">
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
