import React from 'react';
import {
    FileText,
    Trash2,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    Clock,
    Info
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

export default function FileDetailsContent({
    currentFile,
    tempFile,
    isEditing,
    onSetEditing,
    onRemoveTemp
}: any) {

    const latest = currentFile?.latest;
    const status = currentFile?.status;

    // CASO 1: Subida Pendiente (Pantalla Inicial)
    if (!latest && !tempFile) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Info className="size-6 text-muted-foreground/50" />
                </div>
                <h4 className="text-sm font-semibold mb-1">Sin archivo cargado</h4>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                    Por favor, selecciona o arrastra el documento para iniciar el proceso de validación.
                </p>
            </div>
        );
    }

    // CASO 2: Archivo en Selección (Local - Aún no se ha enviado al servidor)
    if (tempFile || isEditing) {
        return (
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold tracking-wider text-muted-foreground">Archivo Cargado</h4>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-100">
                            Listo para enviar
                        </Badge>
                    </div>

                    <div className="rounded-lg border p-3.5 flex items-start gap-3 bg-blue-50/30 border-blue-100">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-white shadow-sm">
                            <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="space-y-1 overflow-hidden">
                            <p className="text-sm font-medium truncate leading-none">
                                {tempFile?.name || latest?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {tempFile ? `${(tempFile.size / 1024 / 1024).toFixed(2)} MB` : 'Reemplazo pendiente'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-9 text-xs" onClick={() => onRemoveTemp()}>
                        <Trash2 className="mr-2 h-3.5 w-3.5 text-destructive" />
                        {isEditing ? 'Cancelar' : 'Eliminar Selección'}
                    </Button>
                </div>
            </div>
        );
    }

    // CASO 3: Documento en Revisión (Status 2)
    if (status === 2) {
        return (
            <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 shadow-sm">
                    <Clock className="size-5 text-amber-600 shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-amber-900 leading-none">En espera de evaluación</h4>
                        <p className="text-[11px] text-amber-700/80 leading-relaxed font-medium">
                            Tu archivo ha sido enviado. Por políticas académicas, no se pueden realizar cambios durante la revisión.
                        </p>
                    </div>
                </div>
                <FileInfoDisplay file={latest} />
            </div>
        );
    }

    // CASO 4: Documento Observado/Rechazado (Status 3)
    if (status === 3) {
        return (
            <div className="space-y-4">
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-3 shadow-sm italic">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 text-destructive" />
                        <h4 className="text-xs font-bold text-destructive uppercase tracking-widest">Documento Observado</h4>
                    </div>
                    <p className="text-sm text-foreground/80 leading-snug">
                        "{latest?.comment || 'Sin comentarios adicionales.'}"
                    </p>
                </div>

                <FileInfoDisplay file={latest} />

                <Button variant="outline" className="w-full h-10 border-destructive/10 hover:bg-destructive/5 hover:text-destructive text-xs font-bold" onClick={() => onSetEditing(true)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Corregir y Re-subir
                </Button>
            </div>
        );
    }

    // CASO 5: Documento Aprobado (Status 1)
    if (status === 1) {
        return (
            <div className="space-y-5">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3 shadow-sm">
                    <CheckCircle2 className="size-5 text-green-600 shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-green-900 leading-none">Validación Aprobada</h4>
                        <p className="text-[11px] text-green-700 leading-relaxed">
                            Este documento cumple con todos los requisitos y ha sido archivado en tu dossier digital.
                        </p>
                    </div>
                </div>
                <FileInfoDisplay file={latest} />
            </div>
        );
    }

    return null;
}

// Sub-componente para mostrar info del archivo sin acciones
function FileInfoDisplay({ file }: any) {
    return (
        <div className="rounded-lg border p-3 flex items-center gap-3 bg-muted/20">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background">
                <FileText className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <div className="space-y-0.5 overflow-hidden">
                <p className="text-xs font-bold truncate leading-none">{file?.name}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest italic pt-1">Documento Oficial</p>
            </div>
        </div>
    );
}
