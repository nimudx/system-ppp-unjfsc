import { Head } from '@inertiajs/react';
import { Building2, Loader2, Save } from 'lucide-react';
import RequirementsList from '@/shared/components/academic/requirements-list';
import { AlertHelp } from '@/shared/components/document/AlertHelp';
import ContentDetailsDocument from '@/shared/components/academic/submission-form';
import Heading from '@/shared/components/heading';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import AppLayout from '@/shared/layouts/app-layout';
import { type BreadcrumbItem } from '@/shared/types';
import { TYPE_LABELS, TypeSelector } from './components/type-selector';
import { usePlacementSubmission } from './hooks/use-placement-submission';
import CompanyForm from './components/company-form';
import DocumentForm from './components/document-form';
import { SectionCard } from '@/shared/components/ui/section-card';
import { SubmissionPanel } from '@/shared/components/academic/submission-panel';

interface PlacementProps {
    data: {
        placement: any | null;
        requirements: any[];
        isApproved: boolean;
    };
    title: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Prácticas Pre-Profesionales', href: '/internship' },
];

function getContextLabel(
    activeContext: 'empresa' | number,
    requirements: any[],
): string {
    if (activeContext === 'empresa') return 'Información de Empresa';
    const req = requirements[activeContext];
    return req?.title ?? '—';
}

export default function PlacementIndex({ data }: PlacementProps) {
    const {
        type,
        origin,
        setType,
        setOrigin,
        hasPlacement,
        activeContext,
        activeRequirement,
        setActiveContext,
        tempFile,
        setTempFile,
        previewUrl,
        isEditing,
        setIsEditing,
        canUploadDocument,
        onUploadTempFile,
        previewEnabled,
        setPreviewEnabled,
        handleSaveDocument,
        loading,
        removeTempFile,
    } = usePlacementSubmission({
        placement: data.placement,
        requirements: data.requirements,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Formalización de Prácticas" />

            <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title="Formalización de Prácticas"
                        description="Registre su empresa y suba los documentos para iniciar sus prácticas."
                    />
                </div>

                {/* Layout de 3 columnas */}
                <div className="relative flex flex-1 gap-6 overflow-hidden">
                    {/* COL 1: Selector de Tipo ──────────────── */}
                    <aside className="flex w-full shrink-0 flex-col gap-4 overflow-hidden lg:w-64 xl:w-72">
                        <div className="flex-1 overflow-y-auto">
                            <TypeSelector
                                type={type}
                                setType={setType}
                                origin={origin}
                                setOrigin={setOrigin}
                                disabled={hasPlacement}
                            />
                        </div>
                        <div className="flex-1 shrink-0">
                            <AlertHelp />
                        </div>
                    </aside>

                    {/* COL 2: Panel Central ──────────────────── */}
                    <main className="flex min-w-0 flex-1 flex-col">
                        <SectionCard>
                            <SectionCard.Header>
                                <div className="flex flex-row items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-primary/5 border-primary/20">
                                            <Building2 className="size-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <Badge className="border-none bg-blue-500 text-[9px] h-4 px-1.5 text-white uppercase font-bold">
                                                    Formalización
                                                </Badge>
                                                <h3 className="text-sm font-bold leading-none tracking-tight">
                                                    {getContextLabel(activeContext, data.requirements)}
                                                </h3>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">
                                                {TYPE_LABELS[type]} {origin && `→ ${TYPE_LABELS[origin]}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] font-medium border-muted-foreground/20">
                                            En proceso
                                        </Badge>
                                    </div>
                                </div>
                            </SectionCard.Header>

                            <SectionCard.Body>
                                <div className="flex flex-1 flex-col items-stretch justify-start overflow-y-auto h-full">
                                    {activeContext === 'empresa' ? (
                                        <CompanyForm
                                            placement={data.placement}
                                            type={type}
                                            origin={origin}
                                        />
                                    ) : activeRequirement ? (
                                        <DocumentForm
                                            placementId={data.placement?.id}
                                            requirement={activeRequirement}
                                            tempFile={tempFile}
                                            previewUrl={previewUrl}
                                            canUpload={canUploadDocument}
                                            onUpload={onUploadTempFile}
                                            previewEnabled={previewEnabled}
                                            isEditing={isEditing}
                                            setIsEditing={setIsEditing}
                                            onClearTemp={() => {
                                                setTempFile(null);
                                                if (previewUrl)
                                                    URL.revokeObjectURL(previewUrl);
                                            }}
                                        />
                                    ) : null}
                                </div>
                            </SectionCard.Body>
                        </SectionCard>
                    </main>


                    {/* COL 3: Panel Derecho (Empresa + Requerimientos + Tabs) ── */}
                    <aside className="flex h-full w-full shrink-0 flex-col gap-4 overflow-y-auto lg:w-64 xl:w-72">
                        {/* Botón de Empresa (misma lógica de selección que requirements) */}
                        <SectionCard>
                            <SectionCard.Header
                                title="Empresa"
                                description="Información del lugar de práctica"
                            />
                            <SectionCard.Body>
                                <Button
                                    variant={
                                        activeContext === 'empresa'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    className="flex w-full items-center justify-between"
                                    onClick={() => setActiveContext('empresa')}
                                >
                                    <div className="flex items-center gap-2 text-xs">
                                        <Building2 className="size-4" />
                                        Empresa / Jefe Directo
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={`ml-2 text-[9px] ${hasPlacement && data.placement.approval_status === 1 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                                    >
                                        {hasPlacement && data.placement.approval_status === 1
                                            ? 'Aprobado'
                                            : 'Pendiente'}
                                    </Badge>
                                </Button>
                            </SectionCard.Body>
                        </SectionCard>

                        {/* Lista de Requerimientos */}
                        <RequirementsList
                            requirements={data.requirements ?? []}
                            selectedType={
                                typeof activeContext === 'number'
                                    ? activeContext
                                    : -1
                            }
                            onSelectType={(idx) => setActiveContext(idx)}
                            previewEnabled={previewEnabled}
                            onTogglePreview={() =>
                                setPreviewEnabled(!previewEnabled)
                            }
                        />

                        {activeContext === 'empresa' ? (
                            <SectionCard>
                                <SectionCard.Header>
                                    <div className="flex justify-center gap-2 rounded-lg bg-primary px-2 py-2.5 text-xs font-semibold text-primary-foreground">
                                        Empresa
                                    </div>
                                </SectionCard.Header>
                                <SectionCard.Body className='flex justify-center'>
                                    <Button
                                        type="submit"
                                        form="form-company"
                                        size="sm"
                                        className="h-9 gap-2 text-xs font-bold uppercase shadow-sm"
                                        disabled={
                                            loading ||
                                            (data.placement &&
                                                data.placement
                                                    .approval_status === 1)
                                        }
                                    >
                                        {loading ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Save className="size-4" />
                                        )}
                                        {loading
                                            ? 'Guardando...'
                                            : data.placement
                                                ? 'Guardar Cambios'
                                                : 'Registrar Empresa'}
                                    </Button>
                                </SectionCard.Body>
                            </SectionCard>
                        ) : activeRequirement ? (
                            <SubmissionPanel
                                status={activeRequirement.status}
                                currentRequirement={activeRequirement}
                                tempFile={tempFile}
                                isEditing={isEditing}
                                onSetEditing={setIsEditing}
                                onRemoveTemp={removeTempFile}
                                uploading={loading}
                                showFileInfo={{
                                    name: activeRequirement.latest?.name,
                                    meta: "Documento adjunto",
                                    size: activeRequirement.latest?.size,
                                }}
                                onSubmit={handleSaveDocument}
                            />
                        ) : null}
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
