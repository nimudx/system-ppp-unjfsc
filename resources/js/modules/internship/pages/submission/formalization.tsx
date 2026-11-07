import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import { useCompanyRequest } from '@/modules/company/components/use-company-request';
import type { CompanyRequest } from '@/modules/company/services/company-workflow';
import {
    RequirementsList,
    SubmissionPanel,
    type DocumentRequirement,
} from '@/modules/documents';
import {
    DocumentHistoryPanel,
    DossierProgress,
    PendingActionsCard,
    buildDossierHistory,
} from '@/modules/documents/components/dossier-shared';
import type { PlacementRecord } from '@/modules/internship/types';
import Heading from '@/shared/components/heading';
import PageContainer from '@/shared/components/page-container';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import AppLayout from '@/shared/layouts/app-layout';
import { cn } from '@/shared/lib/utils';
import DocumentForm from './components/document-form';
import { usePlacementSubmission } from './hooks/use-placement-submission';

interface FormalizationProps {
    data: {
        placement: PlacementRecord | null;
        requirements: DocumentRequirement[];
        isApproved: boolean;
    };
    companyRequest: CompanyRequest | null;
}

export default function Formalization({
    data,
    companyRequest,
}: FormalizationProps) {
    const request = useCompanyRequest(companyRequest);
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

    const list = useMemo(() => data.requirements ?? [], [data.requirements]);
    const selectedType =
        typeof form.activeContext === 'number' ? form.activeContext : -1;

    const allHistory = useMemo(() => buildDossierHistory(list), [list]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Formalización', href: '/internship/formalization' },
            ]}
        >
            <Head title="Formalización" />

            <PageContainer>
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <Heading
                        variant="small"
                        title="Formalización"
                        description="Presenta aquí los documentos de formalización. El plan y el informe se entregan en su menú de revisión."
                    />

                    {documentsEnabled && (
                        <DossierProgress
                            requirements={list}
                            selectedType={selectedType}
                        />
                    )}
                </div>

                {request.loading ? (
                    <SectionCard>
                        <SectionCard.Body>
                            <p
                                role="status"
                                className="text-sm text-muted-foreground"
                            >
                                Consultando tu solicitud…
                            </p>
                        </SectionCard.Body>
                    </SectionCard>
                ) : !documentsEnabled ? (
                    <SectionCard>
                        <SectionCard.Body className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Primero la empresa debe aceptarte y debes
                                guardar los datos del jefe inmediato y de la
                                práctica en Pasantía.
                            </p>

                            <Button asChild variant="outline">
                                <Link href="/internship">Ir a Pasantía</Link>
                            </Button>
                        </SectionCard.Body>
                    </SectionCard>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="min-w-0 text-sm text-muted-foreground">
                                Sube el FUT, la carta de presentación y la carta
                                de aceptación.
                            </p>

                            <Button asChild variant="outline" size="sm">
                                <Link href="/internship/report-review">
                                    Rev. Prácticas
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-col items-start gap-6 lg:flex-row">
                            {/* Izquierda: requisitos y pendientes */}
                            <div className="order-3 flex w-full shrink-0 flex-col gap-6 lg:order-none lg:w-64 xl:w-72">
                                <RequirementsList
                                    requirements={list}
                                    selectedType={selectedType}
                                    onSelectType={form.setActiveContext}
                                    previewEnabled={form.previewEnabled}
                                    onTogglePreview={() =>
                                        form.setPreviewEnabled(
                                            !form.previewEnabled,
                                        )
                                    }
                                />

                                <PendingActionsCard requirements={list} />
                            </div>

                            {/* Centro: documento */}
                            <div
                                className={cn(
                                    'order-1 min-w-0 flex-1 lg:order-none',
                                )}
                            >
                                {form.activeRequirement ? (
                                    <DocumentForm
                                        requirement={form.activeRequirement}
                                        tempFile={form.tempFile}
                                        previewUrl={form.previewUrl}
                                        canUpload={form.canUploadDocument}
                                        onUpload={form.onUploadTempFile}
                                        previewEnabled={form.previewEnabled}
                                    />
                                ) : (
                                    <SectionCard>
                                        <SectionCard.Body className="flex min-h-64 flex-col items-center justify-center text-center">
                                            <p className="text-sm font-medium">
                                                Selecciona un documento
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Elige el documento que deseas
                                                presentar o consultar.
                                            </p>
                                        </SectionCard.Body>
                                    </SectionCard>
                                )}
                            </div>

                            {/* Derecha: detalle e historial */}
                            <aside className="order-2 flex w-full min-w-0 shrink-0 flex-col gap-6 lg:order-none lg:w-64 xl:w-72">
                                {form.activeRequirement && (
                                    <SubmissionPanel
                                        status={form.activeRequirement.status}
                                        currentRequirement={
                                            form.activeRequirement
                                        }
                                        tempFile={form.tempFile}
                                        isEditing={form.isEditing}
                                        onSetEditing={form.setIsEditing}
                                        onRemoveTemp={form.removeTempFile}
                                        uploading={form.loading}
                                        showFileInfo={{
                                            name: form.activeRequirement.latest
                                                ?.name,
                                            meta: 'Documento adjunto',
                                            size: form.activeRequirement.latest
                                                ?.size,
                                        }}
                                        onSubmit={form.handleSaveDocument}
                                    />
                                )}

                                <DocumentHistoryPanel history={allHistory} />
                            </aside>
                        </div>
                    </>
                )}
            </PageContainer>
        </AppLayout>
    );
}
