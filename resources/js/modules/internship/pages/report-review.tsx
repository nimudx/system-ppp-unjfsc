import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    ExternalLink,
    Eye,
    FileCheck,
    FileText,
    History,
    MessageSquare,
    Paperclip,
    Upload,
} from 'lucide-react';
import { useState } from 'react';

import Heading from '@/shared/components/heading';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import AppLayout from '@/shared/layouts/app-layout';
import type { BreadcrumbItem } from '@/shared/types';

type DocumentId = 'plan' | 'report';

type Submission = {
    id: number;
    status: 1 | 2 | 3; // 1 aprobado, 2 pendiente, 3 observado
    status_label: string;
    grade: number | null;
    comment: string | null;
    submitted_at: string;
    reviewed_at: string | null;
    reviewer: string | null;
    file: { id: number; name: string; url: string } | null;
};

type PracticeDocument = {
    id: DocumentId;
    title: string;
    description: string;
    can_submit: boolean;
    latest: Submission | null;
    history: Submission[];
};

type Props = {
    documents: PracticeDocument[];
    required_count: number;
    delivered_count: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Prácticas Pre-Profesionales', href: '/internship' },
];

// TODO: cambiar por la ruta de Wayfinder cuando se genere (academic.internship.report-review.store)
const SUBMIT_URL = '/internship/report-review/submissions';

const formatDate = (iso: string | null) =>
    iso
        ? new Date(iso).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          })
        : '';

function StatusIcon({ submission }: { submission: Submission | null }) {
    if (!submission) return <Clock className="size-5 text-muted-foreground" />;
    if (submission.status === 1)
        return <CheckCircle2 className="size-5 text-green-600" />;
    if (submission.status === 3)
        return <AlertCircle className="size-5 text-amber-500" />;
    return <Clock className="size-5 text-blue-500" />;
}

function statusText(submission: Submission | null) {
    if (!submission) return 'Pendiente de entrega';
    if (submission.status === 1) return 'Aprobado';
    if (submission.status === 3) return 'Observado, debes reenviarlo';
    return 'En revisión';
}

export default function ReportReview({
    documents,
    required_count,
    delivered_count,
}: Props) {
    const [selectedType, setSelectedType] = useState<DocumentId>('plan');
    const [files, setFiles] = useState<Record<DocumentId, File | null>>({
        plan: null,
        report: null,
    });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const current = documents.find((d) => d.id === selectedType)!;
    const selectedFile = files[selectedType];
    const latest = current.latest;

    const handleFileChange = (file: File | undefined) => {
        if (!file) return;
        setError(null);
        setFiles((prev) => ({ ...prev, [selectedType]: file }));
    };

    const handleSubmit = () => {
        if (!selectedFile) return;

        router.post(
            SUBMIT_URL,
            { type: selectedType, file: selectedFile },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => {
                    setProcessing(true);
                    setError(null);
                },
                onSuccess: () =>
                    setFiles((prev) => ({ ...prev, [selectedType]: null })),
                onError: (errors) =>
                    setError(
                        errors.file ??
                            errors.type ??
                            'No se pudo enviar el documento.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rev. Informe" />

            <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Encabezado */}
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title="Rev. Informe"
                        description="Gestiona tu plan, informe y revisa las observaciones de tu docente."
                    />

                    <div className="hidden items-center gap-2 rounded-lg border bg-card px-3 py-2 md:flex">
                        <ClipboardCheck className="size-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs font-medium">Mis entregas</p>
                            <p className="text-xs text-muted-foreground">
                                {delivered_count} de {required_count} documentos
                                entregados
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
                                            {statusText(document.latest)}
                                        </p>
                                    </div>
                                </div>
                                <StatusIcon submission={document.latest} />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Paneles principales */}
                <div className="flex flex-col items-start gap-6 lg:flex-row">
                    {/* Panel izquierdo */}
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
                                                {files[document.id]?.name ??
                                                    document.latest?.file
                                                        ?.name ??
                                                    'Sin archivo seleccionado'}
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
                                        Selecciona el archivo correspondiente a
                                        cada documento.
                                    </p>
                                    <p>
                                        <Eye className="mr-2 inline size-4" />
                                        Revisa las observaciones de tu docente
                                        para conocer las correcciones.
                                    </p>
                                    <p>
                                        <History className="mr-2 inline size-4" />
                                        Consulta tus entregas anteriores en el
                                        historial.
                                    </p>
                                </div>
                            </SectionCard.Body>
                        </SectionCard>
                    </div>

                    {/* Panel central */}
                    <div className="w-full min-w-0 flex-1">
                        <SectionCard>
                            <SectionCard.Header>
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                        <FileText className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            {current.title}
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {selectedFile
                                                ? 'Archivo listo para enviar'
                                                : statusText(latest)}
                                        </p>
                                    </div>
                                </div>
                            </SectionCard.Header>

                            <SectionCard.Body>
                                <div className="space-y-5">
                                    <p className="text-sm text-muted-foreground">
                                        {current.description}
                                    </p>

                                    {!current.can_submit ? (
                                        <div className="space-y-3 rounded-xl border p-5">
                                            <p className="text-sm font-medium">
                                                {latest?.status === 1
                                                    ? 'Este documento ya fue aprobado.'
                                                    : 'Tu documento está en revisión por el docente supervisor.'}
                                            </p>
                                            {latest?.file && (
                                                <a
                                                    href={latest.file.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                                >
                                                    <ExternalLink className="size-4" />
                                                    {latest.file.name}
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {latest?.status === 3 && (
                                                <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
                                                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                                                    Tu docente observó la última
                                                    entrega. Corrige y vuelve a
                                                    enviarla.
                                                </div>
                                            )}

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
                                                    Haz clic aquí para elegir un
                                                    archivo de tu equipo.
                                                </p>
                                                <input
                                                    id={`file-${selectedType}`}
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    className="sr-only"
                                                    onChange={(event) => {
                                                        handleFileChange(
                                                            event.target
                                                                .files?.[0],
                                                        );
                                                        event.target.value = '';
                                                    }}
                                                />
                                            </label>

                                            {selectedFile && (
                                                <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
                                                    <FileCheck className="size-6 shrink-0 text-primary" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium break-all">
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(
                                                                selectedFile.size /
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
                                                            setFiles(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [selectedType]:
                                                                        null,
                                                                }),
                                                            )
                                                        }
                                                    >
                                                        Quitar
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                                                Formatos permitidos: PDF, DOC y
                                                DOCX, hasta 10 MB. El documento
                                                se envía al docente supervisor
                                                al presionar "Enviar documento".
                                            </div>

                                            {error && (
                                                <p className="text-xs text-destructive">
                                                    {error}
                                                </p>
                                            )}

                                            <Button
                                                type="button"
                                                className="w-full"
                                                disabled={
                                                    !selectedFile || processing
                                                }
                                                onClick={handleSubmit}
                                            >
                                                <Upload className="mr-2 size-4" />
                                                {processing
                                                    ? 'Enviando...'
                                                    : 'Enviar documento'}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </SectionCard.Body>
                        </SectionCard>
                    </div>

                    {/* Panel derecho */}
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
                                            {latest
                                                ? latest.status_label
                                                : 'Sin entrega'}
                                        </p>
                                        {latest?.reviewer && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Revisó: {latest.reviewer}
                                            </p>
                                        )}
                                    </div>

                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Calificación
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold">
                                            {latest?.grade ?? '—'}{' '}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                / 20
                                            </span>
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-xs font-medium">
                                            Observaciones
                                        </p>
                                        <div className="rounded-lg bg-muted/40 p-3">
                                            <p className="text-xs leading-relaxed text-muted-foreground">
                                                {latest?.comment ??
                                                    'Todavía no hay comentarios registrados por el docente.'}
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
                                {current.history.length === 0 ? (
                                    <div className="flex flex-col items-center py-5 text-center">
                                        <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                                            <CalendarDays className="size-5 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium">
                                            Sin registros disponibles
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            Aquí aparecerán las fechas de
                                            entrega, las revisiones, las notas y
                                            las observaciones anteriores.
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="space-y-3">
                                        {current.history.map((item) => (
                                            <li
                                                key={item.id}
                                                className="rounded-lg border p-3 text-xs"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-medium">
                                                        {formatDate(
                                                            item.submitted_at,
                                                        )}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {item.status_label}
                                                    </span>
                                                </div>
                                                {item.grade !== null && (
                                                    <p className="mt-1 text-muted-foreground">
                                                        Nota: {item.grade} / 20
                                                    </p>
                                                )}
                                                {item.comment && (
                                                    <p className="mt-1 text-muted-foreground">
                                                        {item.comment}
                                                    </p>
                                                )}
                                                {item.file && (
                                                    <a
                                                        href={item.file.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
                                                    >
                                                        <ExternalLink className="size-3" />
                                                        <span className="break-all">
                                                            {item.file.name}
                                                        </span>
                                                    </a>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </SectionCard.Body>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
