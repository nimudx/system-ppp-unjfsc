import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import academic from '@/routes/academic';
import notificationsRoute from '@/routes/notifications';
import { resolveConfig, NotificationMeta } from '@/modules/notifications/config/notification';

export function NotificationDropdown({ notifications = [] }: { notifications?: any[] }) {
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.length;

    const resolveWayfinderUrl = (routeName: string, params: any) => {
        if (routeName === 'dashboard') return '/dashboard';

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

    const handleNotificationClick = (notification: any) => {
        // Mark as read in the background
        router.patch(notificationsRoute.read.url({ id: notification.id }), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsOpen(false);

                // Extract action from payload as it comes from SharedDataService
                const action = notification.payload?.action || {};
                const routeName = action.route;
                const params = action.params || {};

                console.log('Resolving route:', routeName, params);

                const url = resolveWayfinderUrl(routeName, params);

                if (url) {
                    router.visit(url);
                } else {
                    console.warn('No se pudo resolver la ruta Wayfinder:', routeName, '. Redirigiendo a dashboard.');
                    router.visit('/dashboard');
                }
            }
        });
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group size-10 rounded-full p-1 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <Bell className="size-5 opacity-80 group-hover:opacity-100 text-neutral-700 dark:text-neutral-300 transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-neutral-900 animate-in fade-in zoom-in">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Notificaciones</p>
                    {unreadCount > 0 && (
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            {unreadCount} nuevas
                        </span>
                    )}
                </div>

                <ScrollArea className={cn("max-h-[350px] overflow-y-auto", unreadCount === 0 && "py-6")}>
                    {unreadCount === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 px-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                <Bell className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                No tienes notificaciones nuevas por el momento.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col py-1">
                            {notifications.map((notification, idx) => {
                                const meta = (notification.payload?.meta || {}) as NotificationMeta;
                                const { Icon, color: iconColor, bg: bgColor, render } = resolveConfig(notification.type, meta.status);

                                return (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={cn(
                                            "flex gap-3 px-4 py-3 cursor-pointer items-start rounded-none focus:bg-neutral-50 dark:focus:bg-neutral-800",
                                            idx !== notifications.length - 1 && "border-b border-neutral-100 dark:border-neutral-800/50"
                                        )}
                                        // Make sure it doesn't close prematurely before inertia visit
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            handleNotificationClick(notification);
                                        }}
                                    >
                                        <div className={cn("mt-0.5 shrink-0 p-2 rounded-full", bgColor)}>
                                            <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
                                        </div>
                                        <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-semibold leading-none truncate dark:text-neutral-200">
                                                    {meta.title || 'Notificación'}
                                                </p>
                                                <span className="text-[11px] text-neutral-400 whitespace-nowrap shrink-0">
                                                    {notification.created_at}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-xs text-neutral-600 dark:text-neutral-300 truncate">
                                                    {notification.actor || 'Sistema'}
                                                </span>
                                                {meta.role && (
                                                    <>
                                                        <span className="text-neutral-300 dark:text-neutral-600 text-xs">•</span>
                                                        <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded-md font-medium">
                                                            {meta.role}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5" dangerouslySetInnerHTML={{
                                                __html: render(meta)
                                            }} />
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
                <Link href='/notifications'>
                    <div className="p-2 border-t border-neutral-100 dark:border-neutral-800">
                        <Button variant="ghost" className="w-full text-xs text-neutral-500 justify-center">
                            Ver todas las notificaciones
                        </Button>
                    </div>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
