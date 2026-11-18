import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    Eye,
    Globe,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Sparkles,
    UserCheck,
    Users,
} from 'lucide-react';
import type { CompanyStats } from '@/modules/dashboard/types';
import { formatDate, formatNumber, timeAgo } from '@/modules/dashboard/utils';
import company from '@/routes/company';
import { index as jobboardIndex } from '@/routes/company/jobboard';
import { create as createVacancy } from '@/routes/company/jobboard';
import { edit as editCompanyProfile } from '@/routes/company/profile';
import EmptyState from '@/shared/components/empty-state';
import StatCard from '@/shared/components/stat-card';
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

const vacancyTone: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    pending_review:
        'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    observed:
        'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    published:
        'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
    closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const requestTone: Record<string, string> = {
    pending_review:
        'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    observed:
        'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    awaiting_company:
        'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    accepted:
        'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
    declined: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};

const priorityDot: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
};

function CompanyEmptyState() {
    return (
        <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
                icon={Building2}
                title="Tu cuenta de empresa aún no está activa"
                description="Cuando la coordinación académica active tu empresa podrás publicar vacantes y recibir solicitudes de estudiantes."
            />
        </div>
    );
}

export function CompanyContent({ stats }: { stats: CompanyStats | null }) {
    if (!stats?.company) {
        return <CompanyEmptyState />;
    }

    const {
        company: data,
        profile,
        vacancies,
        candidates,
        requests,
        recentVacancies,
        recentRequests,
        tasks,
    } = stats;

    const initial = data.name.charAt(0).toUpperCase();

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            {/* Cabecera de la empresa */}
            <section className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-primary/10 via-background to-primary/5 p-5 md:p-7">
                <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/10 blur-3xl" />

                <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                        {data.logo_url ? (
                            <img
                                src={data.logo_url}
                                alt={`Logo de ${data.name}`}
                                className="size-16 shrink-0 rounded-2xl border object-cover shadow-sm md:size-20"
                            />
                        ) : (
                            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-bold text-primary md:size-20 md:text-3xl">
                                {initial}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                                    {data.name}
                                </h1>
                                <Badge className="bg-green-600 text-white">
                                    Cuenta activa
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {data.razon}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                    <Building2 className="size-3.5" />
                                    RUC {data.ruc}
                                </span>
                                {data.phone && (
                                    <span className="inline-flex items-center gap-1">
                                        <Phone className="size-3.5" />
                                        {data.phone}
                                    </span>
                                )}
                                {data.email && (
                                    <span className="inline-flex items-center gap-1">
                                        <Mail className="size-3.5" />
                                        {data.email}
                                    </span>
                                )}
                                {data.website && (
                                    <a
                                        href={data.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 hover:text-foreground"
                                    >
                                        <Globe className="size-3.5" />
                                        {data.website}
                                    </a>
                                )}
                                {data.address && (
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="size-3.5" />
                                        {data.address}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link href={createVacancy().url}>
                                <Plus className="mr-2 size-4" />
                                Nueva vacante
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={editCompanyProfile().url}>
                                <Pencil className="mr-2 size-4" />
                                Editar perfil
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="relative mt-5 rounded-xl border bg-background/70 p-4 backdrop-blur">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="inline-flex items-center gap-2 font-medium">
                            <Sparkles className="size-4 text-primary" />
                            Perfil empresarial
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {profile.completed} de {profile.total} datos ·{' '}
                            {profile.percent}%
                        </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${profile.percent}%` }}
                        />
                    </div>
                    {profile.missing.length > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            Falta completar: {profile.missing.join(', ')}.
                        </p>
                    )}
                </div>
            </section>

            {/* Indicadores */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Vacantes publicadas"
                    value={formatNumber(vacancies.published)}
                    description={`${formatNumber(vacancies.total)} en total · ${formatNumber(vacancies.positions)} puestos activos`}
                    icon={BriefcaseBusiness}
                />
                <StatCard
                    title="Candidatos propuestos"
                    value={formatNumber(candidates.total)}
                    description={`${formatNumber(candidates.proposed)} por revisar · ${formatNumber(candidates.hired)} contratados`}
                    icon={Users}
                />
                <StatCard
                    title="Solicitudes por responder"
                    value={formatNumber(requests.awaitingCompany)}
                    description={`${formatNumber(requests.accepted)} aceptadas · ${formatNumber(requests.total)} en total`}
                    icon={UserCheck}
                    valueClassName={
                        requests.awaitingCompany > 0 ? 'text-amber-600' : ''
                    }
                />
                <StatCard
                    title="Visitas a tus vacantes"
                    value={formatNumber(vacancies.views)}
                    description={`${formatNumber(vacancies.thisMonth)} vacante(s) creadas este mes`}
                    icon={Eye}
                />
            </div>

            {/* Vacantes y solicitudes recientes */}
            <div className="grid gap-4 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Vacantes recientes</CardTitle>
                            <CardDescription>
                                Estado y actividad de tus últimas publicaciones.
                            </CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href={jobboardIndex().url}>
                                Ver todas
                                <ArrowRight className="ml-1 size-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentVacancies.length === 0 ? (
                            <EmptyState
                                className="py-8"
                                icon={BriefcaseBusiness}
                                title="Aún no has publicado vacantes"
                                description="Crea tu primera vacante para que los docentes titulares puedan proponer estudiantes."
                            >
                                <Button asChild size="sm" className="mt-3">
                                    <Link href={createVacancy().url}>
                                        <Plus className="mr-2 size-4" />
                                        Publicar vacante
                                    </Link>
                                </Button>
                            </EmptyState>
                        ) : (
                            <ul className="space-y-3">
                                {recentVacancies.map((vacancy) => (
                                    <li
                                        key={vacancy.id}
                                        className="rounded-lg border p-3 transition-colors hover:bg-muted/40"
                                    >
                                        <Link
                                            href={
                                                jobboardIndex({
                                                    query: { v: vacancy.id },
                                                }).url
                                            }
                                            className="block"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 space-y-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {vacancy.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {vacancy.type_label} ·{' '}
                                                        {vacancy.modality_label}{' '}
                                                        ·{' '}
                                                        {formatNumber(
                                                            vacancy.candidates_count,
                                                        )}{' '}
                                                        candidato(s) ·{' '}
                                                        {formatNumber(
                                                            vacancy.views_count,
                                                        )}{' '}
                                                        visita(s)
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {vacancy.published_at
                                                            ? `Publicada ${timeAgo(vacancy.published_at)}`
                                                            : `Actualizada ${timeAgo(vacancy.updated_at)}`}
                                                        {vacancy.deadline_at
                                                            ? ` · Vence ${formatDate(vacancy.deadline_at)}`
                                                            : ''}
                                                    </p>
                                                </div>
                                                <Badge
                                                    className={cn(
                                                        'shrink-0',
                                                        vacancyTone[
                                                            vacancy.status
                                                        ] ??
                                                            'bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    {vacancy.status_label}
                                                </Badge>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Solicitudes recientes</CardTitle>
                            <CardDescription>
                                Estudiantes interesados en tu empresa.
                            </CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href={company.requests.url()}>
                                Ver todas
                                <ArrowRight className="ml-1 size-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentRequests.length === 0 ? (
                            <EmptyState
                                className="py-8"
                                icon={Users}
                                title="Sin solicitudes por ahora"
                                description="Cuando un estudiante solicite realizar prácticas en tu empresa aparecerá aquí."
                            />
                        ) : (
                            <ul className="space-y-3">
                                {recentRequests.map((request) => (
                                    <li
                                        key={request.id}
                                        className="rounded-lg border p-3 transition-colors hover:bg-muted/40"
                                    >
                                        <Link
                                            href={company.requests.url()}
                                            className="block space-y-1"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="truncate text-sm font-medium">
                                                    {request.student}
                                                </p>
                                                <Badge
                                                    className={cn(
                                                        'shrink-0',
                                                        requestTone[
                                                            request.state
                                                        ] ??
                                                            'bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    {request.state_label}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {request.school ??
                                                    'Escuela no registrada'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Actualizada{' '}
                                                {timeAgo(request.updated_at)}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Acciones sugeridas y resumen */}
            <div className="grid gap-4 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Acciones sugeridas</CardTitle>
                        <CardDescription>
                            Lo que puedes hacer para avanzar con tu empresa.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tasks.length === 0 ? (
                            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-500/10 p-4 text-sm text-green-800 dark:border-green-900 dark:text-green-300">
                                <CheckCircle2 className="size-5 shrink-0" />
                                <p>
                                    Todo al día. No tienes acciones pendientes
                                    por ahora.
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {tasks.map((task) => (
                                    <li key={task.title}>
                                        <Link
                                            href={task.href}
                                            className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                                        >
                                            <span
                                                className={cn(
                                                    'mt-1.5 size-2 shrink-0 rounded-full',
                                                    priorityDot[
                                                        task.priority
                                                    ] ?? 'bg-muted-foreground',
                                                )}
                                            />
                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                <p className="text-sm font-medium">
                                                    {task.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {task.detail}
                                                </p>
                                            </div>
                                            <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Resumen de la bolsa laboral</CardTitle>
                        <CardDescription>
                            Distribución de vacantes y candidatos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div>
                            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Vacantes
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <SummaryRow
                                    label="Publicadas"
                                    value={vacancies.published}
                                />
                                <SummaryRow
                                    label="Borradores"
                                    value={vacancies.draft}
                                />
                                <SummaryRow
                                    label="En revisión"
                                    value={vacancies.pendingReview}
                                />
                                <SummaryRow
                                    label="Observadas"
                                    value={vacancies.observed}
                                />
                                <SummaryRow
                                    label="Cerradas"
                                    value={vacancies.closed}
                                />
                                <SummaryRow
                                    label="Total"
                                    value={vacancies.total}
                                />
                            </div>
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Candidatos
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <SummaryRow
                                    label="Propuestos"
                                    value={candidates.proposed}
                                />
                                <SummaryRow
                                    label="Contactados"
                                    value={candidates.contacted}
                                />
                                <SummaryRow
                                    label="Contratados"
                                    value={candidates.hired}
                                />
                                <SummaryRow
                                    label="Descartados"
                                    value={candidates.discarded}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold tabular-nums">
                {formatNumber(value)}
            </span>
        </div>
    );
}
