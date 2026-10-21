import { Head, router } from "@inertiajs/react";
import { isToday, isYesterday, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, ChevronLeft, Inbox, CheckCheck, Trash2, Search } from "lucide-react";
import React, { useState, useMemo } from "react";
import type { NotificationMeta } from "@/modules/notifications/config/notification";
import { resolveConfig } from "@/modules/notifications/config/notification";
import academic from '@/routes/academic';
import notificationsRoute from '@/routes/notifications';
import Heading from "@/shared/components/heading";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import AppLayout from "@/shared/layouts/app-layout";
import { cn } from "@/shared/lib/utils";

interface NotificationAction {
    route: string;
    params: Record<string, any>;
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

export default function NotificationIndex({ title, notifications }: Props) {
    const [searchQuery, setSearchQuery] = useState("");

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Notificaciones", href: "#" }
    ];

    const handleBack = () => {
        window.history.back();
    };

    const resolveWayfinderUrl = (routeName: string, params: any) => {
        const parts = routeName.split('.');
        let current: any = { academic };

        for (const part of parts) {
            current = current?.[part];
        }

        if (current && typeof current.url === 'function') {
            return current.url({ query: params });
        }

        return null;
    };

    const handleNotificationClick = (notification: Notification) => {
        const routeName = notification.action.route;
        const params = notification.action.params || {};

        if (!notification.read_at) {
            router.patch(notificationsRoute.read.url({ id: notification.id }), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    const url = resolveWayfinderUrl(routeName, params);
                    if (url) {
                        router.visit(url);
                    }
                }
            });
        } else {
            const url = resolveWayfinderUrl(routeName, params);
            if (url) {
                router.visit(url);
            }
        }
    };

    const markAllAsRead = () => {
        router.patch(notificationsRoute.markAllAsRead.url(), {}, { preserveScroll: true });
    };

    const deleteNotification = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        router.delete(notificationsRoute.destroy.url({ id }), { preserveScroll: true });
    };

    const toggleRead = (e: React.MouseEvent, notification: Notification) => {
        e.stopPropagation();
        if (!notification.read_at) {
            router.patch(notificationsRoute.read.url({ id: notification.id }), {}, { preserveScroll: true });
        }
    };

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n =>
            n.actor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.document?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [notifications, searchQuery]);

    const unreadNotificationsCount = notifications.filter(n => !n.read_at).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notificaciones" />
            <div className="flex flex-col flex-1 p-4 md:p-6 lg:p-10 bg-muted/20">
                <div className="max-w-4xl mx-auto w-full space-y-8">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleBack}
                                className="rounded-xl h-10 w-10 shrink-0 bg-background hover:shadow-md transition-all"
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
                                className="hidden sm:flex text-xs font-semibold rounded-lg h-9"
                            >
                                <CheckCheck className="mr-2 h-4 w-4 text-primary" />
                                Marcar todo como leído
                            </Button>
                        )}
                    </div>

                    <Card className="border-muted/40 rounded-xl overflow-hidden bg-background">
                        <Tabs defaultValue="all" className="w-full">
                            <CardHeader className="p-0 border-b">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 gap-4">
                                    <TabsList className="h-10 p-1 bg-muted/50 rounded-lg self-start">
                                        <TabsTrigger value="all" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                            Todas
                                            {notifications.length > 0 && (
                                                <span className="ml-2 py-0.5 px-1.5 rounded-full bg-muted text-[10px] font-bold">
                                                    {notifications.length}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="unread" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                            No leídas
                                            {unreadNotificationsCount > 0 && (
                                                <span className="ml-2 py-0.5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                                                    {unreadNotificationsCount}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                        <Input
                                            placeholder="Buscar notificaciones..."
                                            className="pl-9 h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-lg text-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            <div className="bg-background min-h-[400px]">
                                <TabsContent value="all" className="m-0 border-none">
                                    <NotificationList
                                        items={filteredNotifications}
                                        onClick={handleNotificationClick}
                                        onDelete={deleteNotification}
                                        onToggleRead={toggleRead}
                                    />
                                </TabsContent>

                                <TabsContent value="unread" className="m-0 border-none">
                                    <NotificationList
                                        items={filteredNotifications.filter(n => !n.read_at)}
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

function NotificationList({ items, onClick, onDelete, onToggleRead }: {
    items: Notification[],
    onClick: (n: Notification) => void,
    onDelete: (e: React.MouseEvent, id: number) => void,
    onToggleRead: (e: React.MouseEvent, n: Notification) => void
}) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-16 w-16 bg-muted/40 rounded-full flex items-center justify-center">
                    <Inbox className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div>
                    <p className="font-semibold text-muted-foreground/80">No se encontraron notificaciones</p>
                    <p className="text-xs text-muted-foreground">Aquí aparecerán tus avisos pendientes</p>
                </div>
            </div>
        );
    }

    const groups = useMemo(() => {
        const sorted = [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const grouped: Record<string, Notification[]> = {};

        sorted.forEach(item => {
            const date = new Date(item.created_at);
            let label = "";
            if (isToday(date)) label = "Hoy";
            else if (isYesterday(date)) label = "Ayer";
            else label = format(date, "EEEE d 'de' MMMM", { locale: es });

            if (!grouped[label]) grouped[label] = [];
            grouped[label].push(item);
        });

        return grouped;
    }, [items]);

    return (
        <div className="pb-4">
            <TooltipProvider delayDuration={100}>
                {Object.entries(groups).map(([label, groupItems]) => (
                    <div key={label} className="space-y-1 mt-6 first:mt-2">
                        <div className="px-6 py-2">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">{label}</h3>
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
function NotificationItem({ notification, onClick, onDelete, onToggleRead }: {
    notification: Notification,
    onClick: (n: Notification) => void,
    onDelete: (e: React.MouseEvent, id: number) => void,
    onToggleRead: (e: React.MouseEvent, n: Notification) => void
}) {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const meta: NotificationMeta = {
        title: notification.title,
        role: notification.role,
        document: notification.document,
        status: notification.status,
        comment: notification.comment,
    };

    const { Icon, color: iconColor, bg: bgColor, render } = resolveConfig(notification.type, meta.status);

    return (
        <div
            onClick={() => onClick(notification)}
            className={cn(
                "group flex items-start gap-4 px-6 py-4 cursor-pointer transition-all hover:bg-muted/40 relative",
                !notification.read_at && "bg-primary/5 border-l-2 border-primary"
            )}
        >
            <div className="shrink-0 pt-1">
                <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105",
                    notification.read_at ? "bg-background border-muted" : "bg-background border-primary/20"
                )}>
                    {notification.actor ? (
                        <div className="h-full w-full rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary text-xs font-bold">
                            {getInitials(notification.actor)}
                        </div>
                    ) : (
                        <Bell className="h-4 w-4 text-muted-foreground/60" />
                    )}

                    <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center shadow-sm",
                        bgColor
                    )}>
                        <Icon className={cn("h-2.5 w-2.5", iconColor)} />
                    </div>
                </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={cn(
                        "text-sm font-semibold truncate",
                        notification.read_at ? "text-foreground/70" : "text-foreground"
                    )}>
                        {notification.title || 'Actualización del sistema'}
                    </h4>
                    {!notification.read_at && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                </div>

                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">
                        {notification.actor || 'Sistema'}
                    </span>
                    {notification.role && (
                        <>
                            <span className="text-muted-foreground/30 text-[10px]">•</span>
                            <span className="text-[10px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded-md font-medium">
                                {notification.role}
                            </span>
                        </>
                    )}
                </div>
                <p className={cn(
                    "text-xs leading-snug line-clamp-2",
                    notification.read_at ? "text-muted-foreground/60" : "text-muted-foreground font-medium"
                )} dangerouslySetInnerHTML={{
                    __html: render(meta)
                }} />
            </div>

            <div className="shrink-0 flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground/50 font-medium whitespace-nowrap group-hover:opacity-0 transition-opacity">
                    {format(new Date(notification.created_at), "HH:mm")}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-1 rounded-lg border shadow-sm">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md hover:bg-primary/10 hover:text-primary"
                                onClick={(e) => onToggleRead(e, notification)}
                            >
                                <Bell className={cn("h-4 w-4", notification.read_at ? "opacity-40" : "fill-primary text-primary")} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p className="text-xs">{notification.read_at ? 'Marcar como no leída' : 'Marcar como leída'}</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground/50"
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