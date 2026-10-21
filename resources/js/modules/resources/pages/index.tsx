import { Head, usePage } from "@inertiajs/react";
import AcademicResourceContent from "../pages/academic-resource-content";
import CompanyResourceContent from "../../company/pages/resource-content";
import AdminResourceContent from "../../admin/resource-content";
import AppLayout from "@/shared/layouts/app-layout";

interface ResourceProps {
    resources?: any;
    documentTypes?: any;
    roles?: any;
    faculties?: any;
    initialFilters?: any;
}

export default function Resource(props: ResourceProps) {
    const { resources, documentTypes, roles, faculties, initialFilters } = props;
    const { auth } = usePage().props as any;

    // Convertimos la posible respuesta objeto/arreglo a arreglo
    const dataList = Array.isArray(resources) ? resources : (resources?.data || []);

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
                    documentTypes={documentTypes}
                    roles={roles}
                    faculties={faculties}
                    initialFilters={initialFilters}
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