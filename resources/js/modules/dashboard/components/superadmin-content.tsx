import { Link, router } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Briefcase,
    Building2,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    GraduationCap,
    HardDrive,
    ListTodo,
    RefreshCw,
    Server,
    Shield,
    ShieldAlert,
    Users,
    UsersRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { SuperAdminStats } from '@/modules/dashboard/types';
import { formatBytes, formatNumber, timeAgo } from '@/modules/dashboard/utils';
import { index as adminJobBoardIndex } from '@/routes/academic/jobboard/admin';
import { index as studentsIndex } from '@/routes/academic/students';
import { index as resourceIndex } from '@/routes/resource';
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

/* -------------------------------------------------------------------------- */
/*  Animaciones                                                               */
/* -------------------------------------------------------------------------- */

const enter =
    'animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both motion-reduce:animate-none';

const userTypeTones = [
    'bg-primary',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
];

const priorityStyles = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
};

const priorityRank = { high: 0, medium: 1, low: 2 };

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

function usageTone(value: number | null) {
    if (value === null) return 'bg-muted';
    if (value >= 85) return 'bg-red-500';
    if (value >= 60) return 'bg-amber-500';

    return 'bg-green-600';
}

function initials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

function ProgressBar({
    value,
    tone = 'bg-primary',
    label,
}: {
    value: number;
    tone?: string;
    label?: string;
}) {
    const ready = useReady();
    const width = ready ? clamp(value) : 0;

    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(clamp(value))}
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
            <div
                className={cn(
                    'h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none',
                    tone,
                )}
                style={{ width: `${width}%` }}
            />
        </div>
    );
}

function DistributionRow({
    label,
    value,
    percent,
    tone = 'bg-primary',
    showPercent = true,
}: {
    label: string;
    value: number;
    percent: number;
    tone?: string;
    showPercent?: boolean;
}) {
    return (
        <li className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">{label}</span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                    {formatNumber(value)}
                    {showPercent ? ` · ${percent}%` : ''}
                </span>
            </div>
            <ProgressBar value={percent} tone={tone} label={label} />
        </li>
    );
}

function UsageRow({ label, value }: { label: string; value: number | null }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground tabular-nums">
                    {value === null ? 'No disponible' : `${value}%`}
                </span>
            </div>
            <ProgressBar
                value={value ?? 0}
                tone={usageTone(value)}
                label={label}
            />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Pestañas del estado del sistema                                            */
/* -------------------------------------------------------------------------- */

const TABS = [
    { key: 'users', label: 'Usuarios', icon: Users },
    { key: 'schools', label: 'Escuelas', icon: GraduationCap },
    { key: 'system', label: 'Sistema', icon: Server },
] as const;

type TabKey = (typeof TABS)[number]['key'];

type TabDefinition = { key: TabKey; label: string; icon: LucideIcon };

/* -------------------------------------------------------------------------- */
/*  Componente principal                                                      */
/* -------------------------------------------------------------------------- */

export default function SuperAdminDashboardContent({
    stats,
}: {
    stats: SuperAdminStats;
}) {
    const {
        semester,
        companies,
        users,
        security,
        operations,
        usersByType,
        bySchool,
        recentUsers,
        tasks,
        storage,
        server,
        recentActions,
    } = stats;

    const [tab, setTab] = useState<TabKey>('users');
    const [refreshing, setRefreshing] = useState(false);

    const secure = security.failedToday === 0;

    const pendingTotal =
        operations.pendingDocuments +
        operations.pendingCompanies +
        operations.pendingSubmissions +
        operations.pendingVacancies;

    const pendingParts = [
        operations.pendingDocuments
            ? `${formatNumber(operations.pendingDocuments)} docs`
            : null,
        operations.pendingCompanies
            ? `${formatNumber(operations.pendingCompanies)} solicitudes`
            : null,
        operations.pendingSubmissions
            ? `${formatNumber(operations.pendingSubmissions)} entregas`
            : null,
        operations.pendingVacancies
            ? `${formatNumber(operations.pendingVacancies)} vacantes`
            : null,
    ].filter(Boolean);

    const activeTab = (TABS.find((item) => item.key === tab) ??
        TABS[0]) as TabDefinition;

    const maxStudents = Math.max(1, ...bySchool.map((row) => row.students));

    const storagePercent =
        storage.totalBytes && storage.freeBytes !== null
            ? Math.round((1 - storage.freeBytes / storage.totalBytes) * 100)
            : null;

    const sortedTasks = [...tasks].sort(
        (a, b) => priorityRank[a.priority] - priorityRank[b.priority],
    );

    const refresh = () =>
        router.reload({
            onStart: () => setRefreshing(true),
            onFinish: () => setRefreshing(false),
        });

    const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
            return;
        }

        event.preventDefault();

        const index = TABS.findIndex((item) => item.key === tab);
        const step = event.key === 'ArrowRight' ? 1 : -1;
        const next = TABS[(index + step + TABS.length) % TABS.length];

        setTab(next.key);
        document.getElementById(`system-tab-${next.key}`)?.focus();
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            {/* Encabezado: contexto general y accesos rápidos */}
            <Card>
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-primary/10 p-3 text-primary">
                            <Shield className="size-7" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-xl font-semibold">
                                Panel de control general
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {semester
                                    ? `Semestre activo: ${semester}`
                                    : 'Sin semestre activo configurado'}{' '}
                                · {formatNumber(users.total)} usuarios ·{' '}
                                {formatNumber(companies.total)} empresas
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatNumber(operations.students.total)}{' '}
                                estudiantes,{' '}
                                {formatNumber(operations.teachers.total)}{' '}
                                docentes y {formatNumber(operations.resources)}{' '}
                                recursos publicados.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={studentsIndex().url}>
                                <Users />
                                Estudiantes
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={adminJobBoardIndex().url}>
                                <Briefcase />
                                Bolsa laboral
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={resourceIndex().url}>
                                <FileText />
                                Recursos
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={refresh}
                            disabled={refreshing}
                        >
                            <RefreshCw
                                className={cn(refreshing && 'animate-spin')}
                            />
                            Actualizar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Indicadores globales */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard
                    title="Estudiantes"
                    value={formatNumber(operations.students.total)}
                    description={`+${formatNumber(operations.students.thisMonth)} este mes`}
                    icon={GraduationCap}
                />
                <StatCard
                    title="Docentes"
                    value={formatNumber(operations.teachers.total)}
                    description="Titulares y supervisores"
                    icon={UsersRound}
                />
                <StatCard
                    title="Empresas"
                    value={formatNumber(companies.total)}
                    description={`+${formatNumber(companies.thisMonth)} este mes`}
                    icon={Building2}
                />
                <StatCard
                    title="Prácticas"
                    value={formatNumber(operations.internships.total)}
                    description={`${operations.internships.withSupervisorPercent}% con supervisor`}
                    icon={Briefcase}
                />
                <StatCard
                    title="Pendientes"
                    value={formatNumber(pendingTotal)}
                    description={
                        pendingParts.length > 0
                            ? pendingParts.join(' · ')
                            : 'Todo al día'
                    }
                    valueClassName={
                        pendingTotal > 0 ? 'text-orange-600' : undefined
                    }
                    icon={ListTodo}
                />
                <StatCard
                    title="Recursos"
                    value={formatNumber(operations.resources)}
                    description="Publicados en el semestre"
                    icon={FileText}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-7">
                {/* Distribución y salud del sistema */}
                <Card className="lg:col-span-4">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className="space-y-1">
                            <CardTitle>Estado del sistema</CardTitle>
                            <CardDescription>
                                Distribución y salud del semestre activo.
                            </CardDescription>
                        </div>
                        {semester && (
                            <Badge variant="outline">{semester}</Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div
                            role="tablist"
                            aria-label="Estado del sistema"
                            className="grid gap-1 rounded-lg bg-muted p-1 sm:grid-cols-3"
                            onKeyDown={onTabKeyDown}
                        >
                            {TABS.map((item) => {
                                const Icon = item.icon;
                                const active = item.key === tab;

                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        role="tab"
                                        id={`system-tab-${item.key}`}
                                        aria-selected={active}
                                        aria-controls={`system-panel-${item.key}`}
                                        tabIndex={active ? 0 : -1}
                                        onClick={() => setTab(item.key)}
                                        className={cn(
                                            'flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                            active
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        <Icon className="size-4" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div
                            key={activeTab.key}
                            role="tabpanel"
                            id={`system-panel-${activeTab.key}`}
                            aria-labelledby={`system-tab-${activeTab.key}`}
                            className={cn('mt-4', enter)}
                        >
                            {activeTab.key === 'users' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Distribución de{' '}
                                        {formatNumber(users.total)} usuarios (
                                        {users.activePercent}% activos en el
                                        sistema).
                                    </p>
                                    {usersByType.length === 0 ? (
                                        <EmptyState
                                            className="py-8"
                                            title="Todavía no hay usuarios registrados."
                                        />
                                    ) : (
                                        <ul className="space-y-3">
                                            {usersByType.map((type, index) => (
                                                <DistributionRow
                                                    key={type.name}
                                                    label={type.name}
                                                    value={type.total}
                                                    percent={type.percent}
                                                    tone={
                                                        userTypeTones[
                                                            index %
                                                                userTypeTones.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {activeTab.key === 'schools' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Estudiantes activos por escuela en el
                                        semestre actual.
                                    </p>
                                    {bySchool.length === 0 ? (
                                        <EmptyState
                                            className="py-8"
                                            title="Aún no hay estudiantes registrados en este semestre."
                                        />
                                    ) : (
                                        <ul className="space-y-3">
                                            {bySchool.map((row) => (
                                                <DistributionRow
                                                    key={row.school}
                                                    label={row.school}
                                                    value={row.students}
                                                    percent={Math.round(
                                                        (row.students /
                                                            maxStudents) *
                                                            100,
                                                    )}
                                                    showPercent={false}
                                                    tone="bg-primary"
                                                />
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {activeTab.key === 'system' && (
                                <div className="space-y-3">
                                    <div className="rounded-lg border p-3">
                                        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                                            <Server className="size-4 text-muted-foreground" />
                                            Carga del servidor
                                        </div>
                                        <div className="space-y-3">
                                            <UsageRow
                                                label="CPU"
                                                value={server.cpuPercent}
                                            />
                                            <UsageRow
                                                label="Memoria RAM"
                                                value={server.memoryPercent}
                                            />
                                        </div>
                                        {server.cpuPercent === null &&
                                            server.memoryPercent === null && (
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Las métricas del servidor
                                                    solo están disponibles en el
                                                    entorno de producción.
                                                </p>
                                            )}
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-2 rounded-lg border p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                    {secure ? (
                                                        <Shield className="size-4 text-green-600" />
                                                    ) : (
                                                        <ShieldAlert className="size-4 text-orange-600" />
                                                    )}
                                                    Seguridad
                                                </span>
                                                <Badge
                                                    variant={
                                                        secure
                                                            ? 'secondary'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {secure
                                                        ? 'Sin alertas'
                                                        : 'Revisar'}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                                                <span>
                                                    Fallidos hoy:{' '}
                                                    <strong className="text-foreground">
                                                        {formatNumber(
                                                            security.failedToday,
                                                        )}
                                                    </strong>
                                                </span>
                                                <span>
                                                    Bloqueos:{' '}
                                                    <strong className="text-foreground">
                                                        {formatNumber(
                                                            security.lockoutsToday,
                                                        )}
                                                    </strong>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 rounded-lg border p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                    <HardDrive className="size-4 text-muted-foreground" />
                                                    Almacenamiento
                                                </span>
                                                <span className="text-xs text-muted-foreground tabular-nums">
                                                    {storagePercent === null
                                                        ? '—'
                                                        : `${storagePercent}%`}
                                                </span>
                                            </div>
                                            <ProgressBar
                                                value={storagePercent ?? 0}
                                                tone={usageTone(storagePercent)}
                                                label="Almacenamiento"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {formatBytes(storage.usedBytes)}{' '}
                                                usados
                                                {storage.totalBytes !== null
                                                    ? ` de ${formatBytes(storage.totalBytes)}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Qué hacer ahora */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListTodo className="size-4" />
                            Qué hacer ahora
                            <Badge variant="secondary">
                                {sortedTasks.length}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Pendientes de todo el sistema, de más a menos
                            urgente.
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
                                    No hay validaciones pendientes por ahora.
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
                                            <span
                                                className={cn(
                                                    'mt-1.5 size-2 shrink-0 rounded-full',
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
                                            <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-7">
                {/* Acciones recientes */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="size-4" />
                            Actividad reciente del sistema
                        </CardTitle>
                        <CardDescription>
                            Últimos movimientos registrados en la plataforma.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentActions.length === 0 ? (
                            <EmptyState
                                className="py-8"
                                title="Todavía no hay actividad registrada."
                            />
                        ) : (
                            <div className="relative space-y-4 before:absolute before:top-2 before:left-4 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
                                {recentActions.map((log, index) => (
                                    <div
                                        key={`${log.action}-${index}`}
                                        className={cn(
                                            'relative flex gap-3',
                                            enter,
                                        )}
                                        style={{
                                            animationDelay: `${index * 40}ms`,
                                        }}
                                    >
                                        <div className="z-10 grid size-8 shrink-0 place-items-center rounded-full bg-muted ring-1 ring-border">
                                            <Clock className="size-4 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0 pb-1">
                                            <p className="text-sm font-medium">
                                                {log.action}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {timeAgo(log.at) || 'Sin fecha'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Usuarios recientes */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="size-4" />
                            Usuarios recientes
                        </CardTitle>
                        <CardDescription>
                            Las últimas cuentas creadas en el sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentUsers.length === 0 ? (
                            <EmptyState
                                className="py-8"
                                title="Todavía no hay usuarios registrados."
                            />
                        ) : (
                            <div className="space-y-2">
                                {recentUsers.map((user, index) => (
                                    <div
                                        key={user.id}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg border p-3',
                                            enter,
                                        )}
                                        style={{
                                            animationDelay: `${index * 40}ms`,
                                        }}
                                    >
                                        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            {initials(user.name || '?')}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {user.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            {user.type && (
                                                <Badge variant="outline">
                                                    {user.type}
                                                </Badge>
                                            )}
                                            <span className="text-[11px] text-muted-foreground">
                                                {timeAgo(user.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
