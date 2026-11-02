import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    Bell,
    BookOpenCheck,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/shared/components/ui/tabs';
import { cn } from '@/shared/lib/utils';

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
}: {
    value: number;
    tone?: string;
}) {
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
                className={cn(
                    'h-full rounded-full transition-all duration-500',
                    tone,
                )}
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
}

function Donut({ value }: { value: number }) {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const safeValue = Math.min(100, Math.max(0, value));
    const offset = circumference - (safeValue / 100) * circumference;

    return (
        <div className="relative grid size-24 shrink-0 place-items-center">
            <svg className="size-24 -rotate-90" viewBox="0 0 80 80">
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    strokeWidth="8"
                    className="stroke-border"
                />
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="stroke-primary transition-all duration-500"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <span className="absolute text-lg font-bold">
                {Math.round(safeValue)}%
            </span>
        </div>
    );
}

function KpiCard({
    title,
    value,
    hint,
    icon: Icon,
    percent,
    tone,
}: {
    title: string;
    value: string;
    hint: string;
    icon: LucideIcon;
    percent: number;
    tone?: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{hint}</p>
                <ProgressBar value={percent} tone={tone} />
            </CardContent>
        </Card>
    );
}

function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-lg border p-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="truncate text-sm font-medium">{value}</p>
            </div>
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
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className={cn(
                        'rounded-md p-2',
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
                <Button asChild variant="ghost" size="icon-sm">
                    <Link href={href} aria-label={`Abrir ${document.title}`}>
                        <ChevronRight />
                    </Link>
                </Button>
            </div>
        </div>
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
                        className="relative flex gap-3"
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

const quickLinks: {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
}[] = [
    {
        title: 'Mi expediente',
        description: 'Ficha de matrícula y récord académico.',
        href: '/dossier',
        icon: FileText,
    },
    {
        title: 'Formalización',
        description: 'Empresa, jefe inmediato y documentos.',
        href: '/internship',
        icon: Building2,
    },
    {
        title: 'Plan e informe',
        description: 'Entrega y revisa tus documentos de práctica.',
        href: '/internship/report-review',
        icon: BookOpenCheck,
    },
    {
        title: 'Notificaciones',
        description: 'Observaciones, aprobaciones y avisos.',
        href: '/notifications',
        icon: Bell,
    },
];

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

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <Card className="overflow-hidden">
                <CardContent className="flex flex-col gap-6 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-primary/10 p-3 text-primary">
                            <GraduationCap className="size-7" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Panel del estudiante
                            </p>
                            <h1 className="text-xl font-semibold">
                                {meta.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {[meta.school, meta.faculty, meta.semester]
                                    .filter(Boolean)
                                    .join(' · ') || 'Sin datos académicos'}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {meta.code && (
                                    <Badge variant="secondary">
                                        Código {meta.code}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="gap-1">
                                    <Building2 className="size-3" />
                                    {meta.company ?? 'Sin empresa'}
                                </Badge>
                                {meta.position && (
                                    <Badge variant="outline">
                                        {meta.position}
                                    </Badge>
                                )}
                                {meta.boss && (
                                    <Badge variant="outline" className="gap-1">
                                        <UserRound className="size-3" />
                                        {meta.boss}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
                        <Donut value={practice.percent} />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold">
                                Avance de la práctica
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {practice.start_date && practice.end_date
                                    ? practice.not_started
                                        ? `Inicia el ${formatDate(
                                              practice.start_date,
                                          )}`
                                        : practice.finished
                                          ? 'Práctica finalizada'
                                          : `${formatNumber(
                                                practice.days_left,
                                            )} días restantes`
                                    : 'Aún sin fechas registradas'}
                            </p>
                            <Button asChild size="sm" className="mt-1">
                                <Link href="/internship">
                                    Ver formalización
                                    <ChevronRight />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Expediente"
                    value={`${dossier.approved}/${dossier.total}`}
                    hint={`${dossier.percent}% de documentos aprobados`}
                    icon={FileText}
                    percent={dossier.percent}
                />
                <KpiCard
                    title="Formalización"
                    value={`${formalization.percent}%`}
                    hint={formalization.state_label}
                    icon={Building2}
                    percent={formalization.percent}
                    tone="bg-blue-500"
                />
                <KpiCard
                    title="Plan e informe"
                    value={`${approvedSubmissions}/${submissions.length}`}
                    hint={`${submissionPercent}% de entregas aprobadas`}
                    icon={BookOpenCheck}
                    percent={submissionPercent}
                    tone="bg-emerald-500"
                />
                <KpiCard
                    title="Supervisión"
                    value={`${supervision.approved}/${supervision.total}`}
                    hint={`${supervision.percent}% de módulos aprobados`}
                    icon={Layers}
                    percent={supervision.percent}
                    tone="bg-violet-500"
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="size-4" />
                            Seguimiento de mi práctica
                        </CardTitle>
                        <CardDescription>
                            Empresa, jefe inmediato y periodo de prácticas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <InfoItem
                                icon={Building2}
                                label="Empresa"
                                value={meta.company ?? 'Sin empresa registrada'}
                            />
                            <InfoItem
                                icon={MapPin}
                                label="Puesto"
                                value={meta.position ?? 'Sin puesto'}
                            />
                            <InfoItem
                                icon={UserRound}
                                label="Jefe inmediato"
                                value={meta.boss ?? 'Sin registrar'}
                            />
                            <InfoItem
                                icon={CalendarDays}
                                label="Periodo"
                                value={
                                    meta.start_date && meta.end_date
                                        ? `${formatDate(
                                              meta.start_date,
                                          )} — ${formatDate(meta.end_date)}`
                                        : 'Sin fechas registradas'
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                    Avance temporal
                                </span>
                                <span className="text-muted-foreground">
                                    {practice.percent}% ·{' '}
                                    {practice.days_elapsed}/
                                    {practice.days_total} días
                                </span>
                            </div>
                            <ProgressBar
                                value={practice.percent}
                                tone="bg-blue-500"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                    {practice.start_date
                                        ? formatDate(practice.start_date)
                                        : 'Inicio'}
                                </span>
                                <span>
                                    {practice.not_started
                                        ? 'Por iniciar'
                                        : practice.finished
                                          ? 'Finalizada'
                                          : `${formatNumber(
                                                practice.days_left,
                                            )} días restantes`}
                                </span>
                                <span>
                                    {practice.end_date
                                        ? formatDate(practice.end_date)
                                        : 'Fin'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
                            <StatusBadge
                                status={formalizationStatus}
                                label={formalization.state_label}
                            />
                            {formalization.company_state && (
                                <span className="text-xs text-muted-foreground">
                                    {formalization.company_state_label}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListTodo className="size-4" />
                            Tareas pendientes
                            <Badge variant="secondary">{tasks.length}</Badge>
                        </CardTitle>
                        <CardDescription>
                            Lo que necesitas completar para avanzar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tasks.length === 0 ? (
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
                                {tasks.map((task, index) => (
                                    <li key={`${task.title}-${index}`}>
                                        <Link
                                            href={task.href}
                                            className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <span
                                                className={cn(
                                                    'mt-1 size-2 shrink-0 rounded-full',
                                                    priorityStyles[
                                                        task.priority
                                                    ],
                                                )}
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-medium group-hover:text-primary">
                                                    {task.title}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {task.detail}
                                                </span>
                                            </span>
                                            <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="size-4" />
                            Documentos y entregas
                        </CardTitle>
                        <CardDescription>
                            Estado de tu expediente, formalización, plan,
                            informe y supervisión.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="dossier" className="w-full">
                            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
                                <TabsTrigger value="dossier">
                                    Expediente
                                </TabsTrigger>
                                <TabsTrigger value="formalization">
                                    Formalización
                                </TabsTrigger>
                                <TabsTrigger value="submissions">
                                    Plan e informe
                                </TabsTrigger>
                                <TabsTrigger value="supervision">
                                    Supervisión
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="dossier"
                                className="mt-4 space-y-2"
                            >
                                {dossier.items.map((document) => (
                                    <DocumentRow
                                        key={document.code}
                                        document={document}
                                        href="/dossier"
                                    />
                                ))}
                                <p className="text-xs text-muted-foreground">
                                    {dossier.approved} de {dossier.total}{' '}
                                    documentos aprobados.
                                </p>
                            </TabsContent>

                            <TabsContent
                                value="formalization"
                                className="mt-4 space-y-2"
                            >
                                {formalization.documents.map((document) => (
                                    <DocumentRow
                                        key={document.code}
                                        document={document}
                                        href="/internship"
                                    />
                                ))}
                                <p className="text-xs text-muted-foreground">
                                    {formalization.approved_documents} de{' '}
                                    {formalization.total_documents} documentos
                                    aprobados.
                                </p>
                            </TabsContent>

                            <TabsContent
                                value="submissions"
                                className="mt-4 space-y-3"
                            >
                                {submissions.map((submission) => (
                                    <SubmissionCard
                                        key={submission.type}
                                        submission={submission}
                                    />
                                ))}
                            </TabsContent>

                            <TabsContent
                                value="supervision"
                                className="mt-4 space-y-2"
                            >
                                {supervision.modules.map((module) => (
                                    <ModuleRow
                                        key={module.module}
                                        module={module}
                                    />
                                ))}
                                <p className="text-xs text-muted-foreground">
                                    {supervision.approved} de{' '}
                                    {supervision.total} módulos aprobados.
                                </p>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
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
                                Ver todo
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {activity.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Aún no hay actividad registrada.
                            </div>
                        ) : (
                            <ActivityTimeline activities={activity} />
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {quickLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="block">
                        <Card className="h-full transition-colors hover:bg-muted/40">
                            <CardContent className="flex items-start gap-3">
                                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                    <link.icon className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        {link.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {link.description}
                                    </p>
                                </div>
                                <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
