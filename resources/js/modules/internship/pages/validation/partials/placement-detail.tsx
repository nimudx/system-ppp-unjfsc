import { useState } from 'react';
import {
    Building2,
    User,
    Calendar,
    FileText,
    EyeOff,
    Eye,
    Info,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import RequirementsList from '@/shared/components/academic/requirements-list';
import FilePreview from '@/shared/components/document/FilePreview';
import { Button } from '@/shared/components/ui/button';
import ContentDetailsDocument from '@/shared/components/academic/submission-form';
import { ValidationPanel } from '@/shared/components/academic/validation-panel';
import { SectionCard } from '@/shared/components/ui/section-card';

import { router } from '@inertiajs/react';
import internship from '@/routes/academic/internship';

interface PlacementDetailProps {
    detailData: any;
    loadDetail: (id?: number, step?: number) => void;
    onStatusUpdateSuccess: () => void;
}

export function InfoItem({
    label,
    value,
    span = 1,
}: {
    label: string;
    value?: string;
    span?: number;
}) {
    return (
        <div
            className={`flex flex-col gap-1 ${span === 2 ? 'col-span-2' : ''}`}
        >
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                {label}
            </span>
            <span className="border-b border-dashed border-muted pb-1 text-sm font-medium">
                {value || '---'}
            </span>
        </div>
    );
}

const TYPE_LABELS: any = {
    development: 'Desarrollo de Prácticas',
    validation: 'Convalidación de Prácticas',
    direct: 'Vía Directa',
    indirect: 'Vía Indirecta',
};

export default function PlacementDetail({
    detailData,
    loadDetail,
    onStatusUpdateSuccess,
}: PlacementDetailProps) {
    // Contexto: 'empresa' o el índice del requerimiento
    const [activeContext, setActiveContext] = useState<'empresa' | number>(
        'empresa',
    );
    const [previewEnabled, setPreviewEnabled] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const requirements = detailData?.requirements || [];
    const activeRequirement =
        typeof activeContext === 'number'
            ? requirements[activeContext]
            : null;

    const handleValidation = (
        type: 'data' | 'document',
        payloadValidation: { status: number; comment: string }
    ) => {
        const isData = type === 'data';
        const url = isData
            ? internship.placements.status.url(detailData?.placement?.id)
            : internship.documents.status.url(activeRequirement?.latest?.id);

        const payload = isData
            ? { approval_status: payloadValidation.status, observation: payloadValidation.comment }
            : { approval_status: payloadValidation.status, comment: payloadValidation.comment };

        router.patch(url, payload, {
            onBefore: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onSuccess: () => {
                onStatusUpdateSuccess();
            },
        });
    };

    return (
        <div className="mt-5 flex flex-1 flex-col gap-5 overflow-hidden xl:flex-row">
            {/* COL 1: Información Lateral Izquierda ──────────────── */}
            {/*<aside className="w-56 xl:w-64 border-r bg-muted/10 p-4 space-y-6 shrink-0 hidden xl:flex flex-col">
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Modalidad</h3>
                    <div className="space-y-2">
                        <Badge variant="outline" className="w-full justify-start py-1.5 bg-background shadow-sm border-blue-100 text-blue-700">
                            {TYPE_LABELS[detailData?.placement?.internship_type] || '---'}
                        </Badge>
                        <Badge variant="outline" className="w-full justify-start py-1.5 bg-background shadow-sm">
                            {TYPE_LABELS[detailData?.placement?.origin_type] || '---'}
                        </Badge>
                    </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-blue-800">
                        <Info className="size-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Guía de Validación</span>
                    </div>
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                        Revise que los datos de la empresa coincidan con los documentos cargados.
                        La formalización debe ser aprobada antes de iniciar el seguimiento.
                    </p>
                </div>
            </aside>*/}

            {/* COL 2: Panel Central (Detalles Empresa o PDF) ──────── */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <SectionCard>
                    <SectionCard.Header>
                        <div className="flex shrink-0 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="rounded bg-primary/10 p-1.5 text-primary">
                                    {activeContext === 'empresa' ? (
                                        <Building2 className="size-4" />
                                    ) : (
                                        <FileText className="size-4" />
                                    )}
                                </div>
                                <span className="text-xs font-bold text-foreground/80 uppercase">
                                    {activeContext === 'empresa'
                                        ? 'Detalles de la Empresa'
                                        : activeRequirement?.title ||
                                        'Vista de Documento'}
                                </span>
                            </div>
                            {activeContext !== 'empresa' && (
                                <button
                                    onClick={() =>
                                        setPreviewEnabled(!previewEnabled)
                                    }
                                    className="flex items-center gap-2 text-[10px] text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {previewEnabled ? (
                                        <EyeOff className="size-3.5" />
                                    ) : (
                                        <Eye className="size-3.5" />
                                    )}
                                    {previewEnabled
                                        ? 'Ocultar Visor'
                                        : 'Mostrar Visor'}
                                </button>
                            )}
                        </div>
                    </SectionCard.Header>
                    <SectionCard.Body>
                        <div className="flex flex-1 flex-col gap-5 overflow-hidden xl:flex-row">
                            {activeContext === 'empresa' ? (
                                <div className="scrollbar-thin flex-1 overflow-y-auto p-8">
                                    <div className="mx-auto max-w-3xl animate-in space-y-10 duration-300 zoom-in-95 fade-in">
                                        <section className="space-y-4">
                                            <div className="flex items-center gap-2 border-b pb-2 text-primary">
                                                <Building2 className="size-5" />
                                                <h3 className="text-sm font-bold tracking-tight uppercase">
                                                    Información de la Empresa
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
                                                <InfoItem
                                                    label="Nombre / Razón Social"
                                                    value={
                                                        detailData?.placement
                                                            ?.company?.name
                                                    }
                                                />
                                                <InfoItem
                                                    label="RUC"
                                                    value={
                                                        detailData?.placement
                                                            ?.company?.ruc
                                                    }
                                                />
                                                <InfoItem
                                                    label="Dirección"
                                                    value={
                                                        detailData?.placement
                                                            ?.company?.address
                                                    }
                                                    span={2}
                                                />
                                                <InfoItem
                                                    label="Correo Corporativo"
                                                    value={
                                                        detailData?.placement
                                                            ?.company?.email
                                                    }
                                                />
                                                <InfoItem
                                                    label="Teléfono de Contacto"
                                                    value={
                                                        detailData?.placement
                                                            ?.company?.phone
                                                    }
                                                />
                                            </div>
                                        </section>

                                        <section className="space-y-4">
                                            <div className="flex items-center gap-2 border-b pb-2 text-primary">
                                                <User className="size-5" />
                                                <h3 className="text-sm font-bold tracking-tight uppercase">
                                                    Responsable / Jefe Directo
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
                                                <InfoItem
                                                    label="Nombre Completo"
                                                    value={
                                                        detailData?.placement
                                                            ?.boss_name
                                                    }
                                                />
                                                <InfoItem
                                                    label="Cargo / Posición"
                                                    value={
                                                        detailData?.placement
                                                            ?.boss_position
                                                    }
                                                />
                                                <InfoItem
                                                    label="Correo Electrónico"
                                                    value={
                                                        detailData?.placement
                                                            ?.boss_email
                                                    }
                                                />
                                                <InfoItem
                                                    label="Teléfono / Celular"
                                                    value={
                                                        detailData?.placement
                                                            ?.boss_phone
                                                    }
                                                />
                                            </div>
                                        </section>

                                        <section className="space-y-4">
                                            <div className="flex items-center gap-2 border-b pb-2 text-primary">
                                                <Calendar className="size-5" />
                                                <h3 className="text-sm font-bold tracking-tight uppercase">
                                                    Detalles Horarios y Áreas
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
                                                <InfoItem
                                                    label="Área de Desempeño"
                                                    value={
                                                        detailData?.placement
                                                            ?.area_name ||
                                                        'General'
                                                    }
                                                />
                                                <InfoItem
                                                    label="Puesto del Practicante"
                                                    value={
                                                        detailData?.placement
                                                            ?.position
                                                    }
                                                />
                                                <InfoItem
                                                    label="Fecha de Inicio"
                                                    value={
                                                        detailData?.placement
                                                            ?.start_date
                                                    }
                                                />
                                                <InfoItem
                                                    label="Fecha de Término"
                                                    value={
                                                        detailData?.placement
                                                            ?.end_date
                                                    }
                                                />
                                                <InfoItem
                                                    label="Descripción Curricular"
                                                    value={
                                                        detailData?.placement
                                                            ?.description
                                                    }
                                                    span={2}
                                                />
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            ) : (
                                <FilePreview
                                    path={activeRequirement?.latest?.path}
                                    name={activeRequirement?.title}
                                    previewEnabled={previewEnabled}
                                />
                            )}
                        </div>
                    </SectionCard.Body>
                </SectionCard>
            </main>

            {/* COL 3: Acciones y Requerimientos ─────────────────── */}
            <aside className="flex w-full shrink-0 flex-col overflow-hidden bg-background lg:w-64 xl:w-72">
                <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto">
                    {/* Selector Empresa */}
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
                                    variant={
                                        detailData?.placement
                                            ?.approval_status === 1
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    className="text-[9px]"
                                >
                                    {detailData?.placement?.approval_status ===
                                        1
                                        ? 'Listo'
                                        : 'Pendiente'}
                                </Badge>
                            </Button>
                        </SectionCard.Body>
                    </SectionCard>

                    <RequirementsList
                        requirements={requirements}
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
                        <ValidationPanel
                            status={detailData?.placement?.approval_status}
                            history={[]}
                            onSuccess={(data) => handleValidation('data', data)}
                            isSubmitting={isSubmitting}
                            hasSelection={true}
                            showFileInfo={{
                                name: detailData?.placement?.company?.name || "Empresa",
                                meta: "Datos de Formalización"
                            }}
                        />
                    ) : (
                        <ValidationPanel
                            status={activeRequirement?.status}
                            history={activeRequirement?.history || []}
                            onSuccess={(data) => handleValidation('document', data)}
                            isSubmitting={isSubmitting}
                            hasSelection={!!activeRequirement}
                            showFileInfo={activeRequirement?.latest ? {
                                name: activeRequirement.title,
                                meta: "Documento adjunto"
                            } : undefined}
                        />
                    )}
                </div>
            </aside>
        </div>
    );
}
