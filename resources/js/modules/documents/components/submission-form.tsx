import {
    FileText,
    Trash2,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    Clock,
    Info,
    ArrowRight,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/ui/spinner';

export interface CleanSubmissionFormProps {
    status: number;
    hasExistingDocument: boolean;
    isEditing: boolean;
    isUploading: boolean;

    existingFileInfo?: {
        name: string;
        meta?: string;
        grade?: number;
        observationMsg?: string;
    };
    tempFile?: File | null;

    onSave: () => void;
    onSetEditing: (val: boolean) => void;
    onCancelForm: () => void;

    children?: React.ReactNode;
}

export default function SubmissionForm(props: CleanSubmissionFormProps) {
    const {
        status,
        hasExistingDocument,
        isEditing,
        isUploading,
        existingFileInfo,
        tempFile,
        onSave,
        onSetEditing,
        onCancelForm,
        children,
    } = props;

    // BLOQUE 1: Estado Vacío Absoluto
    if (!hasExistingDocument && !tempFile) {
        return (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                    <Info className="size-6 text-muted-foreground/50" />
                </div>
                <h4 className="mb-1 text-sm font-semibold">
                    Sin archivo cargado
                </h4>
                <p className="max-w-50 text-xs text-muted-foreground">
                    Por favor, selecciona o arrastra el documento para iniciar
                    el proceso.
                </p>
            </div>
        );
    }

    // BLOQUE 2: Vistas de Solo Lectura (Aprobado, En Revisión, Observado)
    if (hasExistingDocument && !isEditing && !tempFile) {
        if (status === 1) {
            return (
                <div className="space-y-4">
                    <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50/80 p-4">
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                        <div className="space-y-1">
                            <p className="text-sm leading-none font-bold tracking-tight text-emerald-900">
                                Aprobado
                            </p>
                            <p className="text-[11px] leading-relaxed font-medium text-emerald-700/90">
                                Este documento ha sido validado correctamente.
                            </p>
                        </div>
                    </div>
                    {existingFileInfo && <FileInfoCard {...existingFileInfo} />}
                </div>
            );
        }

        if (status === 2) {
            return (
                <div className="space-y-4">
                    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" />
                        <div className="space-y-1">
                            <h4 className="text-sm leading-none font-bold tracking-tight text-amber-900">
                                En espera de revisión
                            </h4>
                            <p className="text-[11px] leading-relaxed font-medium text-amber-700/80">
                                Tu archivo ha sido enviado. Pendiente de
                                validación.
                            </p>
                        </div>
                    </div>
                    {existingFileInfo && <FileInfoCard {...existingFileInfo} />}
                </div>
            );
        }

        if (status >= 3) {
            // Observado (3: Ambos/Archivo, 4: Calificación)
            return (
                <div className="space-y-4">
                    <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                        <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                        <div className="flex flex-col items-start space-y-1.5">
                            <p className="text-sm leading-none font-bold tracking-tight text-destructive">
                                Observado
                            </p>
                            <p className="text-[11px] leading-relaxed text-destructive/80 italic">
                                "
                                {existingFileInfo?.observationMsg ||
                                    'Pendiente de corrección.'}
                                "
                            </p>
                        </div>
                    </div>
                    {existingFileInfo && <FileInfoCard {...existingFileInfo} />}

                    <Button
                        variant="outline"
                        className="w-full border-destructive/20 text-xs font-bold text-destructive/90 transition-colors hover:bg-destructive/5 hover:text-destructive"
                        onClick={() => onSetEditing(true)}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Corregir y Re-subir
                    </Button>
                </div>
            );
        }
    }

    // BLOQUE 3: Formulario Funcional (Para Subir o Reemplazar)
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSave();
            }}
            className="space-y-4"
        >
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-extrabold tracking-widest text-muted-foreground/80 uppercase">
                        Archivo Cargado
                    </h4>
                    <Badge
                        variant="secondary"
                        className="border-blue-100 bg-blue-50 text-[10px] font-bold tracking-tight text-blue-600 uppercase hover:bg-blue-50"
                    >
                        Listo para enviar
                    </Badge>
                </div>

                <div
                    className={`flex items-center gap-3 rounded-lg border p-3.5 ${tempFile ? 'border-blue-200 bg-blue-50/50 shadow-sm' : 'border-green-200 bg-green-50/50 shadow-sm'}`}
                >
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-white shadow-sm`}
                    >
                        <FileText
                            className={`h-5 w-5 ${tempFile ? 'text-blue-500' : 'text-green-500'}`}
                        />
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                        <p className="truncate text-xs leading-none font-bold">
                            {tempFile
                                ? tempFile.name
                                : existingFileInfo?.name || 'Archivo previo'}
                        </p>
                        <p className="text-[10px] font-medium tracking-tight text-muted-foreground uppercase">
                            {tempFile
                                ? `${(tempFile.size / 1024 / 1024).toFixed(2)} MB`
                                : 'Manteniendo archivo validado...'}
                        </p>
                    </div>
                    {tempFile && (
                        <button
                            type="button"
                            onClick={() => onCancelForm()}
                            className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Inputs extra que el padre quiera inyectar */}
            {children}

            {/* Acciones */}
            <div className="flex flex-col gap-2.5 pt-2">
                <Button
                    type="submit"
                    className="w-full text-xs font-bold shadow-sm"
                    disabled={!tempFile || isUploading}
                >
                    {isUploading ? (
                        <>
                            <Spinner className="mr-2 size-4 animate-spin outline-none" />
                            Subiendo archivo...
                        </>
                    ) : (
                        <>
                            Enviar para Revisión{' '}
                            <ArrowRight className="ml-1.5 size-4" />
                        </>
                    )}
                </Button>
                {(isEditing || hasExistingDocument) && (
                    <Button
                        variant="outline"
                        className="w-full text-xs font-bold text-muted-foreground shadow-sm"
                        type="button"
                        onClick={onCancelForm}
                    >
                        Cancelar
                    </Button>
                )}
                {!isEditing && !hasExistingDocument && (
                    <p className="mt-1 px-4 text-center text-[10px] leading-relaxed font-medium text-muted-foreground/70">
                        Asegúrate de que el archivo esté correcto. Al enviar, no
                        se podrá editar durante su revisión.
                    </p>
                )}
            </div>
        </form>
    );
}

function FileInfoCard({
    name,
    meta,
    grade,
}: {
    name: string;
    meta?: string;
    grade?: number;
}) {
    return (
        <div className="group flex items-center gap-3.5 rounded-lg border border-muted-foreground/15 bg-muted/30 p-3 transition-colors hover:border-muted-foreground/25">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background shadow-sm">
                <FileText className="size-5 text-muted-foreground/60" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-[11px] font-bold tracking-tight text-foreground/90 uppercase">
                    {name}
                </span>
                {meta && (
                    <span className="mt-0.5 text-[9px] leading-none font-medium tracking-widest text-muted-foreground/80 uppercase">
                        {meta}
                    </span>
                )}
                {grade != null && (
                    <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                            Calificación:
                        </span>
                        <span className="text-xs font-extrabold text-foreground">
                            {grade} / 20
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
