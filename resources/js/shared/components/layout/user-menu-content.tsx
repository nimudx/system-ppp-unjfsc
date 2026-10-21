import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings, ShieldCheck } from 'lucide-react';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { UserInfo } from '@/shared/components/layout/user-info';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { useMobileNavigation } from '@/shared/hooks/use-mobile-navigation';
import type { User } from '@/shared/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { auth } = usePage().props as any;
    const profiles = auth?.profiles;

    const academicProfiles = profiles?.academic || [];
    const staffProfiles = profiles?.staff || [];

    const handleProfileSelect = (id: number, type: string) => {
        const route = type === 'academic' ? `/assignments/${id}/select` : `/staffs/${id}/select`;
        router.patch(route, {}, { preserveState: false });
        cleanup();
    };

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };
    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Profile Switcher Section */}
            {(academicProfiles.length > 0 || staffProfiles.length > 0) && (
                <>
                    <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Cambiar Perfil
                    </DropdownMenuLabel>
                    <DropdownMenuGroup className="px-1">
                        {academicProfiles.map((p: any) => (
                            <DropdownMenuItem
                                key={`ac-${p.id}`}
                                onClick={() => handleProfileSelect(p.id, 'academic')}
                                className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer ${p.selected ? 'bg-accent font-medium' : ''}`}
                            >
                                <div className="h-2 w-2 rounded-full bg-purple-500" />
                                <span className="text-xs truncate">{p.role} - <span className="text-muted-foreground">{p.context}</span></span>
                                {p.selected && <ShieldCheck className="ml-auto h-3 w-3 text-primary" />}
                            </DropdownMenuItem>
                        ))}
                        {staffProfiles.map((p: any) => (
                            <DropdownMenuItem
                                key={`st-${p.id}`}
                                onClick={() => handleProfileSelect(p.id, 'staff')}
                                className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer ${p.selected ? 'bg-accent font-medium' : ''}`}
                            >
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <span className="text-xs truncate">{p.role} - <span className="text-muted-foreground">{p.context}</span></span>
                                {p.selected && <ShieldCheck className="ml-auto h-3 w-3 text-primary" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                </>
            )}
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
