import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    ADMIN_NAV,
    ACADEMIC_NAV,
    COMPANY_NAV,
    FOOTER_NAV,
} from '@/config/navigation';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth, role } = usePage().props as any;

    const userType = auth?.user?.type || 'DEFAULT';
    const userTypeId = auth?.user?.type_id || 0;

    // Usamos directamente las constantes importadas en el objeto
    const menuSelection: Record<string, any[]> = {
        Administrador: ADMIN_NAV,
        Académico: ACADEMIC_NAV,
        Empresa: COMPANY_NAV,
    };

    const mainNavItems = menuSelection[userType] || [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    // Asumiendo que NavItem es tu interfaz
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
                <NavMain items={filterItems(mainNavItems, role)} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={filterItems(footerNavItems, role)} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
