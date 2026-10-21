import React from 'react';
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
        children
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
                    Por favor, selecciona o arrastra el documento para iniciar el proceso.
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
                        <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-emerald-900 tracking-tight leading-none">Aprobado</p>
                            <p className="text-[11px] text-emerald-700/90 leading-relaxed font-medium">Este documento ha sido validado correctamente.</p>
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
                        <Clock className="size-5 shrink-0 text-amber-600 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-sm leading-none font-bold text-amber-900 tracking-tight">
                                En espera de revisión
                            </h4>
                            <p className="text-[11px] leading-relaxed font-medium text-amber-700/80">
                                Tu archivo ha sido enviado. Pendiente de validación.
                            </p>
                        </div>
                    </div>
                    {existingFileInfo && <FileInfoCard {...existingFileInfo} />}
                </div>
            );
        }

        if (status >= 3) { // Observado (3: Ambos/Archivo, 4: Calificación)
            return (
                <div className="space-y-4">
                    <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                        <AlertCircle className="size-5 shrink-0 text-destructive mt-0.5" />
                        <div className="space-y-1.5 flex flex-col items-start">
                            <p className="text-sm font-bold text-destructive tracking-tight leading-none">Observado</p>
                            <p className="text-[11px] text-destructive/80 leading-relaxed italic">
                                "{existingFileInfo?.observationMsg || 'Pendiente de corrección.'}"
                            </p>
                        </div>
                    </div>
                    {existingFileInfo && <FileInfoCard {...existingFileInfo} />}

                    <Button
                        variant="outline"
                        className="w-full border-destructive/20 text-xs font-bold hover:bg-destructive/5 hover:text-destructive text-destructive/90 transition-colors"
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
                    <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-muted-foreground/80">
                        Archivo Cargado
                    </h4>
                    <Badge
                        variant="secondary"
                        className="border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-50 tracking-tight text-[10px] uppercase font-bold"
                    >
                        Listo para enviar
                    </Badge>
                </div>

                <div className={`rounded-lg border p-3.5 flex items-center gap-3 ${tempFile ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-green-50/50 border-green-200 shadow-sm'}`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-white shadow-sm`}>
                        <FileText className={`h-5 w-5 ${tempFile ? 'text-blue-500' : 'text-green-500'}`} />
                    </div>
                    <div className="space-y-1 overflow-hidden flex-1">
                        <p className="text-xs leading-none font-bold truncate">
                            {tempFile ? tempFile.name : (existingFileInfo?.name || 'Archivo previo')}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                            {tempFile
                                ? `${(tempFile.size / 1024 / 1024).toFixed(2)} MB`
                                : 'Manteniendo archivo validado...'}
                        </p>
                    </div>
                    {tempFile && (
                        <button type="button" onClick={() => onCancelForm()} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
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
                            Enviar para Revisión <ArrowRight className="size-4 ml-1.5" />
                        </>
                    )}
                </Button>
                {(isEditing || hasExistingDocument) && (
                    <Button variant="outline" className="w-full text-xs font-bold text-muted-foreground shadow-sm" type="button" onClick={onCancelForm}>
                        Cancelar
                    </Button>
                )}
                {(!isEditing && !hasExistingDocument) && (
                    <p className="text-[10px] text-center text-muted-foreground/70 font-medium px-4 leading-relaxed mt-1">
                        Asegúrate de que el archivo esté correcto. Al enviar, no se podrá editar durante su revisión.
                    </p>
                )}
            </div>
        </form>
    );
}

function FileInfoCard({ name, meta, grade }: { name: string; meta?: string, grade?: number }) {
    return (
        <div className="flex items-center gap-3.5 p-3 rounded-lg border bg-muted/30 border-muted-foreground/15 group hover:border-muted-foreground/25 transition-colors">
            <div className="size-9 rounded-md border bg-background shadow-sm flex items-center justify-center shrink-0">
                <FileText className="size-5 text-muted-foreground/60" />
            </div>
            <div className="flex flex-col min-w-0 flex-1 gap-1">
                <span className="truncate text-[11px] font-bold uppercase tracking-tight text-foreground/90">{name}</span>
                {meta && <span className="text-[9px] text-muted-foreground/80 font-medium uppercase tracking-widest leading-none mt-0.5">{meta}</span>}
                {grade != null && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Calificación:</span>
                        <span className="text-xs font-extrabold text-foreground">{grade} / 20</span>
                    </div>
                )}
            </div>
        </div>
    )
}