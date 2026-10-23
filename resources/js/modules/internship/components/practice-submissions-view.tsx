import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Clock,
    ExternalLink,
    Eye,
    FileText,
    GraduationCap,
    History,
    MessageSquare,
    Building2,
    Search,
    UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import Heading from '@/shared/components/heading';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import AppLayout from '@/shared/layouts/app-layout';
import type { BreadcrumbItem } from '@/shared/types';

export type SubmissionRecord = {
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

export type SupervisorSubmission = SubmissionRecord & {
    student: string;
    code: string | null;
    career: string | null;
    company: string | null;
    can_review: boolean;
    history: SubmissionRecord[];
};

type Props = {
    kind: 'plan' | 'report';
    submissions: SupervisorSubmission[];
};

type StatusFilter = 'Todos' | '2' | '3' | '1';

// TODO: cambiar por la ruta de Wayfinder cuando se genere (academic.supervision.practice.review)
const reviewUrl = (id: number) =>
    `/supervision/practice-submissions/${id}/review`;

const statusStyles: Record<number, string> = {
    2: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    3: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
    1: 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400',
};

const statusLabel: Record<number, string> = {
    2: 'Pendiente',
    3: 'Observado',
    1: 'Aprobado',
};

const formatDate = (iso: string | null) =>
    iso
        ? new Date(iso).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          })
        : '';

function StatusBadge({ status }: { status: 1 | 2 | 3 }) {
    const Icon =
        status === 2 ? Clock : status === 3 ? AlertCircle : CheckCircle2;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${statusStyles[status]}`}
        >
            <Icon className="size-3.5" />
            {statusLabel[status]}
        </span>
    );
}

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: number;
    description: string;
    icon: typeof ClipboardList;
}) {
    return (
        <div className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Icon className="size-5 text-muted-foreground" />
                </div>
            </div>
        </div>
    );
}

function ReviewForm({ submission }: { submission: SupervisorSubmission }) {
    const [grade, setGrade] = useState('');
    const [comment, setComment] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const send = (approvalStatus: 1 | 3) => {
        router.patch(
            reviewUrl(submission.id),
            {
                approval_status: approvalStatus,
                grade: grade === '' ? null : grade,
                comment: comment.trim() === '' ? null : comment,
            },
            {
                preserveScroll: true,
                onStart: () => {
                    setProcessing(true);
                    setError(null);
                },
                onError: (errors) =>
                    setError(
                        errors.grade ??
                            errors.comment ??
                            errors.approval_status ??
                            'No se pudo registrar la revisión.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="space-y-4">
            <div>
                <label
                    htmlFor="grade"
                    className="text-xs font-medium text-muted-foreground"
                >
                    Calificación (0 a 20)
                </label>
                <input
                    id="grade"
                    type="number"
                    min={0}
                    max={20}
                    step="0.5"
                    value={grade}
                    onChange={(event) => setGrade(event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
            </div>

            <div>
                <label
                    htmlFor="comment"
                    className="text-xs font-medium text-muted-foreground"
                >
                    Observaciones
                </label>
                <textarea
                    id="comment"
                    rows={4}
                    maxLength={500}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Escribe las correcciones para el estudiante..."
                    className="mt-1 w-full rounded-lg border bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="grid grid-cols-2 gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={processing || comment.trim() === ''}
                    onClick={() => send(3)}
                >
                    <AlertCircle className="mr-1.5 size-4" />
                    Observar
                </Button>
                <Button
                    type="button"
                    disabled={processing || grade === ''}
                    onClick={() => send(1)}
                >
                    <CheckCircle2 className="mr-1.5 size-4" />
                    Aprobar
                </Button>
            </div>
        </div>
    );
}

export default function PracticeSubmissionsView({ kind, submissions }: Props) {
    const isPlan = kind === 'plan';
    const plural = isPlan ? 'Planes de prácticas' : 'Informes de prácticas';
    const singular = isPlan ? 'plan' : 'informe';
    const href = isPlan
        ? '/internship/practice-plans'
        : '/internship/practice-reports';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Documentos de prácticas', href },
        { title: plural, href },
    ];

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return submissions.filter((item) => {
            const matchesSearch =
                !query ||
                [item.student, item.code, item.company, item.career].some(
                    (value) => (value ?? '').toLowerCase().includes(query),
                );

            return (
                matchesSearch &&
                (statusFilter === 'Todos' ||
                    String(item.status) === statusFilter)
            );
        });
    }, [submissions, search, statusFilter]);

    const selected =
        filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

    const countByStatus = (status: number) =>
        submissions.filter((item) => item.status === status).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={plural} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        variant="small"
                        title={plural}
                        description={`Revisa y califica los ${isPlan ? 'planes' : 'informes'} de prácticas de los estudiantes asignados.`}
                    />

                    <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5">
                        <ClipboardCheck className="size-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">
                                Supervisión académica
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Seguimiento de {isPlan ? 'planes' : 'informes'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title={`Total de ${isPlan ? 'planes' : 'informes'}`}
                        value={submissions.length}
                        description="Estudiantes que ya entregaron"
                        icon={ClipboardList}
                    />
                    <SummaryCard
                        title="Pendientes"
                        value={countByStatus(2)}
                        description="A la espera de revisión"
                        icon={Clock}
                    />
                    <SummaryCard
                        title="Observados"
                        value={countByStatus(3)}
                        description="Requieren corrección"
                        icon={AlertCircle}
                    />
                    <SummaryCard
                        title="Aprobados"
                        value={countByStatus(1)}
                        description="Ya calificados"
                        icon={CheckCircle2}
                    />
                </div>

                <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
                    {/* Tabla */}
                    <div className="min-w-0">
                        <SectionCard>
                            <SectionCard.Header>
                                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold">
                                            Relación de {isPlan ? 'planes' : 'informes'}
                                        </h2>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Busca un estudiante para ver su {singular}.
                                        </p>
                                    </div>
                                    <span className="w-fit rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium">
                                        {filtered.length} resultados
                                    </span>
                                </div>
                            </SectionCard.Header>

                            <SectionCard.Body className="space-y-4">
                                <div className="flex flex-col gap-3 md:flex-row">
                                    <div className="relative min-w-0 flex-1">
                                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            placeholder="Buscar estudiante, DNI o empresa..."
                                            aria-label="Buscar"
                                            className="h-10 w-full rounded-lg border bg-background pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    </div>

                                    <select
                                        value={statusFilter}
                                        onChange={(event) =>
                                            setStatusFilter(
                                                event.target.value as StatusFilter,
                                            )
                                        }
                                        aria-label="Filtrar por estado"
                                        className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary sm:w-44"
                                    >
                                        <option value="Todos">Todos los estados</option>
                                        <option value="2">Pendiente</option>
                                        <option value="3">Observado</option>
                                        <option value="1">Aprobado</option>
                                    </select>
                                </div>

                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full min-w-[680px] text-left text-sm">
                                        <thead className="bg-muted/50 text-xs text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Estudiante</th>
                                                <th className="px-4 py-3 font-medium">Empresa</th>
                                                <th className="px-4 py-3 font-medium">Fecha</th>
                                                <th className="px-4 py-3 font-medium">Estado</th>
                                                <th className="px-4 py-3 text-right font-medium">Detalle</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filtered.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                                                        selected?.id === item.id
                                                            ? 'bg-primary/5'
                                                            : ''
                                                    }`}
                                                    onClick={() => setSelectedId(item.id)}
                                                >
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                                <UserRound className="size-4 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{item.student}</p>
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    DNI: {item.code ?? 'Sin dato'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-muted-foreground">
                                                        {item.company ?? 'Sin empresa'}
                                                    </td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                                                        {formatDate(item.submitted_at)}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <StatusBadge status={item.status} />
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setSelectedId(item.id);
                                                            }}
                                                        >
                                                            <Eye className="mr-1.5 size-3.5" />
                                                            Ver
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {filtered.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-12 text-center">
                                                        <Search className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                                                        <p className="text-sm font-medium">
                                                            {submissions.length === 0
                                                                ? `Aún no hay ${isPlan ? 'planes' : 'informes'} entregados`
                                                                : 'No se encontraron resultados'}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {submissions.length === 0
                                                                ? 'Aparecerán cuando tus estudiantes los envíen.'
                                                                : 'Cambia la búsqueda o selecciona otro estado.'}
                                                        </p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionCard.Body>
                        </SectionCard>
                    </div>

                    {/* Detalle */}
                    <div className="min-w-0 space-y-4">
                        {selected ? (
                            <>
                                <SectionCard>
                                    <SectionCard.Header>
                                        <div className="flex w-full items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                                                    <FileText className="size-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-base font-semibold">
                                                        Detalle del {singular}
                                                    </h2>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Entrega seleccionada
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={selected.status} />
                                        </div>
                                    </SectionCard.Header>

                                    <SectionCard.Body className="space-y-5">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Estudiante</p>
                                                    <p className="mt-1 text-sm font-medium">{selected.student}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        DNI: {selected.code ?? 'Sin dato'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <GraduationCap className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Escuela profesional</p>
                                                    <p className="mt-1 text-sm">{selected.career ?? 'Sin dato'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Centro de prácticas</p>
                                                    <p className="mt-1 text-sm">{selected.company ?? 'Sin empresa'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Fecha de entrega</p>
                                                    <p className="mt-1 text-sm">{formatDate(selected.submitted_at)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {selected.file && (
                                            <a
                                                href={selected.file.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 rounded-lg border p-3 text-sm text-primary hover:bg-muted/40"
                                            >
                                                <ExternalLink className="size-4 shrink-0" />
                                                <span className="break-all">{selected.file.name}</span>
                                            </a>
                                        )}
                                    </SectionCard.Body>
                                </SectionCard>

                                <SectionCard>
                                    <SectionCard.Header>
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="size-4" />
                                            <h2 className="text-sm font-semibold">Evaluación</h2>
                                        </div>
                                    </SectionCard.Header>
                                    <SectionCard.Body>
                                        {selected.can_review ? (
                                            <ReviewForm key={selected.id} submission={selected} />
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="rounded-lg border p-3">
                                                    <p className="text-xs text-muted-foreground">Calificación</p>
                                                    <p className="mt-1 text-2xl font-semibold">
                                                        {selected.grade ?? '—'}{' '}
                                                        <span className="text-sm font-normal text-muted-foreground">/ 20</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="mb-2 text-xs font-medium">Observaciones</p>
                                                    <div className="rounded-lg bg-muted/40 p-3">
                                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                                            {selected.comment ?? 'Sin observaciones.'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {selected.status === 3 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Esperando que el estudiante reenvíe el documento.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </SectionCard.Body>
                                </SectionCard>

                                {selected.history.length > 0 && (
                                    <SectionCard>
                                        <SectionCard.Header>
                                            <div className="flex items-center gap-2">
                                                <History className="size-4" />
                                                <h2 className="text-sm font-semibold">Entregas anteriores</h2>
                                            </div>
                                        </SectionCard.Header>
                                        <SectionCard.Body>
                                            <ul className="space-y-3">
                                                {selected.history.map((item) => (
                                                    <li key={item.id} className="rounded-lg border p-3 text-xs">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="font-medium">{formatDate(item.submitted_at)}</span>
                                                            <span className="text-muted-foreground">{item.status_label}</span>
                                                        </div>
                                                        {item.comment && (
                                                            <p className="mt-1 text-muted-foreground">{item.comment}</p>
                                                        )}
                                                        {item.file && (
                                                            <a
                                                                href={item.file.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
                                                            >
                                                                <ExternalLink className="size-3" />
                                                                <span className="break-all">{item.file.name}</span>
                                                            </a>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </SectionCard.Body>
                                    </SectionCard>
                                )}
                            </>
                        ) : (
                            <SectionCard>
                                <SectionCard.Body className="flex flex-col items-center py-12 text-center">
                                    <FileText className="mb-3 size-10 text-muted-foreground/50" />
                                    <h3 className="text-sm font-semibold">Selecciona una entrega</h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Elige un registro de la tabla para ver su detalle.
                                    </p>
                                </SectionCard.Body>
                            </SectionCard>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
