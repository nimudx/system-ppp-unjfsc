import { Head } from '@inertiajs/react';
import {
    RequestHistory,
    StudentWorkflow,
    useCompanyRequest,
    type CompanyRequest,
} from '@/modules/company';
import type { DocumentRequirement } from '@/modules/documents';
import type { PlacementRecord } from '@/modules/internship/types';
import Heading from '@/shared/components/heading';
import AppLayout from '@/shared/layouts/app-layout';
import { TypeSelector } from '../../components/submission/type-selector';
import { usePlacementSubmission } from '../../hooks/use-placement-submission';

interface PlacementProps {
    data: {
        placement: PlacementRecord | null;
        requirements: DocumentRequirement[];
        isApproved: boolean;
    };
    companyRequest: CompanyRequest | null;
}

export default function PlacementIndex({
    data,
    companyRequest,
}: PlacementProps) {
    const request = useCompanyRequest(companyRequest);
    const documentsEnabled =
        !request.loading &&
        !request.error &&
        !!request.current?.can_upload_documents;
    const form = usePlacementSubmission({
        placement: data.placement,
        requirements: data.requirements,
        documentsEnabled,
    });

    return (
        <AppLayout breadcrumbs={[{ title: 'Pasantía', href: '/internship' }]}>
            <Head title="Pasantía" />
            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                <Heading
                    title="Pasantía"
                    description="Registra tu empresa, consulta la revisión y completa los datos de tu práctica después de la aceptación empresarial."
                />
                <div className="grid items-start gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="-m-1 space-y-4 p-1 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
                        <TypeSelector
                            type={form.type}
                            setType={form.setType}
                            origin={form.origin}
                            setOrigin={form.setOrigin}
                            disabled={!!data.placement}
                        />
                        <RequestHistory history={request.current?.history} />
                    </aside>
                    <div className="min-w-0">
                        <StudentWorkflow
                            {...request}
                            placement={data.placement}
                            type={form.type}
                            origin={form.origin}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
