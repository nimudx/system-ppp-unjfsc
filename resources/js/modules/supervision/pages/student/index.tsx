import { Head } from '@inertiajs/react';

import Heading from '@/shared/components/heading';
import PageContainer from '@/shared/components/page-container';
import AppLayout from '@/shared/layouts/app-layout';
import type { BreadcrumbItem } from '@/shared/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Prácticas Pre-Profesionales', href: '/internship' },
];

export default function StudentSupervisionIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rev. Prácticas" />

            <PageContainer fullHeight>
                <Heading
                    variant="small"
                    title="Rev. Prácticas"
                    description="Esta sección estará disponible próximamente."
                />
            </PageContainer>
        </AppLayout>
    );
}
