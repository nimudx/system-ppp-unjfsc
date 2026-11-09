import { FileText } from 'lucide-react';

export default function FilePreview({
    path,
    name,
    previewEnabled,
}: {
    path?: string | null;
    name?: string;
    previewEnabled: boolean;
}) {
    if (previewEnabled && path) {
        return (
            <div className="flex min-h-[750px] w-full flex-1 flex-col bg-slate-100/50">
                <iframe
                    src={`${path}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="h-full w-full flex-1 border-none"
                    style={{ minHeight: '750px' }}
                    title={name}
                />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-1 flex-col items-center justify-center p-12">
            {/* Un mock mucho más simple y limpio */}
            <div className="flex max-w-sm flex-col items-center text-center">
                <div className="mb-6 flex size-16 items-center justify-center rounded-full border shadow-sm">
                    <FileText className="size-8 text-primary/40" />
                </div>
                <h4 className="mb-1 text-sm font-semibold">{name}</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    Previsualización desactivada por ahorro de recursos.
                    Actívala en el menú lateral si deseas revisar el contenido.
                </p>
            </div>
        </div>
    );
}
