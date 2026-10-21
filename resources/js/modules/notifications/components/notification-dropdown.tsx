import { router, Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import type { NotificationMeta } from '@/modules/notifications/config/notification';
import { resolveConfig } from '@/modules/notifications/config/notification';
import { resolveWayfinderUrl } from '@/modules/notifications/resolve-url';
import type { NotificationSummary } from '@/modules/notifications/types';
import notificationsRoute from '@/routes/notifications';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';

export function NotificationDropdown({
    notifications = [],
}: {
    notifications?: NotificationSummary[];
}) {
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.length;

    const handleNotificationClick = (notification: NotificationSummary) => {
        // Mark as read in the background
        router.patch(
            notificationsRoute.read.url({ id: notification.id }),
            {},
            {
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
                        console.warn(
                            'No se pudo resolver la ruta Wayfinder:',
                            routeName,
                            '. Redirigiendo a dashboard.',
                        );
                        router.visit('/dashboard');
                    }
                },
            },
        );
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="group relative size-10 cursor-pointer rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                    <Bell className="size-5 text-neutral-700 opacity-80 transition-colors group-hover:opacity-100 dark:text-neutral-300" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 animate-in items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white fade-in zoom-in dark:ring-neutral-900">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0">
                <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        Notificaciones
                    </p>
                    {unreadCount > 0 && (
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            {unreadCount} nuevas
                        </span>
                    )}
                </div>

                <ScrollArea
                    className={cn(
                        'max-h-[350px] overflow-y-auto',
                        unreadCount === 0 && 'py-6',
                    )}
                >
                    {unreadCount === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-3 px-4 text-center">
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
                                const meta = (notification.payload?.meta ||
                                    {}) as NotificationMeta;
                                const {
                                    Icon,
                                    color: iconColor,
                                    bg: bgColor,
                                    render,
                                } = resolveConfig(
                                    notification.type,
                                    meta.status,
                                );

                                return (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={cn(
                                            'flex cursor-pointer items-start gap-3 rounded-none px-4 py-3 focus:bg-neutral-50 dark:focus:bg-neutral-800',
                                            idx !== notifications.length - 1 &&
                                                'border-b border-neutral-100 dark:border-neutral-800/50',
                                        )}
                                        // Make sure it doesn't close prematurely before inertia visit
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            handleNotificationClick(
                                                notification,
                                            );
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                'mt-0.5 shrink-0 rounded-full p-2',
                                                bgColor,
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    'h-4 w-4 shrink-0',
                                                    iconColor,
                                                )}
                                            />
                                        </div>
                                        <div className="flex w-full flex-col gap-0.5 overflow-hidden">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate text-sm leading-none font-semibold dark:text-neutral-200">
                                                    {meta.title ||
                                                        'Notificación'}
                                                </p>
                                                <span className="shrink-0 text-[11px] whitespace-nowrap text-neutral-400">
                                                    {notification.created_at}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <span className="truncate text-xs text-neutral-600 dark:text-neutral-300">
                                                    {notification.actor ||
                                                        'Sistema'}
                                                </span>
                                                {meta.role && (
                                                    <>
                                                        <span className="text-xs text-neutral-300 dark:text-neutral-600">
                                                            •
                                                        </span>
                                                        <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800">
                                                            {meta.role}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <p
                                                className="mt-0.5 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400"
                                                dangerouslySetInnerHTML={{
                                                    __html: render(meta),
                                                }}
                                            />
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
                <Link href="/notifications">
                    <div className="border-t border-neutral-100 p-2 dark:border-neutral-800">
                        <Button
                            variant="ghost"
                            className="w-full justify-center text-xs text-neutral-500"
                        >
                            Ver todas las notificaciones
                        </Button>
                    </div>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
