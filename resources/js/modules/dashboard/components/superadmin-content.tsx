import { Shield, Building2, Users, Database } from 'lucide-react';
import type { SuperAdminStats } from '@/modules/dashboard/types';
import { formatBytes, formatNumber, timeAgo } from '@/modules/dashboard/utils';
import EmptyState from '@/shared/components/empty-state';
import StatCard from '@/shared/components/stat-card';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

function UsageBar({ label, value }: { label: string; value: number | null }) {
    const tone =
        value === null
            ? 'bg-muted'
            : value >= 85
              ? 'bg-red-500'
              : value >= 60
                ? 'bg-yellow-500'
                : 'bg-green-600';

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">
                    {value === null ? 'No disponible' : `${value}%`}
                </span>
            </div>
            <div
                className="h-3 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value ?? undefined}
            >
                <div
                    className={cn('h-full rounded-full transition-all', tone)}
                    style={{ width: `${value ?? 0}%` }}
                />
            </div>
        </div>
    );
}

export default function SuperAdminDashboardContent({
    stats,
}: {
    stats: SuperAdminStats;
}) {
    const { companies, users, security, storage, server, recentActions } =
        stats;
    const secure = security.failedToday === 0;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                <StatCard
                    title="Empresas Registradas"
                    value={formatNumber(companies.total)}
                    description={`+${formatNumber(companies.thisMonth)} este mes`}
                    icon={Building2}
                />
                <StatCard
                    title="Usuarios Totales"
                    value={formatNumber(users.total)}
                    description={`${users.activePercent}% activos`}
                    icon={Users}
                />
                <StatCard
                    title="Seguridad / Logs"
                    value={
                        secure
                            ? 'Limpio'
                            : `${formatNumber(security.failedToday)} fallidos`
                    }
                    description={
                        secure
                            ? 'Sin intentos fallidos de acceso hoy'
                            : `Intentos de acceso hoy · ${security.lockoutsToday} bloqueo(s)`
                    }
                    valueClassName={
                        secure ? 'text-green-600' : 'text-orange-600'
                    }
                    icon={Shield}
                />
                <StatCard
                    title="Uso de Almacenamiento"
                    value={formatBytes(storage.usedBytes)}
                    description={`De ${formatBytes(storage.freeBytes)} disponibles`}
                    icon={Database}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Carga del Sistema (Servidor)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center gap-6 py-6">
                        <UsageBar label="CPU" value={server.cpuPercent} />
                        <UsageBar
                            label="Memoria RAM"
                            value={server.memoryPercent}
                        />
                        <UsageBar
                            label="Disco"
                            value={
                                storage.totalBytes && storage.freeBytes !== null
                                    ? Math.round(
                                          (1 -
                                              storage.freeBytes /
                                                  storage.totalBytes) *
                                              100,
                                      )
                                    : null
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            Uso actual del servidor al cargar el panel.
                        </p>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Acciones Recientes del Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentActions.length === 0 ? (
                            <EmptyState title="Todavía no hay actividad registrada." />
                        ) : (
                            <div className="space-y-4">
                                {recentActions.map((log, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between border-b pb-2 last:border-0"
                                    >
                                        <div className="pr-2">
                                            <p className="text-sm font-medium">
                                                {log.action}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {timeAgo(log.at)}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 uppercase">
                                            Registrado
                                        </span>
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
