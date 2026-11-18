import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

import { useCompanyRequest, type CompanyRequest } from '@/modules/company';
import {
    buildDossierHistory,
    DocumentHistoryPanel,
    DocumentWorkbench,
    findApprovedAt,
    HowToSubmitCard,
    RequirementsList,
    SubmissionPageHeader,
    SubmissionPanel,
    SubmissionSummary,
    useDocumentKeyboardNav,
    useExpandedViewer,
    resolveStatus,
    type DocumentRequirement,
} from '@/modules/documents';
import type { PlacementRecord } from '@/modules/internship/types';
import internship from '@/routes/academic/internship';
import PageContainer from '@/shared/components/page-container';
import AppLayout from '@/shared/layouts/app-layout';
import DocumentReviewLayout from '@/shared/layouts/document-review-layout';

import CompanyRequiredCard from '../../components/submission/company-required-card';
import { usePlacementSubmission } from '../../hooks/use-placement-submission';

const STEPS = [
    {
        title: 'Obtén el documento',
        description:
            'Usa el formato oficial, sin modificarlo. (Puedes obtener el FUT desde el apartado de recursos)',
    },
    {
        title: 'Súbelo aquí',
        description: 'El FUT y las cartas deben ir firmados y legibles.',
    },
    {
        title: 'Espera la revisión',
        description: 'Si lo observan, corrígelo y vuelve a subirlo.',
    },
];

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

    const { expanded, setExpanded } = useExpandedViewer();

    const list = useMemo(() => data.requirements ?? [], [data.requirements]);
    const selectedType =
        typeof form.activeContext === 'number' ? form.activeContext : -1;
    const currentFile = form.activeRequirement;

    const allHistory = useMemo(() => buildDossierHistory(list), [list]);

    const summaryItems = useMemo(
        () =>
            list.map((item) => ({
                status: resolveStatus(item),
                hasFile: Boolean(item.latest),
            })),
        [list],
    );

    const currentApprovedAt = useMemo(
        () => findApprovedAt(allHistory, currentFile),
        [allHistory, currentFile],
    );

    const selectType = (index: number) => {
        if (index === selectedType || index < 0 || index >= list.length) {
            return;
        }

        form.removeTempFile();
        form.setActiveContext(index);
    };

    useDocumentKeyboardNav({
        count: list.length,
        selectedType,
        onSelect: selectType,
        enabled: documentsEnabled,
    });

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
                <SubmissionPageHeader
                    title="Formalización de prácticas"
                    description="Sube el FUT, la carta de presentación y la carta de aceptación. El plan y el informe se entregan en su menú de revisión."
                >
                    {documentsEnabled && (
                        <SubmissionSummary
                            items={summaryItems}
                            completeTitle="Formalización completa"
                        />
                    )}
                </SubmissionPageHeader>

                <CompanyRequiredCard
                    loading={request.loading}
                    unlocked={documentsEnabled}
                    href={internship.submission.url()}
                    description="Primero la empresa debe aceptarte y debes guardar los datos del jefe inmediato y de la práctica en Pasantía."
                    refreshOn={['companyRequest']}
                >
                    <DocumentReviewLayout
                        hideAside={expanded}
                        stickyAside
                        documentClassName={
                            expanded
                                ? 'fixed inset-0 z-50 h-dvh overflow-auto bg-background p-3 md:p-6'
                                : 'relative h-full w-full overflow-hidden'
                        }
                        requirements={
                            <>
                                <RequirementsList
                                    requirements={list}
                                    selectedType={selectedType}
                                    onSelectType={selectType}
                                    previewEnabled={form.previewEnabled}
                                    onTogglePreview={() =>
                                        form.setPreviewEnabled(
                                            !form.previewEnabled,
                                        )
                                    }
                                    elevated
                                />

                                <HowToSubmitCard
                                    title="Presentar tu documento"
                                    steps={STEPS}
                                    hasTemplate={Boolean(
                                        currentFile?.has_template,
                                    )}
                                    note="Si tu documento no cumple los requisitos, podrá ser observado."
                                    elevated
                                />
                            </>
                        }
                        document={
                            <DocumentWorkbench
                                currentFile={currentFile}
                                selectedType={selectedType}
                                total={list.length}
                                tempFile={form.tempFile}
                                previewUrl={form.previewUrl}
                                canUpload={form.canUploadDocument}
                                onUpload={form.onUploadTempFile}
                                previewEnabled={form.previewEnabled}
                                approvedAt={currentApprovedAt}
                                onRequestPreview={() =>
                                    form.setPreviewEnabled(true)
                                }
                                onSelectType={selectType}
                                expanded={expanded}
                                onToggleExpanded={() =>
                                    setExpanded((value) => !value)
                                }
                                uploading={form.loading}
                                uploadingLabel="Validando documento..."
                                emptyTitle="Selecciona un documento"
                                emptyDescription="Elige el documento que deseas presentar o consultar."
                                maxSizeMB={2}
                                elevated
                            />
                        }
                        aside={
                            <>
                                {currentFile && (
                                    <SubmissionPanel
                                        status={currentFile.status}
                                        currentRequirement={currentFile}
                                        tempFile={form.tempFile}
                                        isEditing={form.isEditing}
                                        onSetEditing={form.setIsEditing}
                                        onRemoveTemp={form.removeTempFile}
                                        uploading={form.loading}
                                        showFileInfo={{
                                            name: currentFile.latest?.name,
                                            meta: 'Documento adjunto',
                                            size: currentFile.latest?.size,
                                        }}
                                        onSubmit={form.handleSaveDocument}
                                        elevated
                                    />
                                )}

                                <DocumentHistoryPanel
                                    history={allHistory}
                                    compact
                                    elevated
                                />
                            </>
                        }
                    />
                </CompanyRequiredCard>
            </PageContainer>
        </AppLayout>
    );
}