import React from 'react';

import SubmissionForm from '@/modules/documents/components/submission-form';
import type { DocumentRequirement } from '@/modules/documents/types';
import { SectionCard } from '@/shared/components/ui/section-card';

interface SubmissionPanelProps {
    status?: number;
    currentRequirement: DocumentRequirement | null;
    tempFile: File | null;
    isEditing: boolean;
    onSetEditing: (value: boolean) => void;
    onRemoveTemp: () => void;
    uploading: boolean;
    showFileInfo?: {
        name?: string;
        meta?: string;
        size?: string | number;
        grade?: number;
    };
    onSubmit: () => void;
    children?: React.ReactNode;
}

/**
 * Estado efectivo del documento:
 * - Con un archivo nuevo sin enviar, siempre es pendiente (0).
 * - Si ya hay un archivo subido, manda su approval_status (el que revisa el evaluador).
 * - Si no, se usa el status recibido o el del requisito.
 */
function resolveStatus(
    status: number | undefined,
    requirement: DocumentRequirement | null,
    tempFile: File | null,
): number {
    if (tempFile) return 0;

    return (
        requirement?.latest?.approval_status ??
        status ??
        requirement?.status ??
        0
    );
}

export function SubmissionPanel({
    status,
    currentRequirement,
    tempFile,
    isEditing,
    onSetEditing,
    onRemoveTemp,
    uploading,
    showFileInfo,
    onSubmit,
    children,
}: SubmissionPanelProps) {
    const hasExistingDocument = Boolean(currentRequirement?.latest);

    const effectiveStatus = resolveStatus(status, currentRequirement, tempFile);

    const existingFileInfo = hasExistingDocument
        ? {
              name:
                  showFileInfo?.name ||
                  currentRequirement?.latest?.name ||
                  'Archivo adjunto',
              meta: showFileInfo?.meta || 'Documento adjunto',
              size: showFileInfo?.size ?? currentRequirement?.latest?.size,
              grade: showFileInfo?.grade ?? currentRequirement?.latest?.grade,
              observationMsg:
                  currentRequirement?.latest?.comment ||
                  currentRequirement?.latest?.justification,
          }
        : undefined;

    return (
        <div className="flex w-full shrink-0 flex-col gap-4">
            <SectionCard>
                <SectionCard.Header>
                    <div className="min-w-0">
                        <h3 className="text-sm leading-none font-semibold tracking-tight">
                            Detalle del documento
                        </h3>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            Información y acciones disponibles
                        </p>
                    </div>
                </SectionCard.Header>

                <SectionCard.Body>
                    {currentRequirement ? (
                        <SubmissionForm
                            key={`${currentRequirement.code}-${effectiveStatus}`}
                            status={effectiveStatus}
                            hasExistingDocument={hasExistingDocument}
                            isEditing={isEditing}
                            isUploading={uploading}
                            existingFileInfo={existingFileInfo}
                            tempFile={tempFile}
                            onSave={onSubmit}
                            onSetEditing={onSetEditing}
                            onCancelForm={onRemoveTemp}
                        >
                            {children}
                        </SubmissionForm>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-sm font-medium">
                                Sin documento seleccionado
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Selecciona un requisito para consultar su
                                detalle.
                            </p>
                        </div>
                    )}
                </SectionCard.Body>
            </SectionCard>
        </div>
    );
}