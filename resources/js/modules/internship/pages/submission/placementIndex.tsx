import { Head, Link } from '@inertiajs/react';
import StudentWorkflow from '@/modules/company/components/student-workflow';
import { useCompanyRequest } from '@/modules/company/components/use-company-request';
import type { DocumentRequirement } from '@/modules/documents';
import type { PlacementRecord } from '@/modules/internship/types';
import Heading from '@/shared/components/heading';
import { Button } from '@/shared/components/ui/button';
import AppLayout from '@/shared/layouts/app-layout';
import { TypeSelector } from './components/type-selector';
import { usePlacementSubmission } from './hooks/use-placement-submission';

interface PlacementProps {
    data: {
        placement: PlacementRecord | null;
        requirements: DocumentRequirement[];
        isApproved: boolean;
    };
}

export default function PlacementIndex({ data }: PlacementProps) {
    const request = useCompanyRequest();
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
                <div className="grid items-start gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
                    <TypeSelector
                        type={form.type}
                        setType={form.setType}
                        origin={form.origin}
                        setOrigin={form.setOrigin}
                        disabled={!!data.placement}
                    />
                    <section className="min-w-0 rounded-xl border bg-card p-4 md:p-6">
                        <StudentWorkflow
                            {...request}
                            placement={data.placement}
                            type={form.type}
                            origin={form.origin}
                        />
                    </section>
                </div>
                {documentsEnabled && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                            Los documentos de formalización se presentan en el
                            menú Formalización.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/internship/formalization">
                                Ir a Formalización
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
