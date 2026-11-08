import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';

import {
    RequirementsList,
    SubmissionPanel,
    type DocumentRequirement,
} from '@/modules/documents';
import {
    DocumentHistoryPanel,
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
import DocumentForm from '../components/submission/document-form';
import { usePlacementSubmission } from '../hooks/use-placement-submission';

interface AnnexesProps {
    data: {
        placement: PlacementRecord | null;
        requirements: DocumentRequirement[];
        isApproved: boolean;
    };
    canUploadDocuments: boolean;
}

export default function Annexes({ data, canUploadDocuments }: AnnexesProps) {
    const form = usePlacementSubmission({
        placement: data.placement,
        requirements: data.requirements,
        documentsEnabled: canUploadDocuments,
        initialContext: 0,
    });

    const list = useMemo(() => data.requirements ?? [], [data.requirements]);
    const selectedType =
        typeof form.activeContext === 'number' ? form.activeContext : -1;
    const uploaded = list.filter((item) => item.latest).length;
    const allHistory = useMemo(() => buildDossierHistory(list), [list]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Rev. Informe', href: '/internship/annexes' },
            ]}
        >
            <Head title="Rev. Informe" />

            <PageContainer>
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <Heading
                        variant="small"
                        title="Rev. Informe"
                        description="Sube los anexos 1, 2 y 3 de tu práctica y consulta tu historial de entregas."
                    />

                    {canUploadDocuments && (
                        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                            <span className="text-sm font-medium tabular-nums">
                                {uploaded} / {list.length}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                anexos subidos
                            </span>
                        </div>
                    )}
                </div>

                {!canUploadDocuments ? (
                    <SectionCard>
                        <SectionCard.Body className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Primero la empresa debe aceptarte y debes
                                registrar los datos del jefe inmediato y de la
                                práctica en Pasantía.
                            </p>

                            <Button asChild variant="outline">
                                <Link href="/internship">Ir a Pasantía</Link>
                            </Button>
                        </SectionCard.Body>
                    </SectionCard>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            Presenta los anexos 1, 2 y 3 en formato PDF. Puedes
                            reemplazar un anexo si necesitas corregirlo.
                        </p>

                        <div className="flex flex-col items-start gap-6 lg:flex-row">
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
                                                Selecciona un anexo
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Elige el anexo que deseas subir
                                                o consultar.
                                            </p>
                                        </SectionCard.Body>
                                    </SectionCard>
                                )}
                            </div>

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
