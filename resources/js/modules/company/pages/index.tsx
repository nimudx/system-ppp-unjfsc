import { Head } from '@inertiajs/react';
import { index as companiesIndex } from '@/routes/academic/companies';
import AppLayout from '@/shared/layouts/app-layout';
import RequestManagement from '../components/request-management';

export default function CompanyIndex() {
    return (
        <AppLayout
            breadcrumbs={[{ title: 'Empresas', href: companiesIndex().url }]}
        >
            <Head title="Solicitudes de empresas" />
            <div className="space-y-6 p-4 md:p-6">
                <RequestManagement actor="teacher" />
            </div>
        </AppLayout>
    );
}
