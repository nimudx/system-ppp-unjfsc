import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
    buildDossierHistory,
    DOCUMENT_STATUS,
    DocumentHistoryPanel,
    DocumentWorkbench,
    findApprovedAt,
    HowToSubmitCard,
    MAX_FILE_SIZE,
    RequirementsList,
    resolveStatus,
    SubmissionPageHeader,
    SubmissionPanel,
    SubmissionSummary,
    useDocumentKeyboardNav,
    useExpandedViewer,
    type DocumentRequirement,
} from '@/modules/documents';
import type { AssignmentRecord } from '@/modules/identity';

import dossiers from '@/routes/academic/dossiers';
import PageContainer from '@/shared/components/page-container';
import AppLayout from '@/shared/layouts/app-layout';
import DocumentReviewLayout from '@/shared/layouts/document-review-layout';

import type { BreadcrumbItem } from '@/shared/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Documentación',
        href: dossiers.submission.toString(),
    },
];

const MAX_FILE_KB = Math.round(MAX_FILE_SIZE / 1024);

const STEPS = [
    {
        title: 'Descarga el documento oficial',
        description:
            'Debe ser el documento oficial, descargado de la intranet de la universidad.',
    },
    {
        title: 'Súbelo aquí',
        description: 'Sin modificarlo ni escanearlo.',
    },
    {
        title: 'Espera la revisión del Docente Titular',
        description: 'Si lo observan, corrígelo y vuelve a subirlo.',
    },
];

export default function MyDossier({
    requirements,
    dossier,
}: {
    assignment: AssignmentRecord;
    requirements: DocumentRequirement[];
    dossier: number;
}) {
    const [selectedType, setSelectedType] = useState(0);
    // La vista previa arranca activa si el primer requisito ya tiene archivo.
    const [previewEnabled, setPreviewEnabled] = useState(() =>
        Boolean(requirements?.[0]?.latest),
    );
    const [isEditing, setIsEditing] = useState(false);
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { expanded, setExpanded } = useExpandedViewer();

    const list = useMemo(() => requirements ?? [], [requirements]);
    const currentFile = list[selectedType];
    const currentStatus = tempFile ? 0 : resolveStatus(currentFile);

    const { post, processing, transform } = useForm({
        file: null as File | null,
        code: '',
        target_id: dossier,
    });

    /*
     * Combina el historial de todos los requisitos.
     * Cada registro conserva el título y código del documento de origen.
     */
    const allHistory = useMemo(() => buildDossierHistory(list), [list]);

    const summaryItems = useMemo(
        () =>
            list.map((item) => ({
                status: resolveStatus(item),
                hasFile: Boolean(item.latest),
            })),
        [list],
    );

    const allApproved =
        list.length > 0 &&
        list.every(
            (item) =>
                Boolean(item.latest) &&
                resolveStatus(item) === DOCUMENT_STATUS.APPROVED,
        );

    /* Fecha de aprobación del archivo vigente, tomada de su historial. */
    const currentApprovedAt = useMemo(
        () => findApprovedAt(allHistory, currentFile),
        [allHistory, currentFile],
    );

    /* Libera la URL temporal al cambiar o salir de la página. */
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const onUpload = (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            toast.error(
                `El archivo pesa ${Math.round(file.size / 1024)} KB. El máximo es ${MAX_FILE_KB} KB.`,
            );
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setTempFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const removeTempFile = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setTempFile(null);
        setPreviewUrl(null);
        setIsEditing(false);
    };

    const selectType = (index: number) => {
        if (index === selectedType || index < 0 || index >= list.length) {
            return;
        }

        removeTempFile();
        setSelectedType(index);
    };

    useDocumentKeyboardNav({
        count: list.length,
        selectedType,
        onSelect: selectType,
    });

    const canUpload = (!currentFile?.latest || isEditing) && !tempFile;

    const handleSubmit = (event?: React.FormEvent) => {
        event?.preventDefault();

        if (!tempFile || !currentFile) {
            toast.error('Selecciona un archivo antes de enviar.');
            return;
        }

        transform((data) => ({
            ...data,
            code: currentFile.code,
            file: tempFile,
        }));

        post(dossiers.document.store().url, {
            onSuccess: () => {
                removeTempFile();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0] as
                    | string
                    | undefined;

                toast.error(firstError || 'Error al procesar la solicitud', {
                    duration: 10000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documentación" />

            <PageContainer>
                <SubmissionPageHeader
                    title="Validación de documentos"
                    description="Sube y sigue los archivos requeridos para tu expediente."
                >
                    <SubmissionSummary items={summaryItems} variant="banner" />
                </SubmissionPageHeader>

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
                                previewEnabled={previewEnabled}
                                elevated
                                onTogglePreview={() =>
                                    setPreviewEnabled((value) => !value)
                                }
                            />

                            {!allApproved && (
                                <HowToSubmitCard
                                    steps={STEPS}
                                    hasTemplate={Boolean(
                                        currentFile?.has_template,
                                    )}
                                    note="Si tu documento no cumple con los requerimientos, no podrá ser cargado y/o posteriormente observado"
                                    elevated
                                />
                            )}
                        </>
                    }
                    document={
                        <DocumentWorkbench
                            currentFile={currentFile}
                            selectedType={selectedType}
                            total={list.length}
                            tempFile={tempFile}
                            previewUrl={previewUrl}
                            canUpload={canUpload}
                            onUpload={onUpload}
                            previewEnabled={previewEnabled}
                            approvedAt={currentApprovedAt}
                            onRequestPreview={() => setPreviewEnabled(true)}
                            onSelectType={selectType}
                            expanded={expanded}
                            onToggleExpanded={() =>
                                setExpanded((value) => !value)
                            }
                            uploading={processing}
                            uploadingLabel="Validando documento..."
                            emptyTitle="No hay documentos requeridos"
                            emptyDescription="No se encontraron requisitos para este expediente."
                            elevated
                        />
                    }
                    aside={
                        <>
                            {currentFile && (
                                <SubmissionPanel
                                    status={currentStatus}
                                    currentRequirement={currentFile}
                                    tempFile={tempFile}
                                    isEditing={isEditing}
                                    onSetEditing={setIsEditing}
                                    onRemoveTemp={removeTempFile}
                                    uploading={processing}
                                    showFileInfo={{
                                        name: currentFile.latest?.name,
                                        meta: 'Documento oficial',
                                        size: currentFile.latest?.size,
                                    }}
                                    onSubmit={handleSubmit}
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
            </PageContainer>
        </AppLayout>
    );
}
