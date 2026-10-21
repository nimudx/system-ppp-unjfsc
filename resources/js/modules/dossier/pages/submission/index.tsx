import { Head, useForm } from '@inertiajs/react';
import { FileText, Maximize2, Download, FileDown } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    DocumentViewer,
    RequirementsList,
    AlertHelp,
    SubmissionPanel,
} from '@/modules/documents';
import type { DocumentRequirement } from '@/modules/documents/types';
import type { AssignmentRecord } from '@/modules/identity/types';

import dossiers from '@/routes/academic/dossiers';
import Heading from '@/shared/components/heading';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import { Spinner } from '@/shared/components/ui/spinner';

import AppLayout from '@/shared/layouts/app-layout';
import type { BreadcrumbItem } from '@/shared/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Documentación',
        href: dossiers.submission.toString(),
    },
];

export default function MyDossier({
    requirements,
    dossier,
}: {
    assignment: AssignmentRecord;
    requirements: DocumentRequirement[];
    dossier: number;
}) {
    const [selectedType, setSelectedType] = useState(0);
    const [previewEnabled, setPreviewEnabled] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const currentFile = requirements[selectedType];

    const { post, processing, transform } = useForm({
        file: null as File | null,
        code: '',
        target_id: dossier,
    });
    // FUNCIÓN: Maneja la previsualización local antes de subir
    const onUpload = (file: File) => {
        setTempFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    // Limpiar estados cuando cambiamos de archivo a la izquierda
    const selectType = (index: number) => {
        if (index === selectedType) return;
        removeTempFile();
        setSelectedType(index);
    };

    // Lógica para decidir si mostrar UploadZone o Preview
    const canUpload = (!currentFile?.latest || isEditing) && !tempFile;

    const removeTempFile = () => {
        setTempFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setIsEditing(false);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!tempFile) {
            toast.error('Por favor, selecciona un archivo antes de enviar.');
            return;
        }

        // Aseguramos que el código y el target_id estén actualizados en el payload
        transform((data) => ({
            ...data,
            code: currentFile.code,
            file: tempFile,
        }));

        post(dossiers.document.store().url, {
            onSuccess: () => {
                setTempFile(null);
                setPreviewUrl(null);
                setIsEditing(false);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0] as string;
                toast.error(firstError || 'Error al procesar la solicitud');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documentación" />

            {/* Fondo gris de toda la app (Lienzo infinito) */}
            <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header Superior Libre */}
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title="Validación de Documentos"
                        description="Gestione y valide los archivos requeridos para su expediente."
                    />
                    <div className="hidden flex-col items-end md:flex">
                        <span className="text-sm font-medium">
                            {requirements.filter((r) => r.status === 1).length}{' '}
                            / {requirements.length} Listos
                        </span>
                        <p className="mt-0.5 cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground">
                            Ver detalles
                        </p>
                    </div>
                </div>

                {/* Contenedor Principal (Flex Row) */}
                <div className="flex flex-col items-start gap-6 lg:flex-row">
                    {/* 1. PANEL IZQUIERDO (Navegación Vertical) */}
                    <div className="flex w-full shrink-0 flex-col gap-6 lg:w-64 xl:w-72">
                        {/* Tarjeta de Requisitos usando componentes base Shadcn (Card) */}
                        <RequirementsList
                            requirements={requirements || []}
                            selectedType={selectedType}
                            onSelectType={selectType}
                            previewEnabled={previewEnabled}
                            onTogglePreview={() =>
                                setPreviewEnabled(!previewEnabled)
                            }
                        />

                        {/* Plantilla Disponible Card */}
                        {currentFile?.has_template && (
                            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                                    <h3 className="text-sm font-semibold tracking-tight">
                                        Plantilla Disponible
                                    </h3>
                                    <FileDown className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="p-4 pt-0">
                                    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                                        Descarga el formato oficial, complétalo
                                        y súbelo.
                                    </p>
                                    <button className="inline-flex h-8 w-full items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium whitespace-nowrap shadow-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none">
                                        <Download className="mr-2 h-3.5 w-3.5" />
                                        Descargar formato
                                    </button>
                                </div>
                            </div>
                        )}

                        <AlertHelp />
                    </div>

                    {/* 2. PANEL CENTRAL (Visor del Documento) */}
                    <div className="relative h-full w-full flex-1 overflow-hidden">
                        {/* Loader opcional de Inertia mientras sube */}
                        {processing && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-2">
                                    <Spinner className="animate-spin text-primary" />
                                    <span className="text-xs font-medium">
                                        Subiendo documento...
                                    </span>
                                </div>
                            </div>
                        )}

                        <SectionCard>
                            <SectionCard.Header>
                                {/* Header del Card (Dinamizado y Compacto) */}
                                <div className="flex flex-row items-center justify-between backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        {/* Ícono más pequeño y sutil */}
                                        <div
                                            className={`flex h-9 w-9 items-center justify-center rounded-md border ${
                                                tempFile || currentFile?.latest
                                                    ? 'border-primary/20 bg-primary/5'
                                                    : 'bg-muted/50'
                                            }`}
                                        >
                                            <FileText
                                                className={`size-4 ${tempFile || currentFile?.latest ? 'text-primary' : 'text-muted-foreground'}`}
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <h3 className="text-sm leading-none font-semibold tracking-tight">
                                                {currentFile?.title}
                                            </h3>
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                {tempFile
                                                    ? 'Archivo listo para subir'
                                                    : currentFile?.latest
                                                      ? 'Cargado correctamente'
                                                      : 'Subida pendiente'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Acciones reducidas a botones compactos */}
                                    <div className="flex items-center gap-2">
                                        {(tempFile || currentFile?.latest) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2.5 text-xs"
                                            >
                                                <Maximize2 className="mr-2 size-3.5 text-muted-foreground" />
                                                Expandir
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
                                                  ...tempFile,
                                                  path: previewUrl,
                                                  name: tempFile.name,
                                              }
                                            : currentFile?.latest,
                                    }}
                                    canUpload={canUpload}
                                    onUpload={onUpload}
                                    previewEnabled={previewEnabled}
                                />
                            </SectionCard.Body>
                        </SectionCard>
                    </div>

                    {/* 3. PANEL DERECHO (Detalles y Acciones) */}
                    <div className="flex w-full shrink-0 flex-col gap-6 lg:w-64 xl:w-72">
                        <SubmissionPanel
                            status={currentFile?.status}
                            currentRequirement={currentFile}
                            tempFile={tempFile}
                            isEditing={isEditing}
                            onSetEditing={setIsEditing}
                            onRemoveTemp={removeTempFile}
                            uploading={processing}
                            showFileInfo={{
                                name: currentFile?.latest?.name,
                                meta: 'Documento Oficial',
                                size: currentFile?.latest?.size,
                            }}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
