import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    FileCheck,
    FileText,
    History as HistoryIcon,
    MessageSquare,
    Upload,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { DragEvent } from 'react';

import {
    enter,
    formatDateTime,
    getDocumentStatusMeta,
    HowToSubmitCard,
    RequirementsList,
    SubmissionPageHeader,
    SubmissionSummary,
    type DocumentRequirement,
} from '@/modules/documents';
import internship from '@/routes/academic/internship';
import PageContainer from '@/shared/components/page-container';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import AppLayout from '@/shared/layouts/app-layout';
import DocumentReviewLayout from '@/shared/layouts/document-review-layout';
import { cn } from '@/shared/lib/utils';
import type { BreadcrumbItem } from '@/shared/types';

import CompanyRequiredCard from '../../components/submission/company-required-card';

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
    can_upload_documents: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Prácticas Pre-Profesionales', href: internship.submission.url() },
];

const SUBMIT_URL = internship.reportReview.store.url();
const MAX_MB = 10;

const STEPS = [
    {
        title: 'Elige el documento',
        description: 'Plan o informe, según lo que vayas a entregar.',
    },
    {
        title: 'Súbelo aquí',
        description: `PDF, DOC o DOCX de hasta ${MAX_MB} MB.`,
    },
    {
        title: 'Espera la revisión de tu docente',
        description: 'Si lo observan, corrígelo y vuelve a enviarlo.',
    },
];

/** Estado compartido: 0 sin iniciar, 1 aprobado, 2 pendiente, 3 observado. */
const metaOf = (submission: Submission | null) =>
    getDocumentStatusMeta(submission?.status ?? 0);

/* -------------------------------------------------------------------------- */
/* Evaluación del docente                                                     */
/* -------------------------------------------------------------------------- */

function EvaluationPanel({ latest }: { latest: Submission | null }) {
    const meta = metaOf(latest);
    const Icon = meta.icon;

    return (
        <SectionCard elevated>
            <SectionCard.Header>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                            <MessageSquare className="size-4 text-muted-foreground" />
                        </div>

                        <div className="min-w-0">
                            <h3 className="text-sm leading-none font-semibold tracking-tight">
                                Evaluación
                            </h3>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                {latest?.reviewer
                                    ? `Revisó ${latest.reviewer}`
                                    : 'Docente supervisor'}
                            </p>
                        </div>
                    </div>

                    <Icon className={cn('size-4 shrink-0', meta.text)} />
                </div>
            </SectionCard.Header>

            <SectionCard.Body className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[11px] text-muted-foreground">
                            Estado
                        </p>
                        <p
                            className={cn(
                                'mt-0.5 text-xs font-semibold',
                                meta.text,
                            )}
                        >
                            {latest ? meta.label : 'Sin entrega'}
                        </p>
                    </div>

                    <p className="text-2xl leading-none font-semibold tabular-nums">
                        {latest?.grade ?? '—'}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                            / 20
                        </span>
                    </p>
                </div>

                <div className="flex gap-2 rounded-md border bg-muted/20 p-2.5">
                    <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />

                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {latest?.comment ??
                            'Todavía no hay observaciones del docente.'}
                    </p>
                </div>
            </SectionCard.Body>
        </SectionCard>
    );
}

/* -------------------------------------------------------------------------- */
/* Historial en línea de tiempo                                               */
/* -------------------------------------------------------------------------- */

const HISTORY_PREVIEW = 3;

function HistoryPanel({ history }: { history: Submission[] }) {
    const [showAll, setShowAll] = useState(false);

    const sorted = useMemo(
        () =>
            [...history].sort(
                (a, b) =>
                    new Date(b.submitted_at).getTime() -
                    new Date(a.submitted_at).getTime(),
            ),
        [history],
    );

    const visible = showAll ? sorted : sorted.slice(0, HISTORY_PREVIEW);
    const hidden = sorted.length - visible.length;

    return (
        <SectionCard className="min-w-0" elevated>
            <SectionCard.Header>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                            <HistoryIcon className="size-4 text-muted-foreground" />
                        </div>

                        <div className="min-w-0">
                            <h3 className="text-sm leading-none font-semibold tracking-tight">
                                Historial
                            </h3>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                Entregas de este documento
                            </p>
                        </div>
                    </div>

                    <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium tabular-nums">
                        {history.length}
                    </span>
                </div>
            </SectionCard.Header>

            <SectionCard.Body className="space-y-4">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-9 text-center">
                        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
                            <HistoryIcon className="size-5 text-muted-foreground/60" />
                        </div>

                        <h4 className="text-sm font-semibold">
                            Aún no hay entregas
                        </h4>

                        <p className="mt-1 max-w-56 text-xs leading-relaxed text-muted-foreground">
                            Cuando envíes el documento, sus revisiones y notas
                            aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="relative space-y-4 before:absolute before:inset-y-2 before:left-[9px] before:w-px before:bg-border">
                            {visible.map((item, index) => {
                                const meta = metaOf(item);
                                const Icon = meta.icon;

                                return (
                                    <article
                                        key={item.id}
                                        className={cn('relative pl-8', enter)}
                                        style={{
                                            animationDelay: `${Math.min(index, 8) * 40}ms`,
                                        }}
                                    >
                                        <span
                                            className={cn(
                                                'absolute top-1 left-0 flex size-[19px] items-center justify-center rounded-full border-[3px] border-background shadow-sm',
                                                meta.dot,
                                            )}
                                        />

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={cn(
                                                        'text-xs font-semibold',
                                                        meta.text,
                                                    )}
                                                >
                                                    {meta.label}
                                                </span>

                                                <span className="text-[11px] text-muted-foreground tabular-nums">
                                                    {formatDateTime(
                                                        item.submitted_at,
                                                    ) ?? 'Fecha desconocida'}
                                                </span>
                                            </div>

                                            <div className="rounded-lg border bg-muted/20 p-3">
                                                <div className="flex items-start gap-2">
                                                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                    <div className="min-w-0 flex-1">
                                                        {item.file ? (
                                                            <a
                                                                href={
                                                                    item.file
                                                                        .url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex max-w-full items-center gap-1 text-xs font-semibold hover:text-primary hover:underline"
                                                            >
                                                                <span className="truncate">
                                                                    {
                                                                        item
                                                                            .file
                                                                            .name
                                                                    }
                                                                </span>
                                                                <ExternalLink className="size-3 shrink-0" />
                                                            </a>
                                                        ) : (
                                                            <p className="text-xs font-semibold">
                                                                Documento
                                                                adjunto
                                                            </p>
                                                        )}

                                                        {item.grade !==
                                                            null && (
                                                            <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                                                                Nota:{' '}
                                                                {item.grade} /
                                                                20
                                                            </p>
                                                        )}

                                                        {item.reviewed_at && (
                                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                                Revisado el{' '}
                                                                {formatDateTime(
                                                                    item.reviewed_at,
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <Icon
                                                        className={cn(
                                                            'size-4 shrink-0',
                                                            meta.text,
                                                        )}
                                                    />
                                                </div>

                                                {item.comment && (
                                                    <div className="mt-3 flex gap-2 rounded-md border bg-background/70 p-2.5">
                                                        <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />

                                                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                                                            {item.comment}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {sorted.length > HISTORY_PREVIEW && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                                aria-expanded={showAll}
                                onClick={() => setShowAll((v) => !v)}
                            >
                                {showAll ? 'Ver menos' : `Ver ${hidden} más`}
                            </Button>
                        )}
                    </>
                )}
            </SectionCard.Body>
        </SectionCard>
    );
}

/* -------------------------------------------------------------------------- */
/* Página                                                                     */
/* -------------------------------------------------------------------------- */

export default function ReportReview({
    documents,
    can_upload_documents,
}: Props) {
    const [selectedType, setSelectedType] = useState<DocumentId>('plan');
    const [files, setFiles] = useState<Record<DocumentId, File | null>>({
        plan: null,
        report: null,
    });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const [previewEnabled, setPreviewEnabled] = useState(true);

    /* Adapta las entregas al formato que espera RequirementsList. */
    const requirements = useMemo(
        () =>
            documents.map((d) => ({
                code: d.id,
                title: d.title,
                status: d.latest?.status ?? 0,
                has_template: false,
                history: [],
                latest: d.latest
                    ? {
                          id: d.latest.id,
                          approval_status: d.latest.status,
                          path: d.latest.file?.url ?? null,
                          name: d.latest.file?.name,
                          size: undefined,
                      }
                    : null,
            })) as unknown as DocumentRequirement[],
        [documents],
    );

    const summaryItems = useMemo(
        () =>
            documents.map((document) => ({
                status: document.latest?.status ?? 0,
                hasFile: Boolean(document.latest),
            })),
        [documents],
    );

    const index = Math.max(
        0,
        documents.findIndex((d) => d.id === selectedType),
    );
    const current = documents[index];
    const selectedFile = files[selectedType];
    const latest = current?.latest ?? null;
    const meta = metaOf(latest);

    /* Vista previa temporal (solo PDF) del archivo elegido. */
    const previewUrl = useMemo(
        () =>
            selectedFile && selectedFile.type === 'application/pdf'
                ? URL.createObjectURL(selectedFile)
                : null,
        [selectedFile],
    );

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const selectType = (id: DocumentId) => {
        setError(null);
        setSelectedType(id);
    };

    const go = (step: number) => {
        const next = documents[index + step];

        if (next) {
            selectType(next.id);
        }
    };

    const setFile = (file: File | null) => {
        setFiles((prev) => ({ ...prev, [selectedType]: file }));
    };

    const handleFileChange = (file: File | undefined) => {
        if (!file) return;

        if (file.size > MAX_MB * 1024 * 1024) {
            setError(
                `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El máximo es ${MAX_MB} MB.`,
            );
            return;
        }

        setError(null);
        setFile(file);
    };

    const onDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setDragging(false);
        handleFileChange(event.dataTransfer.files?.[0]);
    };

    const handleSubmit = () => {
        if (!can_upload_documents || !current?.can_submit) return;
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
                onSuccess: () => setFile(null),
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
            <Head title="Rev. Prácticas" />

            <PageContainer>
                <SubmissionPageHeader
                    title="Revisión de prácticas"
                    description="Entrega tu plan e informe y sigue las observaciones de tu docente."
                >
                    {can_upload_documents && (
                        <SubmissionSummary
                            items={summaryItems}
                            completeTitle="Prácticas completas"
                            completeDetail="Tu plan e informe fueron aprobados."
                            reviewDetail="Espera la respuesta de tu docente."
                        />
                    )}
                </SubmissionPageHeader>

                <CompanyRequiredCard
                    unlocked={can_upload_documents}
                    href={internship.submission.url()}
                    refreshOn={['can_upload_documents', 'documents']}
                >
                    <DocumentReviewLayout
                        hideAside={false}
                        stickyAside
                        documentClassName="relative h-full w-full overflow-hidden"
                        requirements={
                            <>
                                <RequirementsList
                                    requirements={requirements}
                                    selectedType={index}
                                    onSelectType={(i: number) => {
                                        const target = documents[i];

                                        if (target) {
                                            selectType(target.id);
                                        }
                                    }}
                                    previewEnabled={previewEnabled}
                                    onTogglePreview={() =>
                                        setPreviewEnabled((value) => !value)
                                    }
                                    elevated
                                />

                                <HowToSubmitCard
                                    title="Cómo entregar tu documento"
                                    steps={STEPS}
                                    note='Solo se envía al docente cuando presionas "Enviar documento".'
                                    elevated
                                />
                            </>
                        }
                        document={
                            current ? (
                                <SectionCard elevated>
                                    <SectionCard.Header>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div
                                                key={current.id}
                                                className={cn(
                                                    'flex min-w-0 items-center gap-3',
                                                    enter,
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors',
                                                        selectedFile || latest
                                                            ? 'border-primary/20 bg-primary/5'
                                                            : 'bg-muted/50',
                                                    )}
                                                >
                                                    <FileText
                                                        className={cn(
                                                            'size-4',
                                                            selectedFile ||
                                                                latest
                                                                ? 'text-primary'
                                                                : 'text-muted-foreground',
                                                        )}
                                                    />
                                                </div>

                                                <div className="flex min-w-0 flex-col">
                                                    <h3 className="truncate text-sm leading-none font-semibold tracking-tight">
                                                        {current.title}
                                                    </h3>

                                                    <p
                                                        className={cn(
                                                            'mt-1 text-[11px]',
                                                            selectedFile
                                                                ? 'text-primary'
                                                                : meta.text,
                                                        )}
                                                    >
                                                        {selectedFile
                                                            ? 'Archivo listo para enviar'
                                                            : meta.label}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center justify-between gap-1 sm:justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label="Documento anterior"
                                                    disabled={index === 0}
                                                    onClick={() => go(-1)}
                                                >
                                                    <ChevronLeft />
                                                </Button>

                                                <span className="text-xs text-muted-foreground tabular-nums">
                                                    {index + 1}/
                                                    {documents.length}
                                                </span>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label="Documento siguiente"
                                                    disabled={
                                                        index >=
                                                        documents.length - 1
                                                    }
                                                    onClick={() => go(1)}
                                                >
                                                    <ChevronRight />
                                                </Button>
                                            </div>
                                        </div>
                                    </SectionCard.Header>

                                    <SectionCard.Body className="space-y-4">
                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            {current.description}
                                        </p>

                                        {!current.can_submit ? (
                                            <div
                                                className={cn(
                                                    'flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center',
                                                    enter,
                                                )}
                                            >
                                                <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
                                                    <meta.icon
                                                        className={cn(
                                                            'size-5',
                                                            meta.text,
                                                        )}
                                                    />
                                                </div>

                                                <p className="max-w-sm text-sm font-medium">
                                                    {latest?.status === 1
                                                        ? 'Este documento ya fue aprobado'
                                                        : 'Tu documento está en revisión'}
                                                </p>

                                                <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                                                    {latest?.status === 1
                                                        ? 'No necesitas hacer nada más con este documento.'
                                                        : 'Tu docente supervisor lo está revisando.'}
                                                </p>

                                                {latest?.file && (
                                                    <a
                                                        href={latest.file.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-4 inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
                                                    >
                                                        <FileText className="size-3.5 text-muted-foreground" />
                                                        <span className="max-w-56 truncate">
                                                            {latest.file.name}
                                                        </span>
                                                        <ExternalLink className="size-3 text-muted-foreground" />
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                {latest?.status === 3 && (
                                                    <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs">
                                                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                                                        <span>
                                                            Tu docente observó
                                                            la última entrega.
                                                            Corrige y vuelve a
                                                            enviarla.
                                                        </span>
                                                    </div>
                                                )}

                                                {selectedFile ? (
                                                    <div
                                                        className={cn(
                                                            'overflow-hidden rounded-lg border',
                                                            enter,
                                                        )}
                                                    >
                                                        {previewEnabled &&
                                                        previewUrl ? (
                                                            <iframe
                                                                src={previewUrl}
                                                                title={
                                                                    selectedFile.name
                                                                }
                                                                className="h-[420px] w-full bg-muted/30"
                                                            />
                                                        ) : (
                                                            <div className="flex h-40 flex-col items-center justify-center bg-muted/20 text-center">
                                                                <FileCheck className="mb-2 size-7 text-primary" />
                                                                <p className="text-xs text-muted-foreground">
                                                                    {previewEnabled
                                                                        ? 'La vista previa solo está disponible para PDF.'
                                                                        : 'Vista previa desactivada.'}
                                                                </p>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-3 border-t bg-card p-3">
                                                            <FileText className="size-4 shrink-0 text-primary" />

                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-xs font-semibold">
                                                                    {
                                                                        selectedFile.name
                                                                    }
                                                                </p>
                                                                <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                                                                    {(
                                                                        selectedFile.size /
                                                                        1024 /
                                                                        1024
                                                                    ).toFixed(
                                                                        2,
                                                                    )}{' '}
                                                                    MB
                                                                </p>
                                                            </div>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                aria-label="Quitar archivo"
                                                                onClick={() =>
                                                                    setFile(
                                                                        null,
                                                                    )
                                                                }
                                                            >
                                                                <X />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label
                                                        htmlFor={`file-${selectedType}`}
                                                        onDragOver={(event) => {
                                                            event.preventDefault();
                                                            setDragging(true);
                                                        }}
                                                        onDragLeave={() =>
                                                            setDragging(false)
                                                        }
                                                        onDrop={onDrop}
                                                        className={cn(
                                                            'flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors',
                                                            dragging
                                                                ? 'border-primary bg-primary/5'
                                                                : 'hover:border-primary/40 hover:bg-muted/30',
                                                        )}
                                                    >
                                                        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
                                                            <Upload className="size-5 text-muted-foreground" />
                                                        </div>

                                                        <p className="text-sm font-medium">
                                                            {dragging
                                                                ? 'Suelta el archivo'
                                                                : 'Arrastra tu documento o haz clic'}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            PDF, DOC o DOCX ·
                                                            máx. {MAX_MB} MB
                                                        </p>

                                                        <input
                                                            id={`file-${selectedType}`}
                                                            type="file"
                                                            accept=".pdf,.doc,.docx"
                                                            className="sr-only"
                                                            onChange={(
                                                                event,
                                                            ) => {
                                                                handleFileChange(
                                                                    event.target
                                                                        .files?.[0],
                                                                );
                                                                event.target.value =
                                                                    '';
                                                            }}
                                                        />
                                                    </label>
                                                )}

                                                {error && (
                                                    <p
                                                        role="alert"
                                                        className="text-xs text-destructive"
                                                    >
                                                        {error}
                                                    </p>
                                                )}

                                                <Button
                                                    type="button"
                                                    className="w-full"
                                                    disabled={
                                                        !selectedFile ||
                                                        processing
                                                    }
                                                    onClick={handleSubmit}
                                                >
                                                    <Upload />
                                                    {processing
                                                        ? 'Enviando...'
                                                        : 'Enviar documento'}
                                                </Button>
                                            </>
                                        )}
                                    </SectionCard.Body>
                                </SectionCard>
                            ) : (
                                <SectionCard elevated>
                                    <SectionCard.Body className="flex min-h-64 flex-col items-center justify-center text-center">
                                        <FileText className="mb-3 size-8 text-muted-foreground/50" />
                                        <p className="text-sm font-medium">
                                            No hay documentos requeridos
                                        </p>
                                    </SectionCard.Body>
                                </SectionCard>
                            )
                        }
                        aside={
                            current && (
                                <>
                                    <EvaluationPanel latest={latest} />
                                    <HistoryPanel history={current.history} />
                                </>
                            )
                        }
                    />
                </CompanyRequiredCard>
            </PageContainer>
        </AppLayout>
    );
}
