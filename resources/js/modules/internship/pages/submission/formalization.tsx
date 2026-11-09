import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import { useCompanyRequest, type CompanyRequest } from '@/modules/company';
import {
    DocumentHistoryPanel,
    DossierProgress,
    PendingActionsCard,
    RequirementsList,
    SubmissionPanel,
    buildDossierHistory,
    type DocumentRequirement,
} from '@/modules/documents';
import type { PlacementRecord } from '@/modules/internship/types';
import internship from '@/routes/academic/internship';
import Heading from '@/shared/components/heading';
import PageContainer from '@/shared/components/page-container';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import AppLayout from '@/shared/layouts/app-layout';
import DocumentReviewLayout from '@/shared/layouts/document-review-layout';
import DocumentForm from '../../components/submission/document-form';
import { usePlacementSubmission } from '../../hooks/use-placement-submission';

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
                {
                    title: 'Formalización',
                    href: internship.formalization.url(),
                },
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
                                <Link href={internship.submission.url()}>
                                    Ir a Pasantía
                                </Link>
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
                                <Link href={internship.reportReview.url()}>
                                    Rev. Prácticas
                                </Link>
                            </Button>
                        </div>

                        <DocumentReviewLayout
                            requirements={
                                <>
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
                                </>
                            }
                            document={
                                form.activeRequirement ? (
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
                                )
                            }
                            aside={
                                <>
                                    {form.activeRequirement && (
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
                                    )}

                                    <DocumentHistoryPanel
                                        history={allHistory}
                                    />
                                </>
                            }
                        />
                    </>
                )}
            </PageContainer>
        </AppLayout>
    );
}
