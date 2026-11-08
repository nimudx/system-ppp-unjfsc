import { router } from '@inertiajs/react';
import { Building2, User, Calendar, FileText, EyeOff, Eye } from 'lucide-react';
import { useState } from 'react';

import {
    RequirementsList,
    FilePreview,
    ValidationPanel,
} from '@/modules/documents';

import type { InternshipDetailData } from '@/modules/internship/types';
import internship from '@/routes/academic/internship';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';

interface PlacementDetailProps {
    detailData: InternshipDetailData;
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

export default function PlacementDetail({
    detailData,
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
        typeof activeContext === 'number' ? requirements[activeContext] : null;

    const handleValidation = (
        type: 'data' | 'document',
        payloadValidation: { status: number; comment: string },
    ) => {
        const isData = type === 'data';
        let url: string;
        if (isData) {
            if (!detailData.placement) return;
            url = internship.placements.status.url(detailData.placement.id);
        } else {
            if (!activeRequirement?.latest) return;
            url = internship.documents.status.url(activeRequirement.latest.id);
        }

        const payload = isData
            ? {
                  approval_status: payloadValidation.status,
                  observation: payloadValidation.comment,
              }
            : {
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

    return (
        <div className="mt-5 flex flex-1 flex-col gap-5 overflow-hidden xl:flex-row">
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
                                name:
                                    detailData?.placement?.company?.name ||
                                    'Empresa',
                                meta: 'Datos de Formalización',
                            }}
                        />
                    ) : (
                        <ValidationPanel
                            status={activeRequirement?.status}
                            history={activeRequirement?.history || []}
                            onSuccess={(data) =>
                                handleValidation('document', data)
                            }
                            isSubmitting={isSubmitting}
                            hasSelection={!!activeRequirement}
                            showFileInfo={
                                activeRequirement?.latest
                                    ? {
                                          name: activeRequirement.title,
                                          meta: 'Documento adjunto',
                                      }
                                    : undefined
                            }
                        />
                    )}
                </div>
            </aside>
        </div>
    );
}
