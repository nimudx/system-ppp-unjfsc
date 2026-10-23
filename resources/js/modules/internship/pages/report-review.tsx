
import { Head } from '@inertiajs/react';
import {
    ClipboardCheck,
    FileText,
    FileCheck,
    Upload,
    MessageSquare,
    History,
    CalendarDays,
    Clock,
    CheckCircle2,
    Eye,
    Paperclip,
} from 'lucide-react';
import { useState } from 'react';

import Heading from '@/shared/components/heading';
import AppLayout from '@/shared/layouts/app-layout';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import type { BreadcrumbItem } from '@/shared/types';

type PracticeDocument = {
    id: 'plan' | 'report';
    title: string;
    description: string;
    file: File | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Prácticas Pre-Profesionales',
        href: '/internship',
    },
];

export default function StudentSupervisionIndex() {
    const [documents, setDocuments] = useState<PracticeDocument[]>([
        {
            id: 'plan',
            title: 'Plan de prácticas',
            description:
                'Documento con las actividades, objetivos y cronograma de prácticas.',
            file: null,
        },
        {
            id: 'report',
            title: 'Informe de prácticas',
            description:
                'Informe de las actividades realizadas durante el periodo de prácticas.',
            file: null,
        },
    ]);

    const [selectedType, setSelectedType] = useState<
        'plan' | 'report'
    >('plan');

    const currentDocument = documents.find(
        (document) => document.id === selectedType,
    )!;

    const handleFileChange = (file: File | undefined) => {
        if (!file) return;

        setDocuments((previous) =>
            previous.map((document) =>
                document.id === selectedType
                    ? { ...document, file }
                    : document,
            ),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seguimiento de Prácticas" />

            <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Encabezado */}
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title="Seguimiento de Prácticas"
                        description="Gestiona tu plan, informe y revisa las observaciones de tu docente."
                    />

                    <div className="hidden items-center gap-2 rounded-lg border bg-card px-3 py-2 md:flex">
                        <ClipboardCheck className="size-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs font-medium">
                                Mis entregas
                            </p>
                            <p className="text-xs text-muted-foreground">
                                2 documentos requeridos
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resumen de documentos */}
                <div className="grid gap-4 md:grid-cols-2">
                    {documents.map((document) => (
                        <button
                            key={document.id}
                            type="button"
                            onClick={() => setSelectedType(document.id)}
                            className={`rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/40 ${
                                selectedType === document.id
                                    ? 'border-primary ring-1 ring-primary/20'
                                    : ''
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                        {document.id === 'plan' ? (
                                            <FileText className="size-5" />
                                        ) : (
                                            <FileCheck className="size-5" />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            {document.title}
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {document.file
                                                ? 'Archivo seleccionado'
                                                : 'Pendiente de selección'}
                                        </p>
                                    </div>
                                </div>

                                {document.file ? (
                                    <CheckCircle2 className="size-5 text-green-600" />
                                ) : (
                                    <Clock className="size-5 text-muted-foreground" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Paneles principales */}
                <div className="flex flex-col items-start gap-6 lg:flex-row">
                    {/* Panel izquierdo: documentos */}
                    <div className="flex w-full shrink-0 flex-col gap-4 lg:w-64 xl:w-72">
                        <SectionCard>
                            <SectionCard.Header>
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Mis documentos
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Selecciona qué documento gestionar.
                                    </p>
                                </div>
                            </SectionCard.Header>

                            <SectionCard.Body className="space-y-2">
                                {documents.map((document) => (
                                    <button
                                        key={document.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedType(document.id)
                                        }
                                        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                                            selectedType === document.id
                                                ? 'border-primary/40 bg-primary/5'
                                                : 'border-transparent hover:bg-muted'
                                        }`}
                                    >
                                        <FileText className="size-4 shrink-0" />

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">
                                                {document.title}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {document.file
                                                    ? document.file.name
                                                    : 'Sin archivo seleccionado'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </SectionCard.Body>
                        </SectionCard>

                        <SectionCard>
                            <SectionCard.Header>
                                <h3 className="text-sm font-semibold">
                                    Indicaciones
                                </h3>
                            </SectionCard.Header>
                            <SectionCard.Body>
                                <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                                    <p>
                                        <Paperclip className="mr-2 inline size-4" />
                                        Selecciona el archivo correspondiente
                                        a cada documento.
                                    </p>
                                    <p>
                                        <Eye className="mr-2 inline size-4" />
                                        Revisa las observaciones de tu docente
                                        para conocer las correcciones.
                                    </p>
                                    <p>
                                        <History className="mr-2 inline size-4" />
                                        Consulta las entregas anteriores
                                        cuando el historial esté conectado.
                                    </p>
                                </div>
                            </SectionCard.Body>
                        </SectionCard>
                    </div>

                    {/* Panel central: carga del documento */}
                    <div className="w-full min-w-0 flex-1">
                        <SectionCard>
                            <SectionCard.Header>
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                        <FileText className="size-5" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            {currentDocument.title}
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {currentDocument.file
                                                ? 'Archivo listo para revisar'
                                                : 'Pendiente de entrega'}
                                        </p>
                                    </div>
                                </div>
                            </SectionCard.Header>

                            <SectionCard.Body>
                                <div className="space-y-5">
                                    <p className="text-sm text-muted-foreground">
                                        {currentDocument.description}
                                    </p>

                                    <label
                                        htmlFor={`file-${selectedType}`}
                                        className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
                                    >
                                        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                                            <Upload className="size-6" />
                                        </div>

                                        <p className="text-sm font-medium">
                                            Selecciona tu documento
                                        </p>

                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Haz clic aquí para elegir un archivo
                                            de tu equipo.
                                        </p>

                                        <input
                                            id={`file-${selectedType}`}
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            className="sr-only"
                                            onChange={(event) => {
                                                handleFileChange(
                                                    event.target.files?.[0],
                                                );
                                                event.target.value = '';
                                            }}
                                        />
                                    </label>

                                    {currentDocument.file && (
                                        <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
                                            <FileCheck className="size-6 shrink-0 text-primary" />

                                            <div className="min-w-0 flex-1">
                                                <p className="break-all text-sm font-medium">
                                                    {currentDocument.file.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(
                                                        currentDocument.file.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{' '}
                                                    MB
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setDocuments((previous) =>
                                                        previous.map((document) =>
                                                            document.id ===
                                                            selectedType
                                                                ? {
                                                                      ...document,
                                                                      file: null,
                                                                  }
                                                                : document,
                                                        ),
                                                    )
                                                }
                                            >
                                                Quitar
                                            </Button>
                                        </div>
                                    )}

                                    <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                                        Formatos permitidos: PDF, DOC y DOCX.
                                        La selección del archivo todavía no
                                        implica que se haya enviado al sistema.
                                    </div>

                                    <Button
                                        type="button"
                                        className="w-full"
                                        disabled={!currentDocument.file}
                                        onClick={() => {
                                            window.alert(
                                                'La selección funciona correctamente. Falta conectar el envío con el backend.',
                                            );
                                        }}
                                    >
                                        <Upload className="mr-2 size-4" />
                                        Enviar documento
                                    </Button>
                                </div>
                            </SectionCard.Body>
                        </SectionCard>
                    </div>

                    {/* Panel derecho: evaluación e historial */}
                    <div className="flex w-full shrink-0 flex-col gap-4 lg:w-64 xl:w-72">
                        <SectionCard>
                            <SectionCard.Header>
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="size-4" />
                                    <h3 className="text-sm font-semibold">
                                        Evaluación del docente
                                    </h3>
                                </div>
                            </SectionCard.Header>

                            <SectionCard.Body>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Estado de revisión
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            Pendiente de evaluación
                                        </p>
                                    </div>

                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Calificación
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold">
                                            — <span className="text-sm font-normal text-muted-foreground">/ 20</span>
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-xs font-medium">
                                            Observaciones
                                        </p>
                                        <div className="rounded-lg bg-muted/40 p-3">
                                            <p className="text-xs leading-relaxed text-muted-foreground">
                                                Todavía no hay comentarios
                                                registrados por el docente.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard.Body>
                        </SectionCard>

                        <SectionCard>
                            <SectionCard.Header>
                                <div className="flex items-center gap-2">
                                    <History className="size-4" />
                                    <h3 className="text-sm font-semibold">
                                        Historial de entregas
                                    </h3>
                                </div>
                            </SectionCard.Header>

                            <SectionCard.Body>
                                <div className="flex flex-col items-center py-5 text-center">
                                    <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                                        <CalendarDays className="size-5 text-muted-foreground" />
                                    </div>

                                    <p className="text-sm font-medium">
                                        Sin registros disponibles
                                    </p>

                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Aquí aparecerán las fechas de entrega,
                                        las revisiones, las notas y las
                                        observaciones anteriores.
                                    </p>
                                </div>
                            </SectionCard.Body>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
