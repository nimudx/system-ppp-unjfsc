import {
    ChevronLeft,
    ChevronRight,
    FileText,
    Maximize2,
    Minimize2,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import { Spinner } from '@/shared/components/ui/spinner';
import { cn } from '@/shared/lib/utils';

import type { DocumentRequirement } from '../types';
import DocumentViewer from './document-viewer';
import { enter } from './dossier-shared';

interface DocumentWorkbenchProps {
    /** Requisito activo; null muestra el estado vacío. */
    currentFile: DocumentRequirement | null;
    selectedType: number;
    total: number;
    tempFile: File | null;
    previewUrl: string | null;
    canUpload: boolean;
    onUpload: (file: File) => void;
    previewEnabled: boolean;
    approvedAt?: string | null;
    onRequestPreview?: () => void;
    onSelectType: (index: number) => void;
    expanded: boolean;
    onToggleExpanded: () => void;
    /** Superposición mientras se envía el archivo. */
    uploading?: boolean;
    uploadingLabel?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    maxSizeMB?: number;
    elevated?: boolean;
}

/**
 * Panel central de presentación: cabecera del documento activo, navegación,
 * vista completa y el visor (zona de carga o vista previa).
 */
export default function DocumentWorkbench({
    currentFile,
    selectedType,
    total,
    tempFile,
    previewUrl,
    canUpload,
    onUpload,
    previewEnabled,
    approvedAt,
    onRequestPreview,
    onSelectType,
    expanded,
    onToggleExpanded,
    uploading = false,
    uploadingLabel = 'Validando documento...',
    emptyTitle = 'No hay documentos requeridos',
    emptyDescription = 'No se encontraron requisitos para este expediente.',
    maxSizeMB,
    elevated = false,
}: DocumentWorkbenchProps) {
    const hasFile = Boolean(tempFile || currentFile?.latest);

    if (!currentFile) {
        return (
            <SectionCard elevated={elevated}>
                <SectionCard.Body className="flex min-h-64 flex-col items-center justify-center text-center">
                    <FileText className="mb-3 size-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">{emptyTitle}</p>
                    {emptyDescription && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {emptyDescription}
                        </p>
                    )}
                </SectionCard.Body>
            </SectionCard>
        );
    }

    return (
        <>
            {uploading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <Spinner className="animate-spin text-primary" />
                        <span className="text-xs font-medium">
                            {uploadingLabel}
                        </span>
                    </div>
                </div>
            )}

            <SectionCard elevated={elevated}>
                <SectionCard.Header>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div
                            key={currentFile.code ?? selectedType}
                            className={cn(
                                'flex min-w-0 items-center gap-3',
                                enter,
                            )}
                        >
                            <div
                                className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors duration-200 motion-reduce:transition-none',
                                    hasFile
                                        ? 'border-primary/20 bg-primary/5'
                                        : 'bg-muted/50',
                                )}
                            >
                                <FileText
                                    className={cn(
                                        'size-4',
                                        hasFile
                                            ? 'text-primary'
                                            : 'text-muted-foreground',
                                    )}
                                />
                            </div>

                            <div className="flex min-w-0 flex-col">
                                <h3 className="truncate text-sm leading-none font-semibold tracking-tight">
                                    {currentFile.title}
                                </h3>

                                {/* El estado vive en el panel lateral; aquí solo avisamos del archivo sin enviar. */}
                                {tempFile && (
                                    <p className="mt-1 text-xs text-primary">
                                        Archivo listo para enviar
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-1 sm:justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Documento anterior"
                                disabled={selectedType <= 0}
                                onClick={() => onSelectType(selectedType - 1)}
                            >
                                <ChevronLeft />
                            </Button>

                            {total > 1 && (
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {selectedType + 1}/{total}
                                </span>
                            )}

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Documento siguiente"
                                disabled={selectedType >= total - 1}
                                onClick={() => onSelectType(selectedType + 1)}
                            >
                                <ChevronRight />
                            </Button>

                            {hasFile && previewEnabled && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto h-8 px-2.5 text-xs sm:ml-1"
                                    aria-expanded={expanded}
                                    onClick={onToggleExpanded}
                                >
                                    {expanded ? (
                                        <Minimize2 className="size-3.5 text-muted-foreground sm:mr-2" />
                                    ) : (
                                        <Maximize2 className="size-3.5 text-muted-foreground sm:mr-2" />
                                    )}

                                    <span className="hidden sm:inline">
                                        {expanded ? 'Cerrar' : 'Expandir'}
                                    </span>
                                    <span className="sr-only sm:hidden">
                                        {expanded
                                            ? 'Cerrar vista completa'
                                            : 'Expandir vista'}
                                    </span>
                                </Button>
                            )}
                        </div>
                    </div>
                </SectionCard.Header>

                <SectionCard.Body className="p-0">
                    <DocumentViewer
                        currentFile={{
                            ...currentFile,
                            latest: tempFile
                                ? {
                                      id: 0,
                                      approval_status: 0,
                                      path: previewUrl,
                                      name: tempFile.name,
                                      size: tempFile.size,
                                  }
                                : currentFile.latest,
                        }}
                        canUpload={canUpload}
                        onUpload={onUpload}
                        previewEnabled={previewEnabled}
                        maxSizeMB={maxSizeMB}
                        approvedAt={approvedAt}
                        onRequestPreview={onRequestPreview}
                    />
                </SectionCard.Body>
            </SectionCard>
        </>
    );
}
