import { Head } from '@inertiajs/react';
import Heading from '@/shared/components/heading';
import AppLayout from '@/shared/layouts/app-layout';
import type { BreadcrumbItem } from '@/shared/types';

export default function StudentSupervisionIndex() {
    const title = 'Seguimiento de Prácticas';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Prácticas Pre-Profesionales', href: '/internship' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title="Seguimiento de Prácticas"
                        description="Visualización de calificaciones del seguimiento de las prácticas pre profesionales."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
