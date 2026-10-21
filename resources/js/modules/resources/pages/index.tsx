import { Head, usePage } from '@inertiajs/react';
import { CompanyResourceContent } from '@/modules/company';
import type {
    ResourcePageProps,
    ResourceItem,
} from '@/modules/resources/types';
import type { TableData } from '@/shared/hooks/use-config-table';
import AppLayout from '@/shared/layouts/app-layout';
import AcademicResourceContent from './academic-resource-content';
import AdminResourceContent from './admin-resource-content';

type ResourceProps = Partial<Omit<ResourcePageProps, 'resources'>> & {
    resources?: TableData<ResourceItem>;
};

export default function Resource(props: ResourceProps) {
    const { resources, documentTypes, roles, faculties, initialFilters } =
        props;
    const { auth } = usePage().props;

    // Convertimos la posible respuesta objeto/arreglo a arreglo
    const dataList = Array.isArray(resources)
        ? resources
        : resources?.data || [];

    if (auth.user.type_id === 1) {
        return (
            <AppLayout>
                <Head title="Recursos Administrativos" />
                <AdminResourceContent />
            </AppLayout>
        );
    }

    if (auth.user.type_id === 2) {
        return (
            <AppLayout>
                <Head title="Recursos Académicos" />
                <AcademicResourceContent
                    resources={dataList}
                    documentTypes={documentTypes ?? []}
                    roles={roles ?? []}
                    faculties={faculties ?? []}
                    initialFilters={initialFilters ?? null}
                />
            </AppLayout>
        );
    }

    if (auth.user.type_id === 3) {
        return (
            <AppLayout>
                <Head title="Recursos Empresariales" />
                <CompanyResourceContent />
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Recursos" />
            <AdminResourceContent />
        </AppLayout>
    );
}
