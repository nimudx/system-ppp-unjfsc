import { Head } from '@inertiajs/react';

import Heading from '@/shared/components/heading';
import AppLayout from '@/shared/layouts/app-layout';
import type { BreadcrumbItem } from '@/shared/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Prácticas Pre-Profesionales', href: '/internship' },
];

export default function StudentSupervisionIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rev. Prácticas" />

            <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <Heading
                    variant="small"
                    title="Rev. Prácticas"
                    description="Esta sección estará disponible próximamente."
                />
            </div>
        </AppLayout>
    );
}
