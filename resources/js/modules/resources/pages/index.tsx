import { Head, usePage } from '@inertiajs/react';
import { CompanyResourceContent } from '@/modules/company';
import type {
    ResourcePageProps,
    ResourceItem,
} from '@/modules/resources/types';
import { USER_TYPES } from '@/shared/config/roles';
import type { TableData } from '@/shared/hooks/use-config-table';
import AppLayout from '@/shared/layouts/app-layout';
import AcademicResourceContent from '../components/academic-resource-content';
import AdminResourceContent from '../components/admin-resource-content';

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

    if (auth.user.type_id === USER_TYPES.ADMIN) {
        return (
            <AppLayout>
                <Head title="Recursos Administrativos" />
                <AdminResourceContent
                    resources={dataList}
                    documentTypes={documentTypes ?? []}
                    roles={roles ?? []}
                    faculties={faculties ?? []}
                    initialFilters={initialFilters ?? null}
                />
            </AppLayout>
        );
    }

    if (auth.user.type_id === USER_TYPES.ACADEMIC) {
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

    if (auth.user.type_id === USER_TYPES.COMPANY) {
        return (
            <AppLayout>
                <Head title="Recursos Empresariales" />
                <CompanyResourceContent resources={dataList} />
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
