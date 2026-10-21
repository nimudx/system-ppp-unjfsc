import { router, usePage } from '@inertiajs/react';
import { Calendar, Check, ChevronDown } from 'lucide-react';
import type { Semester } from '@/modules/academic';
import { NotificationDropdown } from '@/modules/notifications';
import { Breadcrumbs } from '@/shared/components/layout/breadcrumbs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/shared/types';
import type { Assignment } from '@/shared/types/auth';

const ROLE_COLORS: Record<string, string> = {
    Administrador: 'bg-blue-600',
    'Docente Titular': 'bg-purple-600',
    Estudiante: 'bg-zinc-700',
    'Docente Supervisor': 'bg-indigo-600',
    DEFAULT: 'bg-slate-500',
};

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props;
    const academic = auth?.academic;
    const profiles = auth?.profiles;

    const academicProfiles = (profiles?.academic || []).map((p) => ({
        ...p,
        type: 'academic',
        color:
            ROLE_COLORS[p.role as keyof typeof ROLE_COLORS] ||
            ROLE_COLORS.DEFAULT,
    }));

    const staffProfiles = (profiles?.staff || []).map((p) => ({
        ...p,
        type: 'staff',
        color: 'bg-blue-600', // Default color for staff
        initials: p.initials || 'ST',
    }));

    const allProfiles = [...academicProfiles, ...staffProfiles];

    const selectedSemester =
        (academic?.semesters || []).find(
            (s) => s.id === academic?.selected_semester_id,
        ) || (academic?.semesters || [])[0];

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-3">
                <NotificationDropdown
                    notifications={auth?.notifications || []}
                />

                {academic && (
                    <SemesterSelector
                        semesters={academic.semesters}
                        currentId={selectedSemester?.id}
                    />
                )}
                <AvatarStack
                    profiles={allProfiles}
                    onSelect={(id: number, type: string) => {
                        const route =
                            type === 'academic'
                                ? `/assignments/${id}/select`
                                : `/staffs/${id}/select`;
                        router.patch(route, {}, { preserveState: false });
                    }}
                />
            </div>
        </header>
    );
}

const SemesterSelector = ({
    semesters = [],
    currentId,
}: {
    semesters: Semester[];
    currentId?: number;
}) => {
    const active = semesters.find((s) => s.id === currentId);
    const { academic } = usePage().props;
    const isHistoric = academic?.historicMode;

    const onSelect = (id: number) => {
        // Mantenemos tu lógica para que el Toast salga siempre
        router.patch(`/semesters/${id}/select`, {}, { preserveState: false });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="group flex h-10 cursor-pointer items-center gap-3 rounded-md border border-input bg-background px-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent">
                    <Calendar className="h-4 w-4 shrink-0 text-primary" />
                    <div className="flex flex-col items-start leading-tight">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium tracking-wider text-muted-foreground">
                                Semestre
                            </span>
                            {isHistoric && (
                                <span className="rounded-sm border border-orange-500/20 bg-orange-500/10 px-1.5 text-[10px] font-bold text-orange-500">
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
                <DropdownMenuLabel className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Seleccionar Semestre
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {semesters.map((s) => (
                        <DropdownMenuItem
                            key={s.id}
                            className="flex cursor-pointer items-center justify-between py-2"
                            onClick={() => onSelect(s.id)}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-sm ${s.id === currentId ? 'font-bold text-primary' : ''}`}
                                >
                                    {s.code}
                                </span>
                                {s.status === 1 ? (
                                    <span className="rounded-sm bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-500 uppercase">
                                        Activo
                                    </span>
                                ) : (
                                    <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
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

const AvatarStack = ({
    profiles,
    onSelect,
}: {
    profiles: (Assignment & { type: string; color: string })[];
    onSelect: (id: number, type: string) => void;
}) => {
    const selectedProfile = profiles.find((p) => p.selected);
    const displayed = profiles.slice(0, 2);
    const remaining = profiles.length - 2;

    const academicProfiles = profiles.filter((p) => p.type === 'academic');
    const staffProfiles = profiles.filter((p) => p.type === 'staff');

    const renderProfileItem = (
        p: Assignment & { type: string; color: string },
    ) => (
        <DropdownMenuItem
            key={`${p.type}-${p.id}`}
            className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors ${
                p.selected
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50'
            }`}
            onClick={() => onSelect(p.id, p.type)}
        >
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs font-bold text-white uppercase shadow-sm ${p.color}`}
            >
                {p.initials}
            </div>
            <div className="flex min-w-0 flex-col text-left leading-tight">
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
                <div className="group flex h-10 cursor-pointer items-center gap-3 rounded-md border border-input bg-background px-3 text-left transition-all hover:bg-accent data-[state=open]:bg-accent">
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-xs font-medium tracking-wider text-muted-foreground">
                            Perfil Activo
                        </span>
                        <span className="max-w-[120px] truncate text-sm font-semibold tracking-tight uppercase">
                            {selectedProfile?.role || 'Seleccionar'}
                        </span>
                    </div>
                    <div className="flex -space-x-2">
                        {displayed.map((p) => (
                            <div
                                key={`${p.type}-${p.id}`}
                                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white uppercase shadow-sm ${p.color}`}
                            >
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
            <DropdownMenuContent
                className="w-64 rounded-lg p-1"
                align="end"
                sideOffset={8}
            >
                {academicProfiles.length > 0 && (
                    <>
                        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                            Área Académica
                        </DropdownMenuLabel>
                        <DropdownMenuGroup className="flex flex-col gap-1">
                            {academicProfiles.map(renderProfileItem)}
                        </DropdownMenuGroup>
                    </>
                )}
                {academicProfiles.length > 0 && staffProfiles.length > 0 && (
                    <DropdownMenuSeparator />
                )}
                {staffProfiles.length > 0 && (
                    <>
                        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
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
