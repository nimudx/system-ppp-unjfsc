import { Head } from '@inertiajs/react';
import AppLayout from '@/shared/layouts/app-layout';
import RequestManagement from '../components/request-management';

export default function CompanyIndex() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Empresas', href: '/empresas' }]}>
            <Head title="Solicitudes de empresas" />
            <div className="space-y-6 p-4 md:p-6">
                <RequestManagement actor="teacher" />
            </div>
        </AppLayout>
    );
}
