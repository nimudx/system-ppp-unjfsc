import { router, usePage } from '@inertiajs/react';
import { Calendar, Check, ChevronDown } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { NotificationDropdown } from './notification-dropdown';

const ROLE_COLORS: Record<string, string> = {
    ADMINISTRATIVO: 'bg-blue-600',
    'Docente Titular': 'bg-purple-600',
    Estudiante: 'bg-zinc-700',
    'Docente Supervisor': 'bg-indigo-600',
    DEFAULT: 'bg-slate-500',
};

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth } = usePage().props as any;
    const academic = auth?.academic;
    const profiles = auth?.profiles;

    const academicProfiles = (profiles?.academic || []).map((p: any) => ({
        ...p,
        type: 'academic',
        color: ROLE_COLORS[p.role as keyof typeof ROLE_COLORS] || ROLE_COLORS.DEFAULT,
    }));

    const staffProfiles = (profiles?.staff || []).map((p: any) => ({
        ...p,
        type: 'staff',
        color: 'bg-blue-600', // Default color for staff
        initials: p.initials || 'ST',
    }));

    const allProfiles = [...academicProfiles, ...staffProfiles];

    const selectedSemester = (academic?.semesters || []).find(
        (s: any) => s.id === academic?.selected_semester_id,
    ) || (academic?.semesters || [])[0];

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/40 bg-background/70 backdrop-blur-lg px-4 shadow-[0_2px_15px_-3px_oklch(0.65_0.18_233.78/0.1)] transition-all ease-out duration-300 group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-3">
                <NotificationDropdown notifications={auth?.notifications || []} />

                {academic && (
                    <SemesterSelector
                        semesters={academic.semesters}
                        currentId={selectedSemester?.id}
                    />
                )}
                <AvatarStack
                    profiles={allProfiles}
                    onSelect={(id: number, type: string) => {
                        const route = type === 'academic' ? `/assignments/${id}/select` : `/staffs/${id}/select`;
                        router.patch(route, {}, { preserveState: false });
                    }}
                />
            </div>
        </header>
    );
}

const SemesterSelector = ({ semesters = [], currentId }: { semesters: any[]; currentId?: number }) => {
    const active = semesters.find((s) => s.id === currentId);
    const { academic } = usePage().props as any;
    const isHistoric = academic?.historicMode;

    const onSelect = (id: number) => {
        // Mantenemos tu lógica para que el Toast salga siempre
        router.patch(`/semesters/${id}/select`, {}, { preserveState: false });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="group flex h-10 cursor-pointer items-center gap-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm px-3 shadow-[0_2px_8px_oklch(0.65_0.18_233.78/0.05)] transition-all duration-300 hover:bg-accent/40 hover:border-primary/30 hover:shadow-[0_4px_12px_oklch(0.65_0.18_233.78/0.15)] data-[state=open]:bg-accent/50 data-[state=open]:border-primary/50 text-left">
                    <Calendar className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:scale-110" />
                    <div className="flex flex-col items-start leading-tight">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground tracking-wider">
                                Semestre
                            </span>
                            {isHistoric && (
                                <span className="text-[10px] font-bold bg-orange-500/10 text-orange-500 px-1.5 rounded-sm border border-orange-500/20">
                                    FINALIZADO
                                </span>
                            )}
                        </div>
                        <span className="text-sm font-semibold tracking-tight">
                            {active?.code || 'N/A'}
                        </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Seleccionar Semestre
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {semesters.map((s) => (
                        <DropdownMenuItem
                            key={s.id}
                            className="flex items-center justify-between cursor-pointer py-2"
                            onClick={() => onSelect(s.id)}
                        >
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${s.id === currentId ? 'font-bold text-primary' : ''}`}>
                                    {s.code}
                                </span>
                                {s.status === 1 ? (
                                    <span className="text-[10px] uppercase font-bold bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-sm">
                                        Activo
                                    </span>
                                ) : (
                                    <span className="text-[10px] uppercase font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm">
                                        Finalizado
                                    </span>
                                )}
                            </div>
                            {s.id === currentId && (
                                <Check className="h-4 w-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const AvatarStack = ({ profiles, onSelect }: { profiles: any[]; onSelect: (id: number, type: string) => void }) => {
    const selectedProfile = profiles.find((p) => p.selected);
    const displayed = profiles.slice(0, 2);
    const remaining = profiles.length - 2;

    const academicProfiles = profiles.filter(p => p.type === 'academic');
    const staffProfiles = profiles.filter(p => p.type === 'staff');

    const renderProfileItem = (p: any) => (
        <DropdownMenuItem
            key={`${p.type}-${p.id}`}
            className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors ${p.selected ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'
                }`}
            onClick={() => onSelect(p.id, p.type)}
        >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs font-bold text-white uppercase shadow-sm ${p.color}`}>
                {p.initials}
            </div>
            <div className="flex min-w-0 flex-col leading-tight text-left">
                <span className="truncate text-sm font-semibold text-foreground">
                    {p.role}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    {p.context}
                </span>
            </div>
            {p.selected && (
                <div className="ml-auto">
                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                </div>
            )}
        </DropdownMenuItem>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="group flex h-10 cursor-pointer items-center gap-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm px-3 shadow-[0_2px_8px_oklch(0.65_0.18_233.78/0.05)] transition-all duration-300 hover:bg-accent/40 hover:border-primary/30 hover:shadow-[0_4px_12px_oklch(0.65_0.18_233.78/0.15)] data-[state=open]:bg-accent/50 data-[state=open]:border-primary/50 text-left">
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-xs font-medium text-muted-foreground tracking-wider">
                            Perfil Activo
                        </span>
                        <span className="max-w-[120px] truncate text-sm font-semibold uppercase tracking-tight">
                            {selectedProfile?.role || 'Seleccionar'}
                        </span>
                    </div>
                    <div className="flex -space-x-2">
                        {displayed.map((p) => (
                            <div key={`${p.type}-${p.id}`} className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white uppercase shadow-sm ${p.color}`}>
                                {p.initials}
                            </div>
                        ))}
                        {remaining > 0 && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold text-muted-foreground">
                                +{remaining}
                            </div>
                        )}
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-lg p-1" align="end" sideOffset={8}>
                {academicProfiles.length > 0 && (
                    <>
                        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            Área Académica
                        </DropdownMenuLabel>
                        <DropdownMenuGroup className="flex flex-col gap-1">
                            {academicProfiles.map(renderProfileItem)}
                        </DropdownMenuGroup>
                    </>
                )}
                {academicProfiles.length > 0 && staffProfiles.length > 0 && <DropdownMenuSeparator />}
                {staffProfiles.length > 0 && (
                    <>
                        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            Área de Empresa
                        </DropdownMenuLabel>
                        <DropdownMenuGroup className="flex flex-col gap-1">
                            {staffProfiles.map(renderProfileItem)}
                        </DropdownMenuGroup>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};