import { Download, Eye, FileText } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { truncateMiddle } from '@/shared/lib/utils';

import { formatDateTime } from './dossier-shared';

export interface FilePreviewInfo {
    name?: string;
    size?: number;
    uploadedAt?: string | null;
    approvedAt?: string | null;
}

export default function FilePreview({
    path,
    name,
    previewEnabled,
    fileInfo,
    onRequestPreview,
}: {
    path?: string | null;
    name?: string;
    previewEnabled: boolean;
    /** Metadatos para mostrar una ficha útil sin vista previa (opt-in). */
    fileInfo?: FilePreviewInfo;
    /** Permite reactivar la vista previa desde la ficha (opt-in). */
    onRequestPreview?: () => void;
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

    // Ficha informativa: solo se muestra cuando el consumidor aporta metadatos.
    if (fileInfo) {
        const displayName = fileInfo.name ?? name ?? 'Documento adjunto';
        const sizeLabel =
            typeof fileInfo.size === 'number'
                ? `${Math.max(1, Math.round(fileInfo.size / 1024))} KB`
                : null;
        const uploaded = formatDateTime(fileInfo.uploadedAt);
        const approved = formatDateTime(fileInfo.approvedAt);

        return (
            <div className="flex w-full flex-1 items-center justify-center p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-5 text-left shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                            <FileText className="size-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                            <p
                                className="text-sm font-semibold"
                                title={displayName}
                            >
                                {truncateMiddle(displayName, 36)}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Vista previa desactivada
                            </p>
                        </div>
                    </div>

                    <dl className="space-y-1.5 text-xs">
                        {sizeLabel && (
                            <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    Tamaño
                                </dt>
                                <dd className="font-medium tabular-nums">
                                    {sizeLabel}
                                </dd>
                            </div>
                        )}

                        {uploaded && (
                            <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    Subido
                                </dt>
                                <dd className="text-right font-medium tabular-nums">
                                    {uploaded}
                                </dd>
                            </div>
                        )}

                        {approved && (
                            <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    Aprobado
                                </dt>
                                <dd className="text-right font-medium text-green-700 tabular-nums dark:text-green-400">
                                    {approved}
                                </dd>
                            </div>
                        )}
                    </dl>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        {path && onRequestPreview && (
                            <Button
                                type="button"
                                size="sm"
                                className="flex-1"
                                onClick={onRequestPreview}
                            >
                                <Eye className="size-4" />
                                Ver vista previa
                            </Button>
                        )}

                        {path && (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="flex-1"
                            >
                                <a href={path} download={displayName}>
                                    <Download className="size-4" />
                                    Descargar
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
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
                    Vista previa desactivada. Actívala en el menú lateral si
                    deseas revisar el contenido.
                </p>
            </div>
        </div>
    );
}
