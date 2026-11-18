import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarSeparator,
} from '@/shared/components/ui/sidebar';
import type { NavSection } from '@/shared/config/navigation';
import { useCurrentUrl } from '@/shared/hooks/use-current-url';
import { cn } from '@/shared/lib/utils';
import type { NavItem } from '@/shared/types';

/** Barrita lateral que marca el ítem activo (la pestaña "encendida"). */
const ACTIVE_BAR =
    'relative before:absolute before:left-0 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-sidebar-primary before:opacity-0 before:transition-opacity data-[active=true]:before:opacity-100';

function ItemBadge({ children }: { children: React.ReactNode }) {
    return (
        <Badge className="ml-auto h-5 border-0 bg-sidebar-primary px-1.5 text-[10px] font-semibold text-sidebar-primary-foreground">
            {children}
        </Badge>
    );
}

export function NavMain({ sections = [] }: { sections: NavSection[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    const renderLeaf = (item: NavItem, step = false) => {
        const active = isCurrentUrl(item.href);

        return (
            <SidebarMenuItem key={item.title}>
                {step && (
                    <span
                        aria-hidden
                        className={cn(
                            'absolute top-1/2 -left-2.5 z-10 size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sidebar-foreground/40 bg-sidebar transition-colors group-data-[collapsible=icon]:hidden',
                            active &&
                                'border-sidebar-primary bg-sidebar-primary ring-4 ring-sidebar-primary/25',
                        )}
                    />
                )}
                <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={{ children: item.title }}
                    className={cn(!step && ACTIVE_BAR)}
                >
                    <Link href={item.href} prefetch>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {item.badge && <ItemBadge>{item.badge}</ItemBadge>}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    };

    const renderGroup = (item: NavItem) => {
        const childActive =
            item.items?.some((subItem) => isCurrentUrl(subItem.href)) ?? false;

        return (
            <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive || childActive}
                className="group/collapsible"
            >
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            tooltip={item.title}
                            isActive={childActive}
                            className={ACTIVE_BAR}
                        >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            {item.badge && <ItemBadge>{item.badge}</ItemBadge>}
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={isCurrentUrl(subItem.href)}
                                    >
                                        <Link href={subItem.href} prefetch>
                                            {subItem.icon && <subItem.icon />}
                                            <span>{subItem.title}</span>
                                            {subItem.badge && (
                                                <ItemBadge>
                                                    {subItem.badge}
                                                </ItemBadge>
                                            )}
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        );
    };

    return (
        <>
            {sections.map((section, index) => (
                <Fragment key={section.id}>
                    {index > 0 && (
                        <SidebarSeparator className="hidden group-data-[collapsible=icon]:block" />
                    )}
                    <SidebarGroup className="px-2 py-1">
                        {section.label && (
                            <SidebarGroupLabel className="h-7 text-[0.8rem] font-medium text-sidebar-foreground/60">
                                <span>{section.label}</span>
                            </SidebarGroupLabel>
                        )}

                        <SidebarMenu
                            className={cn(
                                section.steps &&
                                    'relative pl-5 group-data-[collapsible=icon]:pl-0 before:absolute before:inset-y-3 before:left-2.5 before:w-px before:-translate-x-1/2 before:bg-sidebar-foreground/20 group-data-[collapsible=icon]:before:hidden',
                            )}
                        >
                            {section.items.map((item) =>
                                item.items && item.items.length > 0
                                    ? renderGroup(item)
                                    : renderLeaf(item, section.steps),
                            )}
                        </SidebarMenu>
                    </SidebarGroup>
                </Fragment>
            ))}
        </>
    );
}
