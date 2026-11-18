import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';

import { useJobBoardMenuBadge } from '@/modules/jobboard/hooks/use-menu-badge';
import { dashboard } from '@/routes';
import { NavFooter } from '@/shared/components/layout/nav-footer';
import { NavMain } from '@/shared/components/layout/nav-main';
import { NavUser } from '@/shared/components/layout/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/shared/components/ui/sidebar';
import {
    ADMIN_NAV,
    ACADEMIC_NAV,
    COMPANY_NAV,
    FOOTER_NAV,
} from '@/shared/config/navigation';
import type { NavSection } from '@/shared/config/navigation';
import type { NavItem } from '@/shared/types';
import AppLogo from '../app-logo';

export function AppSidebar() {
    const { auth, role } = usePage().props;
    const showJobBoardBadge = useJobBoardMenuBadge();

    const userType = auth?.user?.type || 'DEFAULT';
    const userTypeId = auth?.user?.type_id || 0;

    const menuSelection: Record<string, NavSection[]> = {
        Administrador: ADMIN_NAV,
        Académico: ACADEMIC_NAV,
        Empresa: COMPANY_NAV,
    };

    const mainSections: NavSection[] = menuSelection[userType] || [
        {
            id: 'main',
            items: [
                {
                    title: 'Panel',
                    href: dashboard(),
                    icon: LayoutGrid,
                },
            ],
        },
    ];

    // Filtra los ítems por rol, incluyendo los submenús anidados.
    const filterItems = (items: NavItem[], userRole: number): NavItem[] => {
        return items
            .filter((item) => !item.roles || item.roles.includes(userRole))
            .map((item) => {
                if (item.items) {
                    return {
                        ...item,
                        items: filterItems(item.items, userRole),
                    };
                }
                return item;
            })
            .filter((item) => !item.items || item.items.length > 0);
    };

    const footerNavItems = FOOTER_NAV.filter((item) => {
        if (!item.userTypes) return true;
        return item.userTypes.includes(userTypeId);
    });

    const withJobBoardBadge = (items: NavItem[]): NavItem[] =>
        items.map((item) => ({
            ...item,
            badge:
                item.title === 'Bolsa laboral' && !showJobBoardBadge
                    ? undefined
                    : item.badge,
            items: item.items ? withJobBoardBadge(item.items) : item.items,
        }));

    // Filtra cada sección por rol y descarta las que se quedan vacías.
    const visibleSections: NavSection[] = mainSections
        .map((section) => ({
            ...section,
            items: withJobBoardBadge(filterItems(section.items, role ?? 0)),
        }))
        .filter((section) => section.items.length > 0);

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain sections={visibleSections} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={filterItems(footerNavItems, role ?? 0)} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
