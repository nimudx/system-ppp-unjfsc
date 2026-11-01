import { Head, Link } from '@inertiajs/react';
import StudentWorkflow from '@/modules/company/components/student-workflow';
import { useCompanyRequest } from '@/modules/company/components/use-company-request';
import {
    RequirementsList,
    SubmissionPanel,
    type DocumentRequirement,
} from '@/modules/documents';
import type { PlacementRecord } from '@/modules/internship/types';
import Heading from '@/shared/components/heading';
import { Button } from '@/shared/components/ui/button';
import AppLayout from '@/shared/layouts/app-layout';
import DocumentForm from './components/document-form';
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
                    description="Registra tu empresa, consulta la revisión y completa tu práctica después de la aceptación empresarial."
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
                <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
                    <h2 className="text-lg font-semibold">
                        4. Documentación de la práctica
                    </h2>
                    {!documentsEnabled ? (
                        <p className="text-sm text-muted-foreground">
                            Primero la empresa debe aceptarte y debes guardar
                            los datos del jefe inmediato y de la práctica.
                        </p>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Presenta aquí los documentos de
                                    formalización. El plan y el informe se
                                    entregan en su menú de revisión.
                                </p>
                                <Button asChild variant="outline">
                                    <Link href="/internship/report-review">
                                        Ir a revisión de plan e informe
                                    </Link>
                                </Button>
                            </div>
                            <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                                <RequirementsList
                                    requirements={data.requirements ?? []}
                                    selectedType={
                                        typeof form.activeContext === 'number'
                                            ? form.activeContext
                                            : -1
                                    }
                                    onSelectType={form.setActiveContext}
                                    previewEnabled={form.previewEnabled}
                                    onTogglePreview={() =>
                                        form.setPreviewEnabled(
                                            !form.previewEnabled,
                                        )
                                    }
                                />
                                {form.activeRequirement ? (
                                    <div className="min-w-0 space-y-4">
                                        <DocumentForm
                                            placementId={data.placement?.id}
                                            requirement={form.activeRequirement}
                                            tempFile={form.tempFile}
                                            previewUrl={form.previewUrl}
                                            canUpload={form.canUploadDocument}
                                            onUpload={form.onUploadTempFile}
                                            previewEnabled={form.previewEnabled}
                                            isEditing={form.isEditing}
                                            setIsEditing={form.setIsEditing}
                                            onClearTemp={form.removeTempFile}
                                        />
                                        <SubmissionPanel
                                            status={
                                                form.activeRequirement.status
                                            }
                                            currentRequirement={
                                                form.activeRequirement
                                            }
                                            tempFile={form.tempFile}
                                            isEditing={form.isEditing}
                                            onSetEditing={form.setIsEditing}
                                            onRemoveTemp={form.removeTempFile}
                                            uploading={form.loading}
                                            showFileInfo={{
                                                name: form.activeRequirement
                                                    .latest?.name,
                                                meta: 'Documento adjunto',
                                                size: form.activeRequirement
                                                    .latest?.size,
                                            }}
                                            onSubmit={form.handleSaveDocument}
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Selecciona el documento que deseas
                                        presentar o consultar.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
