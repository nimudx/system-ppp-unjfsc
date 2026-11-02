import { Head, Link } from '@inertiajs/react';
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
import { usePlacementSubmission } from './hooks/use-placement-submission';

interface FormalizationProps {
    data: {
        placement: PlacementRecord | null;
        requirements: DocumentRequirement[];
        isApproved: boolean;
    };
}

export default function Formalization({ data }: FormalizationProps) {
    const request = useCompanyRequest();
    const documentsEnabled =
        !request.loading &&
        !request.error &&
        !!request.current?.can_upload_documents;
    const form = usePlacementSubmission({
        placement: data.placement,
        requirements: data.requirements,
        documentsEnabled,
        initialContext: 0,
    });

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Formalización', href: '/internship/formalization' },
            ]}
        >
            <Head title="Formalización" />
            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                <Heading
                    title="Formalización"
                    description="Presenta aquí los documentos de formalización. El plan y el informe se entregan en su menú de revisión."
                />
                <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
                    <h2 className="text-lg font-semibold">
                        Documentación de la práctica
                    </h2>
                    {!documentsEnabled ? (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Primero la empresa debe aceptarte y debes
                                guardar los datos del jefe inmediato y de la
                                práctica en Pasantía.
                            </p>
                            <Button asChild variant="outline">
                                <Link href="/internship">Ir a Pasantía</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Sube el FUT, la carta de presentación y la
                                    carta de aceptación. El plan y el informe se
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
