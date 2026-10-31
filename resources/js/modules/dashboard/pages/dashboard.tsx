import { Head } from '@inertiajs/react';
import AdminContent from '@/modules/dashboard/components/admin-content';
import { CompanyContent } from '@/modules/dashboard/components/company-content';
import StudentContent from '@/modules/dashboard/components/student-content';
import SuperAdminContent from '@/modules/dashboard/components/superadmin-content';
import SupervisorContent from '@/modules/dashboard/components/supervisor-content';
import TeacherContent from '@/modules/dashboard/components/teacher-content';
import type {
    AdminStats,
    SuperAdminStats,
    SupervisorStats,
    TeacherStats,
} from '@/modules/dashboard/types';

import { dashboard } from '@/routes';
import { PlaceholderPattern } from '@/shared/components/ui/placeholder-pattern';
import AppLayout from '@/shared/layouts/app-layout';
import type { BreadcrumbItem } from '@/shared/types';
import type { Auth } from '@/shared/types/auth';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel',
        href: dashboard().url,
    },
];

function NoAcademicRole() {
    return (
        <div className="flex h-100 items-center justify-center p-4">
            <p className="text-center text-muted-foreground">
                No tienes un rol académico activo asignado.
                <br />
                Por favor, selecciona una asignación válida en el menú superior.
            </p>
        </div>
    );
}

export default function Dashboard({
    auth,
    role,
    stats,
}: {
    auth: Auth;
    role?: number | null;
    stats: unknown;
}) {
    const userType = auth.user.type;

    if (userType === 'Administrador') {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Panel de Administración" />
                <SuperAdminContent stats={stats as SuperAdminStats} />
            </AppLayout>
        );
    }

    if (userType === 'Empresa') {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Panel de Empresa" />
                <CompanyContent />
            </AppLayout>
        );
    }

    if (userType === 'Académico') {
        // Los indicadores llegan del servidor según el rol activo (DashboardService).
        const academicView: Record<number, React.ReactNode> = {
            1: <AdminContent stats={stats as AdminStats} />,
            2: <AdminContent stats={stats as AdminStats} />, // Sub Admin también ve panel admin
            3: <TeacherContent stats={stats as TeacherStats} />,
            4: <SupervisorContent stats={stats as SupervisorStats} />,
            5: <StudentContent />,
        };
        const view = (stats || role === 5) && role ? academicView[role] : null;

        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Panel Académico" />
                {view ?? <NoAcademicRole />}
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
