import { Head, router } from '@inertiajs/react';
import { isToday, isYesterday, format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Bell,
    ChevronLeft,
    Inbox,
    CheckCheck,
    Trash2,
    Search,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import type { NotificationMeta } from '@/modules/notifications/config/notification';
import { resolveConfig } from '@/modules/notifications/config/notification';
import { resolveWayfinderUrl } from '@/modules/notifications/resolve-url';
import type { NotificationParams } from '@/modules/notifications/types';
import notificationsRoute from '@/routes/notifications';
import Heading from '@/shared/components/heading';
import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/shared/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import AppLayout from '@/shared/layouts/app-layout';
import { cn } from '@/shared/lib/utils';

interface NotificationAction {
    route: string;
    params: NotificationParams;
}

interface Notification {
    id: number;
    type: string;
    actor: string;
    title: string;
    role: string;
    document: string;
    status: number | null;
    comment: string | null;
    entity: string | null;
    action: NotificationAction;
    read_at: string | null;
    seen_at: string | null;
    created_at: string;
}

interface Props {
    title: string;
    notifications: Notification[];
}

export default function NotificationIndex({ notifications }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const breadcrumbs = [
        { title: 'Panel', href: '/dashboard' },
        { title: 'Notificaciones', href: '#' },
    ];

    const handleBack = () => {
        window.history.back();
    };

    const handleNotificationClick = (notification: Notification) => {
        const routeName = notification.action.route;
        const params = notification.action.params || {};

        if (!notification.read_at) {
            router.patch(
                notificationsRoute.read.url({ id: notification.id }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        const url = resolveWayfinderUrl(routeName, params);
                        if (url) {
                            router.visit(url);
                        }
                    },
                },
            );
        } else {
            const url = resolveWayfinderUrl(routeName, params);
            if (url) {
                router.visit(url);
            }
        }
    };

    const markAllAsRead = () => {
        router.patch(
            notificationsRoute.markAllAsRead.url(),
            {},
            { preserveScroll: true },
        );
    };

    const deleteNotification = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        router.delete(notificationsRoute.destroy.url({ id }), {
            preserveScroll: true,
        });
    };

    const toggleRead = (e: React.MouseEvent, notification: Notification) => {
        e.stopPropagation();
        if (!notification.read_at) {
            router.patch(
                notificationsRoute.read.url({ id: notification.id }),
                {},
                { preserveScroll: true },
            );
        }
    };

    const filteredNotifications = useMemo(() => {
        return notifications.filter(
            (n) =>
                n.actor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.document?.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [notifications, searchQuery]);

    const unreadNotificationsCount = notifications.filter(
        (n) => !n.read_at,
    ).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notificaciones" />
            <div className="flex flex-1 flex-col bg-muted/20 p-4 md:p-6 lg:p-10">
                <div className="mx-auto w-full max-w-4xl space-y-8">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleBack}
                                className="h-10 w-10 shrink-0 rounded-xl bg-background transition-all hover:shadow-md"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Heading
                                variant="small"
                                title="Notificaciones"
                                description="Gestiona tus alertas y avisos académicos"
                            />
                        </div>

                        {unreadNotificationsCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={markAllAsRead}
                                className="hidden h-9 rounded-lg text-xs font-semibold sm:flex"
                            >
                                <CheckCheck className="mr-2 h-4 w-4 text-primary" />
                                Marcar todo como leído
                            </Button>
                        )}
                    </div>

                    <Card className="overflow-hidden rounded-xl border-muted/40 bg-background">
                        <Tabs defaultValue="all" className="w-full">
                            <CardHeader className="border-b p-0">
                                <div className="flex flex-col items-stretch justify-between gap-4 p-4 sm:flex-row sm:items-center">
                                    <TabsList className="h-10 self-start rounded-lg bg-muted/50 p-1">
                                        <TabsTrigger
                                            value="all"
                                            className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                        >
                                            Todas
                                            {notifications.length > 0 && (
                                                <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold">
                                                    {notifications.length}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="unread"
                                            className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                        >
                                            No leídas
                                            {unreadNotificationsCount > 0 && (
                                                <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                                                    {unreadNotificationsCount}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="relative max-w-sm flex-1">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                                        <Input
                                            placeholder="Buscar notificaciones..."
                                            className="h-10 rounded-lg border-none bg-muted/30 pl-9 text-sm focus-visible:ring-1 focus-visible:ring-primary/20"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            <div className="min-h-[400px] bg-background">
                                <TabsContent
                                    value="all"
                                    className="m-0 border-none"
                                >
                                    <NotificationList
                                        items={filteredNotifications}
                                        onClick={handleNotificationClick}
                                        onDelete={deleteNotification}
                                        onToggleRead={toggleRead}
                                    />
                                </TabsContent>

                                <TabsContent
                                    value="unread"
                                    className="m-0 border-none"
                                >
                                    <NotificationList
                                        items={filteredNotifications.filter(
                                            (n) => !n.read_at,
                                        )}
                                        onClick={handleNotificationClick}
                                        onDelete={deleteNotification}
                                        onToggleRead={toggleRead}
                                    />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

function NotificationList({
    items,
    onClick,
    onDelete,
    onToggleRead,
}: {
    items: Notification[];
    onClick: (n: Notification) => void;
    onDelete: (e: React.MouseEvent, id: number) => void;
    onToggleRead: (e: React.MouseEvent, n: Notification) => void;
}) {
    const groups = useMemo(() => {
        const sorted = [...items].sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
        );
        const grouped: Record<string, Notification[]> = {};

        sorted.forEach((item) => {
            const date = new Date(item.created_at);
            let label = '';
            if (isToday(date)) label = 'Hoy';
            else if (isYesterday(date)) label = 'Ayer';
            else label = format(date, "EEEE d 'de' MMMM", { locale: es });

            if (!grouped[label]) grouped[label] = [];
            grouped[label].push(item);
        });

        return grouped;
    }, [items]);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/40">
                    <Inbox className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div>
                    <p className="font-semibold text-muted-foreground/80">
                        No se encontraron notificaciones
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Aquí aparecerán tus avisos pendientes
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-4">
            <TooltipProvider delayDuration={100}>
                {Object.entries(groups).map(([label, groupItems]) => (
                    <div key={label} className="mt-6 space-y-1 first:mt-2">
                        <div className="px-6 py-2">
                            <h3 className="text-[11px] font-bold tracking-wider text-muted-foreground/60 uppercase">
                                {label}
                            </h3>
                        </div>
                        <div className="divide-y divide-muted/30">
                            {groupItems.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClick={onClick}
                                    onDelete={onDelete}
                                    onToggleRead={onToggleRead}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </TooltipProvider>
        </div>
    );
}
function NotificationItem({
    notification,
    onClick,
    onDelete,
    onToggleRead,
}: {
    notification: Notification;
    onClick: (n: Notification) => void;
    onDelete: (e: React.MouseEvent, id: number) => void;
    onToggleRead: (e: React.MouseEvent, n: Notification) => void;
}) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const meta: NotificationMeta = {
        title: notification.title,
        role: notification.role,
        document: notification.document,
        status: notification.status,
        comment: notification.comment,
    };

    const {
        Icon,
        color: iconColor,
        bg: bgColor,
        render,
    } = resolveConfig(notification.type, meta.status);

    return (
        <div
            onClick={() => onClick(notification)}
            className={cn(
                'group relative flex cursor-pointer items-start gap-4 px-6 py-4 transition-all hover:bg-muted/40',
                !notification.read_at &&
                    'border-l-2 border-primary bg-primary/5',
            )}
        >
            <div className="shrink-0 pt-1">
                <div
                    className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-105',
                        notification.read_at
                            ? 'border-muted bg-background'
                            : 'border-primary/20 bg-background',
                    )}
                >
                    {notification.actor ? (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 text-xs font-bold text-primary">
                            {getInitials(notification.actor)}
                        </div>
                    ) : (
                        <Bell className="h-4 w-4 text-muted-foreground/60" />
                    )}

                    <div
                        className={cn(
                            'absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background shadow-sm',
                            bgColor,
                        )}
                    >
                        <Icon className={cn('h-2.5 w-2.5', iconColor)} />
                    </div>
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h4
                        className={cn(
                            'truncate text-sm font-semibold',
                            notification.read_at
                                ? 'text-foreground/70'
                                : 'text-foreground',
                        )}
                    >
                        {notification.title || 'Actualización del sistema'}
                    </h4>
                    {!notification.read_at && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    )}
                </div>

                <div className="mb-0.5 flex items-center gap-1.5">
                    <span className="text-[11px] font-medium tracking-tight text-muted-foreground uppercase">
                        {notification.actor || 'Sistema'}
                    </span>
                    {notification.role && (
                        <>
                            <span className="text-[10px] text-muted-foreground/30">
                                •
                            </span>
                            <span className="rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {notification.role}
                            </span>
                        </>
                    )}
                </div>
                <p
                    className={cn(
                        'line-clamp-2 text-xs leading-snug',
                        notification.read_at
                            ? 'text-muted-foreground/60'
                            : 'font-medium text-muted-foreground',
                    )}
                    dangerouslySetInnerHTML={{
                        __html: render(meta),
                    }}
                />
            </div>

            <div className="flex shrink-0 items-center gap-4">
                <span className="text-[10px] font-medium whitespace-nowrap text-muted-foreground/50 transition-opacity group-hover:opacity-0">
                    {format(new Date(notification.created_at), 'HH:mm')}
                </span>

                <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-1 rounded-lg border bg-background/80 p-1 opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md hover:bg-primary/10 hover:text-primary"
                                onClick={(e) => onToggleRead(e, notification)}
                            >
                                <Bell
                                    className={cn(
                                        'h-4 w-4',
                                        notification.read_at
                                            ? 'opacity-40'
                                            : 'fill-primary text-primary',
                                    )}
                                />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p className="text-xs">
                                {notification.read_at
                                    ? 'Marcar como no leída'
                                    : 'Marcar como leída'}
                            </p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => onDelete(e, notification.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p className="text-xs">Eliminar notificación</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
