import { FileText, Maximize2, ExternalLink } from 'lucide-react';

export default function FilePreview({ path, name, previewEnabled }: any) {
    if (previewEnabled && path) {
        return (
            <div className="flex-1 w-full min-h-[750px] bg-slate-100/50 flex flex-col">
                <iframe
                    src={`${path}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="flex-1 w-full h-full border-none"
                    style={{ minHeight: '750px' }}
                    title={name}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 w-full flex flex-col items-center justify-center p-12">
            {/* Un mock mucho más simple y limpio */}
            <div className="flex flex-col items-center text-center max-w-sm">
                <div className="size-16 rounded-full border flex items-center justify-center mb-6 shadow-sm">
                    <FileText className="size-8 text-primary/40" />
                </div>
                <h4 className="font-semibold text-sm mb-1">{name}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Previsualización desactivada por ahorro de recursos.
                    Actívala en el menú lateral si deseas revisar el contenido.
                </p>
            </div>
        </div>
    );
}
