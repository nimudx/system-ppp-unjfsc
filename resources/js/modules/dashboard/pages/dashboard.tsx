import { Head } from '@inertiajs/react';
import AdminContent from '@/modules/dashboard/components/admin-content';
import { CompanyContent } from '@/modules/dashboard/components/company-content';
import StudentContent from '@/modules/dashboard/components/student-content';
import SuperAdminContent from '@/modules/dashboard/components/superadmin-content';
import SupervisorContent from '@/modules/dashboard/components/supervisor-content';
import TeacherContent from '@/modules/dashboard/components/teacher-content';
import type {
    AdminStats,
    StudentStats,
    SuperAdminStats,
    SupervisorStats,
    TeacherStats,
} from '@/modules/dashboard/types';

import { dashboard } from '@/routes';
import { ROLES } from '@/shared/config/roles';
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
            [ROLES.ADMIN]: <AdminContent stats={stats as AdminStats} />,
            [ROLES.SUBADMIN]: <AdminContent stats={stats as AdminStats} />, // Sub Admin también ve panel admin
            [ROLES.TEACHER]: <TeacherContent stats={stats as TeacherStats} />,
            [ROLES.SUPERVISOR]: (
                <SupervisorContent stats={stats as SupervisorStats} />
            ),
            [ROLES.STUDENT]: <StudentContent stats={stats as StudentStats} />,
        };
        const view =
            (stats || role === ROLES.STUDENT) && role
                ? academicView[role]
                : null;

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
            <div className="flex h-100 items-center justify-center p-4">
                <p className="text-center text-muted-foreground">
                    No tienes un panel asignado. Contacta con la coordinación
                    académica.
                </p>
            </div>
        </AppLayout>
    );
}
