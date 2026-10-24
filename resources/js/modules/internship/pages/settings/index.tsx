import { DragDropProvider } from '@dnd-kit/react';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Save, GitMerge } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { Faculty } from '@/modules/academic';
import internship from '@/routes/academic/internship';
import type { AcademicFilterValues } from '@/shared/components/data-table/academic-filter';
import { AcademicFilter } from '@/shared/components/data-table/academic-filter';
import Heading from '@/shared/components/heading';
import { Button } from '@/shared/components/ui/button';
import AppLayout from '@/shared/layouts/app-layout';
import AcademicSettingsLayout from '@/shared/layouts/settings/academic-settings-layout';

import { BuilderCard } from './components/BuilderCard';
import { EvaluationCard } from './components/EvaluationCard';
import { JsonPreview } from './components/JsonPreview';
import { StepperPreview } from './components/StepperPreview';
import type { WorkflowStage } from './types';
import { buildDragEndHandler, RestrictToVerticalAxis } from './useDragSort';
import { useWorkflow } from './useWorkflow';

// ─── Plantilla por defecto para secciones sin configuración ──────────────────
const createDefaultWorkflow = () => [
    {
        id: crypto.randomUUID(),
        step: 1,
        name: 'Planeamiento',
        is_evaluation: false,
        required_docs: { development: [], validation: [] },
    },
    {
        id: crypto.randomUUID(),
        step: 2,
        name: 'Supervisión Intermedia',
        is_evaluation: false,
        required_docs: { development: [], validation: [] },
    },
    {
        id: crypto.randomUUID(),
        step: 3,
        name: 'Evaluación Final',
        is_evaluation: true,
        required_docs: { development: [], validation: [] },
    },
];

// ─── Página ───────────────────────────────────────────────────────────────────
export default function InternshipSettingsIndex({
    faculties,
    setting,
    currentSectionId,
    availableDocuments = [],
}: {
    faculties: Faculty[];
    setting: { workflow_schema?: WorkflowStage[] } | null;
    currentSectionId: number | null;
    availableDocuments?: { id: number; name: string; code: string }[];
}) {
    const { role } = usePage().props;
    const {
        workflow,
        initializeWorkflow,
        addStage,
        updateStageName,
        deleteStage,
        addRequirement,
        removeRequirement,
        reorderStage,
        reorderRequirement,
    } = useWorkflow([]);

    // Hidrata desde el backend cada vez que cambia la sección seleccionada
    useEffect(() => {
        if (!currentSectionId) {
            initializeWorkflow([]);
            return;
        }
        initializeWorkflow(
            (setting?.workflow_schema?.length ?? 0) > 0
                ? (setting?.workflow_schema ?? [])
                : createDefaultWorkflow(),
        );
    }, [setting, currentSectionId, initializeWorkflow]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleFilter = (values: AcademicFilterValues) => {
        router.get(
            window.location.pathname,
            values.section_id ? { section_id: values.section_id } : {},
        );
    };

    const handleSave = () => {
        if (!currentSectionId) return;
        router.put(
            internship.settings.update().url,
            { section_id: currentSectionId, workflow_schema: workflow },
            {
                onError: (errors) =>
                    toast.error(String(Object.values(errors)[0])),
            },
        );
    };

    // Handler DnD: delegado completamente a useDragSort (sin detalle de lib aquí)
    const handleDragEnd = buildDragEndHandler({
        onReorderStage: reorderStage,
        onReorderRequirement: reorderRequirement,
    });

    // Separar etapas normales de la etapa de evaluación final
    const regularStages = workflow.filter((s) => !s.is_evaluation);
    const evaluationStage = workflow.find((s) => s.is_evaluation);

    // ── Render ────────────────────────────────────────────────────────────────
    const breadcrumbs = [
        { title: 'Panel', href: '/dashboard' },
        { title: 'Configuración de Prácticas', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Prácticas" />

            <AcademicSettingsLayout>
                <div className="flex flex-1 flex-col gap-6">
                    <Heading
                        variant="small"
                        title="Configuración de Flujo"
                        description="Define las etapas y requisitos documentales dinámicamente por sección."
                    />

                    {/* Filtro de sección + botones de acción */}
                    <div className="flex items-center justify-between gap-3 sm:flex-row">
                        {role !== 3 && (
                            <AcademicFilter
                                faculties={faculties || []}
                                onFilter={handleFilter}
                            />
                        )}
                        {currentSectionId && (
                            <div
                                className={`flex gap-2 ${role === 3 ? 'ml-auto' : ''}`}
                            >
                                <Button
                                    onClick={addStage}
                                    variant="secondary"
                                    className="shrink-0 gap-2"
                                >
                                    <Plus className="h-4 w-4" /> Nueva Etapa
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="shrink-0 gap-2"
                                >
                                    <Save className="h-4 w-4" /> Guardar
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Contenido principal */}
                    {!currentSectionId ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-12 text-center text-slate-500">
                            <GitMerge className="mb-4 h-12 w-12 text-slate-300" />
                            <h3 className="text-lg font-medium text-slate-700">
                                Ninguna sección seleccionada
                            </h3>
                            <p className="mt-2 max-w-md text-sm">
                                Usa el filtro para elegir la Facultad, Escuela y
                                Sección. Al hacerlo, se cargará su configuración
                                de prácticas.
                            </p>
                        </div>
                    ) : (
                        <DragDropProvider
                            modifiers={[RestrictToVerticalAxis]}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                                {/* Panel Builder (izquierda) */}
                                <div className="space-y-4 lg:col-span-7">
                                    {/* Etapas normales — arrastables */}
                                    {regularStages.map((stage) => (
                                        <BuilderCard
                                            key={stage.id}
                                            stage={stage}
                                            onUpdateName={updateStageName}
                                            onDelete={deleteStage}
                                            onAddRequirement={addRequirement}
                                            onRemoveRequirement={
                                                removeRequirement
                                            }
                                            availableDocuments={
                                                availableDocuments
                                            }
                                        />
                                    ))}
                                    {/* Etapa de evaluación — fija, fuera del DnD scope */}
                                    {evaluationStage && (
                                        <EvaluationCard
                                            stage={evaluationStage}
                                        />
                                    )}
                                </div>

                                {/* Panel Preview (derecha) */}
                                <div className="lg:col-span-5">
                                    <div className="sticky top-8 space-y-6">
                                        <StepperPreview workflow={workflow} />
                                        <JsonPreview workflow={workflow} />
                                    </div>
                                </div>
                            </div>
                        </DragDropProvider>
                    )}
                </div>
            </AcademicSettingsLayout>
        </AppLayout>
    );
}
