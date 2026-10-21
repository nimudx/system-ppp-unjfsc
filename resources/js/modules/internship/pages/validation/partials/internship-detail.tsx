import { router } from '@inertiajs/react';
import { Info, FileText, EyeOff, Eye } from 'lucide-react';
import { useState } from 'react';

import {
    RequirementsList,
    FilePreview,
    ValidationPanel,
} from '@/modules/documents';

import type { InternshipDetailData } from '@/modules/internship/types';
import internship from '@/routes/academic/internship';
import { Stepper } from '@/shared/components/stepper';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';

import { EvaluationView } from '../../submission/parts/EvaluationView';

interface InternshipDetailProps {
    detailData: InternshipDetailData;
    loadDetail: (id?: number, step?: number) => void;
    onStatusUpdateSuccess: () => void;
}

export default function InternshipDetail({
    detailData,
    loadDetail,
    onStatusUpdateSuccess,
}: InternshipDetailProps) {
    const [selectedReqIndex, setSelectedReqIndex] = useState(0);
    const [previewEnabled, setPreviewEnabled] = useState(true);
    const [viewStep, setViewStep] = useState(detailData?.currentStep || 1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const steps = detailData?.steps || [];
    const requirements = detailData?.requirements || [];
    const currentRequirement = requirements[selectedReqIndex] || null;
    const isViewingPastStep = viewStep !== detailData?.currentStep;
    const isEvalStage =
        steps.find((s) => s.id === viewStep)?.is_evaluation ?? false;

    const handleStepClick = (id: number) => {
        if (id <= detailData?.currentStep && id !== viewStep) {
            loadDetail(undefined, id);
            setViewStep(id);
            setSelectedReqIndex(0);
        }
    };

    const handleValidation = (payloadValidation: {
        status: number;
        comment: string;
    }) => {
        if (!currentRequirement?.latest?.id) return;

        const url = internship.documents.status.url(
            currentRequirement.latest.id,
        );
        const payload = {
            approval_status: payloadValidation.status,
            comment: payloadValidation.comment,
        };

        router.patch(url, payload, {
            onBefore: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onSuccess: () => {
                onStatusUpdateSuccess();
            },
        });
    };

    if (steps.length === 0) {
        const sectionId =
            detailData?.assignment?.section_id ||
            detailData?.assignment?.section?.id ||
            '';
        const schoolId =
            detailData?.assignment?.section?.school_id ||
            detailData?.assignment?.section?.school?.id ||
            '';
        const facultyId =
            detailData?.assignment?.section?.school?.faculty_id ||
            detailData?.assignment?.section?.school?.faculty?.id ||
            '';
        const settingsUrl = `/settings/internship?faculty_id=${facultyId}&school_id=${schoolId}&section_id=${sectionId}`;

        return (
            <div className="flex h-full flex-col items-center justify-center p-8">
                <div className="flex max-w-md flex-col items-center text-center">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-dashed bg-muted/10">
                        <Info className="size-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-bold tracking-tight uppercase">
                        Etapas no configuradas
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        Las etapas y requisitos del flujo de prácticas aún no
                        han sido configurados para esta sección. Por favor,
                        establezca la configuración antes de continuar.
                    </p>

                    {detailData?.assignment?.section && (
                        <div className="mt-6 w-full space-y-1 rounded-lg border bg-muted/20 p-4 text-left text-[11px] text-muted-foreground">
                            <p className="mb-1.5 text-[10px] font-bold tracking-wider text-foreground uppercase">
                                Detalle Académico:
                            </p>
                            <p>
                                <span className="font-medium text-foreground">
                                    Facultad:
                                </span>{' '}
                                {detailData?.assignment?.section?.school
                                    ?.faculty?.name || 'N/A'}
                            </p>
                            <p>
                                <span className="font-medium text-foreground">
                                    Escuela:
                                </span>{' '}
                                {detailData?.assignment?.section?.school
                                    ?.name || 'N/A'}
                            </p>
                            <p>
                                <span className="font-medium text-foreground">
                                    Sección:
                                </span>{' '}
                                {detailData?.assignment?.section?.name || 'N/A'}
                            </p>
                        </div>
                    )}

                    <Button
                        onClick={() => router.get(settingsUrl)}
                        className="mt-6 text-xs font-bold uppercase"
                        size="sm"
                    >
                        Configurar etapas
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 flex h-full flex-col gap-6 overflow-hidden">
            {/* Stepper Superior */}
            <Stepper
                currentStep={detailData?.currentStep}
                steps={steps}
                onStepClick={handleStepClick}
            />

            {/* Info de Etapa */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="border-primary/20 bg-primary/5 px-3 font-bold text-primary"
                    >
                        {steps.find((s) => s.id === viewStep)?.label ||
                            `Etapa ${viewStep}`}
                    </Badge>
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        Paso {viewStep} de {steps.length}
                    </span>
                    {isViewingPastStep && (
                        <Badge
                            variant="outline"
                            className="animate-pulse border-amber-200 bg-amber-50 text-[10px] text-amber-700"
                        >
                            Modo Histórico
                        </Badge>
                    )}
                </div>
                {!isEvalStage && (
                    <span className="text-xs font-bold tracking-tighter text-muted-foreground uppercase">
                        Progreso:{' '}
                        {requirements.filter((r) => r.status === 1).length} /{' '}
                        {requirements.length} Aprobados
                    </span>
                )}
            </div>

            {/* Contenido Principal */}
            {isEvalStage ? (
                <div className="flex-1 overflow-y-auto">
                    <EvaluationView internship={detailData?.internship} />
                </div>
            ) : requirements.length > 0 ? (
                <div className="flex min-h-0 flex-1 gap-6 overflow-hidden">
                    {/* COL 2: Visor de Documento */}
                    <main className="flex min-w-0 flex-1 flex-col">
                        <SectionCard className="flex-1">
                            <SectionCard.Header>
                                <div className="flex h-full items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex size-8 items-center justify-center rounded-md border ${currentRequirement ? 'border-primary/20 bg-primary/5' : 'bg-muted/50'}`}
                                        >
                                            <FileText
                                                className={`size-4 ${currentRequirement ? 'text-primary' : 'text-muted-foreground'}`}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm leading-none font-semibold">
                                                {currentRequirement.title}
                                            </span>
                                            <span className="mt-1 text-[11px] text-muted-foreground">
                                                {currentRequirement?.latest
                                                    ? 'Archivo cargado'
                                                    : 'Sin archivo'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setPreviewEnabled((p) => !p)
                                        }
                                        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {previewEnabled ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                        <span className="hidden sm:block">
                                            {previewEnabled
                                                ? 'Desactivar'
                                                : 'Previsualizar'}
                                        </span>
                                    </button>
                                </div>
                            </SectionCard.Header>
                            <SectionCard.Body>
                                <FilePreview
                                    path={currentRequirement?.latest?.path}
                                    name={currentRequirement?.title}
                                    previewEnabled={previewEnabled}
                                />
                            </SectionCard.Body>
                        </SectionCard>
                    </main>

                    {/* COL 3: Dictamen */}
                    <aside className="custom-scrollbar flex shrink-0 flex-col gap-4 overflow-y-auto lg:w-64 xl:w-72">
                        <RequirementsList
                            requirements={requirements}
                            selectedType={selectedReqIndex}
                            onSelectType={setSelectedReqIndex}
                            previewEnabled={previewEnabled}
                            onTogglePreview={() =>
                                setPreviewEnabled(!previewEnabled)
                            }
                        />
                        <ValidationPanel
                            status={currentRequirement?.status}
                            history={currentRequirement?.history || []}
                            onSuccess={handleValidation}
                            isSubmitting={isSubmitting}
                            hasSelection={!!currentRequirement}
                            showFileInfo={
                                currentRequirement?.latest
                                    ? {
                                          name: currentRequirement.title,
                                          meta: 'Documento adjunto',
                                      }
                                    : undefined
                            }
                        />
                        <div className="mt-4 space-y-2 rounded-lg border border-dashed bg-muted/20 p-4">
                            <h5 className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                <Info className="size-3" /> Ayuda al Validador
                            </h5>
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                                Revise detenidamente cada documento. Si observa
                                errores, indique el motivo detallado para que el
                                estudiante pueda corregirlo.
                            </p>
                        </div>
                    </aside>
                </div>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/5 text-muted-foreground">
                    <Info className="size-10 opacity-20" />
                    <p className="text-sm font-medium">
                        No hay documentos en esta etapa.
                    </p>
                </div>
            )}
        </div>
    );
}
