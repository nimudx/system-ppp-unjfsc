import { Head } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { useState } from 'react';

import { SubmissionPanel } from '@/modules/documents';
import type { DocumentRequirement } from '@/modules/documents';

import type {
    InternshipRecord,
    InternshipStep,
    InternshipAssignment,
} from '@/modules/internship/types';
import Heading from '@/shared/components/heading';
import { Stepper } from '@/shared/components/stepper';
import { Badge } from '@/shared/components/ui/badge';

import AppLayout from '@/shared/layouts/app-layout';
import { type BreadcrumbItem } from '@/shared/types';
// Hook
import { useInternshipSubmission } from './hooks/use-internship-submission';
// Components
import { DocumentViewerPanel } from './parts/DocumentViewerPanel';
import { EvaluationView } from './parts/EvaluationView';
import { RequirementListPanel } from './parts/RequirementListPanel';

interface InternshipIndexProps {
    data: {
        assignment: InternshipAssignment;
        internship: InternshipRecord | null;
        steps: InternshipStep[];
        currentStep: number;
        requirements: DocumentRequirement[];
    };
}

export default function InternshipIndex({ data }: InternshipIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Prácticas Pre-Profesionales', href: '/internship' },
    ];

    const [previewEnabled, setPreviewEnabled] = useState(false);

    const {
        viewStep,
        selectedReqIndex,
        setSelectedReqIndex,
        isEditing,
        setIsEditing,
        tempFile,
        previewUrl,
        uploading,
        currentRequirement,
        requirements,
        handleStepClick,
        onFileUpload,
        removeTempFile,
        submitDocument,
        isViewingPastStep,
    } = useInternshipSubmission({
        initialData: data,
        internshipId: data.internship?.id,
    });

    const isEvalStage =
        data.steps.find((s) => s.id === viewStep)?.is_evaluation ?? false;

    if (!data.steps || data.steps.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Prácticas" />
                <div className="flex h-full flex-1 flex-col gap-8 p-8">
                    <div className="flex items-center justify-between">
                        <Heading
                            variant="small"
                            title="Seguimiento de Prácticas"
                            description="Registro de documentos y evaluaciones conforme avancen sus prácticas."
                        />
                        <Badge
                            variant="outline"
                            className="border-green-200 bg-green-100 text-green-700"
                        >
                            Convenio con:{' '}
                            {data.assignment?.placement?.company?.name || '---'}
                        </Badge>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center p-8">
                        <div className="flex max-w-md flex-col items-center text-center">
                            <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-dashed bg-muted/10">
                                <Info className="size-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-bold tracking-tight uppercase">
                                Etapas de prácticas no configuradas
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                Las etapas y requisitos del seguimiento de sus
                                prácticas aún no han sido configurados por la
                                coordinación académica de su escuela.
                            </p>

                            {data.assignment?.section && (
                                <div className="mt-6 w-full space-y-1 rounded-lg border bg-muted/20 p-4 text-left text-[11px] text-muted-foreground">
                                    <p className="mb-1.5 text-[10px] font-bold tracking-wider text-foreground uppercase">
                                        Información Académica:
                                    </p>
                                    <p>
                                        <span className="font-medium text-foreground">
                                            Facultad:
                                        </span>{' '}
                                        {data.assignment?.section?.school
                                            ?.faculty?.name || 'N/A'}
                                    </p>
                                    <p>
                                        <span className="font-medium text-foreground">
                                            Escuela:
                                        </span>{' '}
                                        {data.assignment?.section?.school
                                            ?.name || 'N/A'}
                                    </p>
                                    <p>
                                        <span className="font-medium text-foreground">
                                            Sección:
                                        </span>{' '}
                                        {data.assignment?.section?.name ||
                                            'N/A'}
                                    </p>
                                </div>
                            )}

                            <p className="mt-6 text-xs font-semibold text-muted-foreground uppercase italic">
                                Por favor, comuníquese con su coordinador
                                académico para habilitar el flujo.
                            </p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Prácticas" />
            <div className="flex h-full flex-1 flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Seguimiento de Prácticas"
                        description="Registro de documentos y evaluaciones conforme avancen sus prácticas."
                    />
                    <Badge
                        variant="outline"
                        className="border-green-200 bg-green-100 text-green-700"
                    >
                        Convenio con:{' '}
                        {data.assignment?.placement?.company?.name || '---'}
                    </Badge>
                </div>

                <div className="flex flex-col gap-6">
                    <Stepper
                        currentStep={data.currentStep}
                        steps={data.steps}
                        onStepClick={handleStepClick}
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className="border-primary/20 bg-primary/5 font-bold text-primary"
                            >
                                {data.steps.find((s) => s.id === viewStep)
                                    ?.label || `Etapa ${viewStep}`}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                Etapa {viewStep} de {data.steps.length}
                            </span>
                            {isViewingPastStep && (
                                <Badge
                                    variant="outline"
                                    className="ml-2 animate-pulse border-amber-200 bg-amber-50 text-amber-700"
                                >
                                    Modo Visualización
                                </Badge>
                            )}
                        </div>
                        {!isEvalStage && (
                            <span className="text-sm font-medium text-muted-foreground">
                                {
                                    requirements.filter((r) => r.status === 1)
                                        .length
                                }{' '}
                                / {requirements.length} Aprobados
                            </span>
                        )}
                    </div>

                    {isEvalStage ? (
                        <EvaluationView internship={data.internship} />
                    ) : requirements.length > 0 ? (
                        <div className="flex flex-col items-start gap-6 lg:flex-row">
                            <RequirementListPanel
                                requirements={requirements}
                                selectedType={selectedReqIndex}
                                onSelectType={setSelectedReqIndex}
                                previewEnabled={previewEnabled}
                                onTogglePreview={() =>
                                    setPreviewEnabled(!previewEnabled)
                                }
                            />

                            <DocumentViewerPanel
                                currentRequirement={currentRequirement}
                                tempFile={tempFile}
                                previewUrl={previewUrl}
                                uploading={uploading}
                                canUpload={
                                    !isViewingPastStep &&
                                    (!currentRequirement?.latest ||
                                        isEditing) &&
                                    !tempFile
                                }
                                onUpload={onFileUpload}
                                previewEnabled={previewEnabled}
                            />

                            <SubmissionPanel
                                currentRequirement={currentRequirement}
                                tempFile={tempFile}
                                isEditing={isEditing}
                                onSetEditing={setIsEditing}
                                onRemoveTemp={removeTempFile}
                                uploading={uploading}
                                onSubmit={submitDocument}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-muted-foreground">
                            <Info className="size-8 opacity-30" />
                            <p className="text-sm">
                                No hay documentos configurados para esta etapa.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
