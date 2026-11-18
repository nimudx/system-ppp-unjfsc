import { Head } from '@inertiajs/react';
import { CompanyContent } from '@/modules/dashboard/components/empresa-dashboard';
import type { CompanyStats } from '@/modules/dashboard/types';
import { dashboard as companyDashboard } from '@/routes/company';
import AppLayout from '@/shared/layouts/app-layout';
import type { BreadcrumbItem } from '@/shared/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel',
        href: companyDashboard().url,
    },
];

export default function CompanyDashboard({
    stats,
}: {
    stats: CompanyStats | null;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel de Empresa" />
            <CompanyContent stats={stats} />
        </AppLayout>
    );
}
