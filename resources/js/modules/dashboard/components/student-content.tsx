import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    Bell,
    BookOpenCheck,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    ExternalLink,
    FileCheck2,
    FileText,
    GraduationCap,
    Layers,
    ListTodo,
    MapPin,
    UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import type {
    StudentActivity,
    StudentDocument,
    StudentModule,
    StudentStats,
    StudentSubmission,
} from '@/modules/dashboard/types';
import {
    formatDate,
    formatNumber,
    timeAgo,
    toneClasses,
} from '@/modules/dashboard/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Estilos y constantes                                                      */
/* -------------------------------------------------------------------------- */

const statusStyles: Record<number, string> = {
    0: 'bg-muted text-muted-foreground',
    1: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
    2: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    3: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

const statusIcons: Record<number, LucideIcon> = {
    0: FileText,
    1: CheckCircle2,
    2: Clock,
    3: AlertTriangle,
};

const activityIcons: Record<StudentActivity['tone'], LucideIcon> = {
    success: CheckCircle2,
    warning: Clock,
    danger: AlertTriangle,
    info: FileText,
    muted: Clock,
};

const priorityStyles = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
};

const priorityRank = { high: 0, medium: 1, low: 2 };

// Lo que pide acción (observado) va primero; lo aprobado, al final.
const statusRank: Record<number, number> = { 3: 0, 2: 1, 0: 2, 1: 3 };

const ACTIVITY_PREVIEW = 4;

const enter =
    'animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both motion-reduce:animate-none';

/* -------------------------------------------------------------------------- */
/*  Hooks de animación                                                        */
/* -------------------------------------------------------------------------- */

function prefersReducedMotion() {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
}

/** Cuenta de 0 al valor final. Respeta "reducir movimiento". */
function useCountUp(target: number, duration = 900) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (prefersReducedMotion()) {
            // Sin animación: el valor final se asigna en el próximo cuadro (no dentro del efecto).
            const id = requestAnimationFrame(() => setValue(target));

            return () => cancelAnimationFrame(id);
        }

        let frame = 0;
        const start = performance.now();

        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);

            setValue(Math.round(target * eased));

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return value;
}

/** Devuelve true tras el primer pintado, para animar barras desde 0. */
function useReady() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setReady(true));

        return () => cancelAnimationFrame(frame);
    }, []);

    return ready;
}

/* -------------------------------------------------------------------------- */
/*  Piezas pequeñas                                                           */
/* -------------------------------------------------------------------------- */

function clamp(value: number) {
    return Math.min(100, Math.max(0, value));
}

function StatusBadge({ status, label }: { status: number; label: string }) {
    const Icon = statusIcons[status] ?? FileText;

    return (
        <Badge
            variant="outline"
            className={cn(
                'gap-1 border-transparent',
                statusStyles[status] ?? statusStyles[0],
            )}
        >
            <Icon className="size-3" />
            {label}
        </Badge>
    );
}

function ProgressBar({
    value,
    tone = 'bg-primary',
    dot = false,
}: {
    value: number;
    tone?: string;
    dot?: boolean;
}) {
    const ready = useReady();
    const width = ready ? clamp(value) : 0;

    return (
        <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(clamp(value))}
            className="relative h-2 w-full rounded-full bg-muted"
        >
            <div
                className={cn(
                    'h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none',
                    tone,
                )}
                style={{ width: `${width}%` }}
            />
            {dot && (
                <span
                    className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-blue-500 shadow transition-[left] duration-1000 ease-out motion-reduce:transition-none"
                    style={{ left: `${width}%` }}
                />
            )}
        </div>
    );
}

function DocumentRow({
    document,
    href,
}: {
    document: StudentDocument;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className={cn(
                        'rounded-md p-2 transition-transform group-hover:scale-110',
                        statusStyles[document.status] ?? statusStyles[0],
                    )}
                >
                    <FileText className="size-4" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                        {document.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {document.comment ||
                            (document.updated_at
                                ? `Actualizado ${timeAgo(document.updated_at)}`
                                : 'Aún no subido')}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <StatusBadge
                    status={document.status}
                    label={document.status_label}
                />
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
        </Link>
    );
}

function SubmissionCard({ submission }: { submission: StudentSubmission }) {
    return (
        <div className="rounded-lg border p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <FileCheck2 className="size-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{submission.title}</p>
                </div>
                <StatusBadge
                    status={submission.status}
                    label={submission.status_label}
                />
            </div>

            <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                <span>Entregas: {formatNumber(submission.attempts)}</span>
                <span>Nota: {submission.grade ?? '—'}</span>
                {submission.submitted_at && (
                    <span>Enviado {timeAgo(submission.submitted_at)}</span>
                )}
                {submission.reviewer && (
                    <span>Revisó: {submission.reviewer}</span>
                )}
            </div>

            {submission.comment && (
                <p className="mt-2 rounded-md bg-muted/50 p-2 text-xs">
                    {submission.comment}
                </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
                {submission.file_url && (
                    <Button asChild variant="outline" size="sm">
                        <a
                            href={submission.file_url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <ExternalLink />
                            Ver archivo
                        </a>
                    </Button>
                )}
                {submission.can_submit && (
                    <Button asChild size="sm">
                        <Link href="/internship/report-review">
                            {submission.status === 0
                                ? 'Subir documento'
                                : 'Reenviar entrega'}
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

function ModuleRow({ module }: { module: StudentModule }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold',
                        statusStyles[module.status] ?? statusStyles[0],
                    )}
                >
                    {module.module}
                </div>
                <div>
                    <p className="text-sm font-medium">
                        Módulo {module.module}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {module.evaluated_at
                            ? `Evaluado ${timeAgo(module.evaluated_at)}`
                            : 'Sin evaluar'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {module.grade !== null && (
                    <span className="text-sm font-semibold">
                        {module.grade}
                    </span>
                )}
                <StatusBadge
                    status={module.status}
                    label={module.status_label}
                />
            </div>
        </div>
    );
}

function ActivityTimeline({ activities }: { activities: StudentActivity[] }) {
    return (
        <div className="relative space-y-4 before:absolute before:top-2 before:left-4 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
            {activities.map((activity, index) => {
                const Icon = activityIcons[activity.tone];

                return (
                    <div
                        key={`${activity.title}-${index}`}
                        className={cn('relative flex gap-3', enter)}
                        style={{ animationDelay: `${index * 40}ms` }}
                    >
                        <div
                            className={cn(
                                'z-10 grid size-8 shrink-0 place-items-center rounded-full ring-1 ring-border',
                                toneClasses[activity.tone],
                            )}
                        >
                            <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 pb-1">
                            <p className="text-sm font-medium">
                                {activity.title}
                            </p>
                            {activity.detail && (
                                <p className="truncate text-xs text-muted-foreground">
                                    {activity.detail}
                                </p>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                {timeAgo(activity.at)}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Áreas (resumen + detalle en un solo bloque)                               */
/* -------------------------------------------------------------------------- */

type Entry = { key: string; status: number; node: ReactNode };

type Area = {
    key: string;
    title: string;
    icon: LucideIcon;
    approved: number;
    total: number;
    percent: number;
    tone: string;
    href: string | null;
    cta: string;
    extra?: ReactNode;
    entries: Entry[];
};

function AreaTrigger({
    area,
    active,
    onSelect,
}: {
    area: Area;
    active: boolean;
    onSelect: () => void;
}) {
    const Icon = area.icon;
    const approved = useCountUp(area.approved);
    const attention = area.entries.filter((e) => e.status === 3).length;

    return (
        <div
            className={cn(
                'flex min-w-0 flex-col rounded-xl border bg-card transition-all duration-200 motion-reduce:transition-none',
                active
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'hover:border-primary/40 hover:shadow-sm',
            )}
        >
            <button
                type="button"
                role="tab"
                id={`area-tab-${area.key}`}
                aria-selected={active}
                aria-controls={`area-panel-${area.key}`}
                tabIndex={active ? 0 : -1}
                onClick={onSelect}
                className="flex flex-col gap-2 rounded-t-xl p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <span className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{area.title}</span>
                    </span>
                    {attention > 0 && (
                        <span
                            className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white"
                            title={`${attention} con observaciones`}
                        >
                            {attention}
                        </span>
                    )}
                </span>
                <span className="text-2xl font-bold tabular-nums">
                    {approved}
                    <span className="text-sm font-medium text-muted-foreground">
                        /{area.total}
                    </span>
                </span>
                <ProgressBar value={area.percent} tone={area.tone} />
            </button>

            {area.href ? (
                <Link
                    href={area.href}
                    className="group flex items-center justify-between rounded-b-xl border-t px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
                >
                    {area.cta}
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
            ) : (
                <div className="rounded-b-xl border-t px-3 py-2 text-xs text-muted-foreground">
                    Solo seguimiento
                </div>
            )}
        </div>
    );
}

function AreaPanel({
    area,
    onlyPending,
    onTogglePending,
}: {
    area: Area;
    onlyPending: boolean;
    onTogglePending: () => void;
}) {
    const pendingCount = area.entries.filter((e) => e.status !== 1).length;

    const visible = useMemo(() => {
        const sorted = [...area.entries].sort(
            (a, b) => (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9),
        );

        return onlyPending ? sorted.filter((e) => e.status !== 1) : sorted;
    }, [area.entries, onlyPending]);

    return (
        <div
            role="tabpanel"
            id={`area-panel-${area.key}`}
            aria-labelledby={`area-tab-${area.key}`}
            className="mt-4 space-y-3"
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">
                        {area.approved} de {area.total} aprobados
                    </p>
                    {area.extra}
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant={onlyPending ? 'secondary' : 'ghost'}
                    aria-pressed={onlyPending}
                    onClick={onTogglePending}
                >
                    Solo pendientes
                    <Badge variant="outline" className="px-1.5">
                        {pendingCount}
                    </Badge>
                </Button>
            </div>

            {visible.length === 0 ? (
                <div
                    className={cn(
                        'flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center',
                        enter,
                    )}
                >
                    <CheckCircle2 className="size-7 text-green-600" />
                    <p className="text-sm font-medium">Nada pendiente aquí</p>
                    <p className="text-xs text-muted-foreground">
                        Todo lo de esta sección está aprobado.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {visible.map((entry, index) => (
                        <div
                            key={entry.key}
                            className={enter}
                            style={{ animationDelay: `${index * 40}ms` }}
                        >
                            {entry.node}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Encabezado: identidad + avance de la práctica                             */
/* -------------------------------------------------------------------------- */

function PracticeProgress({
    practice,
}: {
    practice: StudentStats['practice'];
}) {
    const percent = useCountUp(practice.percent);

    const caption = !(practice.start_date && practice.end_date)
        ? 'Aún sin fechas registradas'
        : practice.not_started
          ? `Inicia el ${formatDate(practice.start_date)}`
          : practice.finished
            ? 'Práctica finalizada'
            : `${formatNumber(practice.days_left)} días restantes`;

    return (
        <div className="w-full max-w-sm space-y-3 rounded-xl border bg-muted/30 p-4">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                        <CalendarDays className="size-4 text-muted-foreground" />
                        Avance de la práctica
                    </p>
                    <p className="text-xs text-muted-foreground">{caption}</p>
                </div>
                <span className="text-3xl font-bold tabular-nums">
                    {percent}%
                </span>
            </div>

            <ProgressBar value={practice.percent} tone="bg-blue-500" dot />

            <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                    {practice.start_date
                        ? formatDate(practice.start_date)
                        : 'Inicio'}
                </span>
                <span>
                    {practice.days_elapsed}/{practice.days_total} días
                </span>
                <span>
                    {practice.end_date ? formatDate(practice.end_date) : 'Fin'}
                </span>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Componente principal                                                      */
/* -------------------------------------------------------------------------- */

export default function StudentDashboardContent({
    stats,
}: {
    stats: StudentStats;
}) {
    const {
        meta,
        dossier,
        formalization,
        practice,
        submissions,
        supervision,
        notifications,
        activity,
        tasks,
    } = stats;

    const [activeArea, setActiveArea] = useState('dossier');
    const [onlyPending, setOnlyPending] = useState(false);
    const [showAllActivity, setShowAllActivity] = useState(false);

    const approvedSubmissions = submissions.filter(
        (submission) => submission.status === 1,
    ).length;
    const submissionPercent = submissions.length
        ? Math.round((approvedSubmissions / submissions.length) * 100)
        : 0;

    const formalizationStatus =
        formalization.state === 'approved'
            ? 1
            : formalization.state === 'observed'
              ? 3
              : formalization.percent > 0
                ? 2
                : 0;

    const areas: Area[] = [
        {
            key: 'dossier',
            title: 'Expediente',
            icon: FileText,
            approved: dossier.approved,
            total: dossier.total,
            percent: dossier.percent,
            tone: 'bg-primary',
            href: '/dossier',
            cta: 'Ir a mi expediente',
            entries: dossier.items.map((document) => ({
                key: document.code,
                status: document.status,
                node: <DocumentRow document={document} href="/dossier" />,
            })),
        },
        {
            key: 'formalization',
            title: 'Formalización',
            icon: Building2,
            approved: formalization.approved_documents,
            total: formalization.total_documents,
            percent: formalization.percent,
            tone: 'bg-blue-500',
            href: '/internship/formalization',
            cta: 'Ir a formalización',
            extra: (
                <>
                    <StatusBadge
                        status={formalizationStatus}
                        label={formalization.state_label}
                    />
                    {formalization.company_state && (
                        <span className="text-xs text-muted-foreground">
                            {formalization.company_state_label}
                        </span>
                    )}
                </>
            ),
            entries: formalization.documents.map((document) => ({
                key: document.code,
                status: document.status,
                node: (
                    <DocumentRow
                        document={document}
                        href="/internship/formalization"
                    />
                ),
            })),
        },
        {
            key: 'submissions',
            title: 'Plan e informe',
            icon: BookOpenCheck,
            approved: approvedSubmissions,
            total: submissions.length,
            percent: submissionPercent,
            tone: 'bg-emerald-500',
            href: '/internship/report-review',
            cta: 'Ir a plan e informe',
            entries: submissions.map((submission) => ({
                key: String(submission.type),
                status: submission.status,
                node: <SubmissionCard submission={submission} />,
            })),
        },
        {
            key: 'supervision',
            title: 'Supervisión',
            icon: Layers,
            approved: supervision.approved,
            total: supervision.total,
            percent: supervision.percent,
            tone: 'bg-violet-500',
            href: null,
            cta: '',
            entries: supervision.modules.map((module) => ({
                key: String(module.module),
                status: module.status,
                node: <ModuleRow module={module} />,
            })),
        },
    ];

    const current = areas.find((area) => area.key === activeArea) ?? areas[0];

    const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
            return;
        }

        event.preventDefault();

        const index = areas.findIndex((area) => area.key === current.key);
        const step = event.key === 'ArrowRight' ? 1 : -1;
        const next = areas[(index + step + areas.length) % areas.length];

        setActiveArea(next.key);
        document.getElementById(`area-tab-${next.key}`)?.focus();
    };

    const sortedTasks = [...tasks].sort(
        (a, b) => priorityRank[a.priority] - priorityRank[b.priority],
    );

    const visibleActivity = showAllActivity
        ? activity
        : activity.slice(0, ACTIVITY_PREVIEW);

    const hiddenActivity = activity.length - ACTIVITY_PREVIEW;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            {/* 1. Quién soy y cuánto llevo */}
            <Card>
                <CardContent className="flex flex-col gap-6 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-primary/10 p-3 text-primary">
                            <GraduationCap className="size-7" />
                        </div>
                        <div className="space-y-2">
                            <div className="space-y-0.5">
                                <h1 className="text-xl font-semibold">
                                    {meta.name}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {[
                                        meta.code && `Código ${meta.code}`,
                                        meta.school,
                                        meta.faculty,
                                        meta.semester,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ') || 'Sin datos académicos'}
                                </p>
                            </div>
                            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                <li className="flex items-center gap-1.5">
                                    <Building2 className="size-4 text-muted-foreground" />
                                    {meta.company ?? 'Sin empresa registrada'}
                                </li>
                                {meta.position && (
                                    <li className="flex items-center gap-1.5">
                                        <MapPin className="size-4 text-muted-foreground" />
                                        {meta.position}
                                    </li>
                                )}
                                {meta.boss && (
                                    <li className="flex items-center gap-1.5">
                                        <UserRound className="size-4 text-muted-foreground" />
                                        {meta.boss}
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <PracticeProgress practice={practice} />
                </CardContent>
            </Card>

            {/* 2. Qué hago ahora (tareas) y cómo voy (áreas) */}
            <div className="grid gap-4 lg:grid-cols-7">
                {/* Tareas: primero en móvil, a la derecha en escritorio */}
                <Card className="order-1 lg:order-none lg:col-span-3 lg:col-start-5 lg:row-start-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListTodo className="size-4" />
                            Qué hacer ahora
                            <Badge variant="secondary">{tasks.length}</Badge>
                        </CardTitle>
                        <CardDescription>
                            Ordenadas de más a menos urgente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sortedTasks.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-center">
                                <CheckCircle2 className="size-8 text-green-600" />
                                <p className="text-sm font-medium">
                                    ¡Todo al día!
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    No tienes tareas pendientes por ahora.
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {sortedTasks.map((task, index) => (
                                    <li
                                        key={`${task.title}-${index}`}
                                        className={enter}
                                        style={{
                                            animationDelay: `${index * 50}ms`,
                                        }}
                                    >
                                        <Link
                                            href={task.href}
                                            className="group flex items-start gap-3 rounded-lg border p-3 transition-all hover:border-primary/40 hover:bg-muted/50"
                                        >
                                            <span className="relative mt-1.5 flex size-2 shrink-0">
                                                {task.priority === 'high' && (
                                                    <span
                                                        className={cn(
                                                            'absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none',
                                                            priorityStyles.high,
                                                        )}
                                                    />
                                                )}
                                                <span
                                                    className={cn(
                                                        'relative inline-flex size-2 rounded-full',
                                                        priorityStyles[
                                                            task.priority
                                                        ],
                                                    )}
                                                />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-medium group-hover:text-primary">
                                                    {task.title}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {task.detail}
                                                </span>
                                            </span>
                                            <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Áreas: resumen y detalle en un solo bloque */}
                <Card className="order-2 lg:order-none lg:col-span-4 lg:col-start-1 lg:row-span-2 lg:row-start-1">
                    <CardHeader>
                        <CardTitle>Mi avance por área</CardTitle>
                        <CardDescription>
                            Elige un área para ver sus documentos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            role="tablist"
                            aria-label="Áreas de la práctica"
                            className="grid gap-3 sm:grid-cols-2"
                            onKeyDown={onTabKeyDown}
                        >
                            {areas.map((area) => (
                                <AreaTrigger
                                    key={area.key}
                                    area={area}
                                    active={area.key === current.key}
                                    onSelect={() => setActiveArea(area.key)}
                                />
                            ))}
                        </div>

                        <AreaPanel
                            key={current.key}
                            area={current}
                            onlyPending={onlyPending}
                            onTogglePending={() =>
                                setOnlyPending((value) => !value)
                            }
                        />
                    </CardContent>
                </Card>

                {/* Actividad */}
                <Card className="order-3 lg:order-none lg:col-span-3 lg:col-start-5 lg:row-start-2">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="size-4" />
                                Actividad reciente
                            </CardTitle>
                            <CardDescription>
                                Últimos movimientos de tu práctica.
                            </CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/notifications" className="gap-1">
                                {notifications.unread > 0 && (
                                    <Badge className="h-5 min-w-5 px-1.5">
                                        {notifications.unread}
                                    </Badge>
                                )}
                                Notificaciones
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {activity.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Aún no hay actividad registrada.
                            </div>
                        ) : (
                            <>
                                <ActivityTimeline
                                    activities={visibleActivity}
                                />
                                {hiddenActivity > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="w-full"
                                        aria-expanded={showAllActivity}
                                        onClick={() =>
                                            setShowAllActivity(
                                                (value) => !value,
                                            )
                                        }
                                    >
                                        {showAllActivity
                                            ? 'Ver menos'
                                            : `Ver ${hiddenActivity} más`}
                                        <ChevronDown
                                            className={cn(
                                                'transition-transform duration-200',
                                                showAllActivity && 'rotate-180',
                                            )}
                                        />
                                    </Button>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
