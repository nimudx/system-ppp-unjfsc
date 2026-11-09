import { Head } from '@inertiajs/react';
import company from '@/routes/company';
import AppLayout from '@/shared/layouts/app-layout';
import RequestManagement from '../components/request-management';

export default function CompanyRequests() {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Solicitudes de estudiantes',
                    href: company.requests.url(),
                },
            ]}
        >
            <Head title="Solicitudes de estudiantes" />
            <div className="space-y-6 p-4 md:p-6">
                <RequestManagement actor="company" />
            </div>
        </AppLayout>
    );
}
