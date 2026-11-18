import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

import {
    buildDossierHistory,
    DocumentHistoryPanel,
    DocumentWorkbench,
    findApprovedAt,
    HowToSubmitCard,
    RequirementsList,
    resolveStatus,
    SubmissionPageHeader,
    SubmissionPanel,
    SubmissionSummary,
    useDocumentKeyboardNav,
    useExpandedViewer,
    type DocumentRequirement,
} from '@/modules/documents';
import type { PlacementRecord } from '@/modules/internship/types';
import internship from '@/routes/academic/internship';
import PageContainer from '@/shared/components/page-container';
import AppLayout from '@/shared/layouts/app-layout';
import DocumentReviewLayout from '@/shared/layouts/document-review-layout';

import CompanyRequiredCard from '../../components/submission/company-required-card';
import { usePlacementSubmission } from '../../hooks/use-placement-submission';

interface AnnexesProps {
    data: {
        placement: PlacementRecord | null;
        requirements: DocumentRequirement[];
        isApproved: boolean;
    };
    canUploadDocuments: boolean;
}

const STEPS = [
    {
        title: 'Descarga las plantillas de anexos oficiales',
        description:
            'Usa los anexos 1, 2 y 3 publicados en la sección de recursos.',
    },
    {
        title: 'Súbelos en PDF',
        description:
            'Cada anexo debe estar en formato PDF, legible y con los datos completos. Peso Maximo 5MB',
    },
    {
        title: 'Espera la revisión',
        description:
            'Si observan un anexo, corrígelo y vuelve a subirlo desde esta pantalla.',
    },
];

export default function Annexes({ data, canUploadDocuments }: AnnexesProps) {
    const form = usePlacementSubmission({
        placement: data.placement,
        requirements: data.requirements,
        documentsEnabled: canUploadDocuments,
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
        enabled: canUploadDocuments,
    });

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Anexos del informe', href: internship.annexes.url() },
            ]}
        >
            <Head title="Anexos del informe" />

            <PageContainer>
                <SubmissionPageHeader
                    title="Anexos del informe"
                    description="Sube los anexos 1, 2 y 3 en formato PDF y consulta tu historial de entregas. Puedes reemplazar un anexo si necesitas corregirlo."
                >
                    {canUploadDocuments && (
                        <SubmissionSummary
                            items={summaryItems}
                            completeTitle="Anexos completos"
                            completeDetail="Todos tus anexos fueron aprobados."
                        />
                    )}
                </SubmissionPageHeader>

                <CompanyRequiredCard
                    unlocked={canUploadDocuments}
                    href={internship.submission.url()}
                    refreshOn={['canUploadDocuments', 'data']}
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
                                    title="Presentar tus anexos"
                                    steps={STEPS}
                                    note="Los documentos deben ser oficiales, descargados de la intranet."
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
                                uploadingLabel="Validando anexo..."
                                emptyTitle="Selecciona un anexo"
                                emptyDescription="Elige el anexo que deseas subir o consultar."
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
