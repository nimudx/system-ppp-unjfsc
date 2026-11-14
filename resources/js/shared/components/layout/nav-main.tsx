import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
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
} from '@/shared/components/ui/sidebar';
import { useCurrentUrl } from '@/shared/hooks/use-current-url';
import type { NavItem } from '@/shared/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasItems = item.items && item.items.length > 0;

                    if (!hasItems) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        {item.badge && (
                                            <Badge
                                                variant="secondary"
                                                className="ml-auto h-5 px-1.5 text-[10px] font-bold"
                                            >
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }
                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={item.isActive}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        {item.badge && (
                                            <Badge
                                                variant="secondary"
                                                className="ml-auto h-5 px-1.5 text-[10px] font-bold"
                                            >
                                                {item.badge}
                                            </Badge>
                                        )}
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items?.map((subItem) => (
                                            <SidebarMenuSubItem
                                                key={subItem.title}
                                            >
                                                <SidebarMenuSubButton asChild>
                                                    <Link
                                                        href={subItem.href}
                                                        prefetch
                                                    >
                                                        {subItem.icon && (
                                                            <subItem.icon />
                                                        )}
                                                        <span>
                                                            {subItem.title}
                                                        </span>
                                                        {subItem.badge && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="ml-auto h-5 px-1.5 text-[10px] font-bold"
                                                            >
                                                                {subItem.badge}
                                                            </Badge>
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
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
