import type { LucideIcon } from 'lucide-react';
import { FileSpreadsheet, Users, Eye, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import type { Faculty } from '@/modules/academic';

import type { PersonInitialState } from '@/modules/registration/pages/register/person/person.types';
import type { RoleOption } from '@/modules/registration/types';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { DataPreviewModal } from './partials/DataPreviewModal';

interface MassiveSummaryProps {
    data: PersonInitialState;
    roles: RoleOption[];
    faculties: Faculty[];
}

function SummaryRow({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon?: LucideIcon;
}) {
    return (
        <div className="flex items-center justify-between py-2 text-xs">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="h-3 w-3 text-muted-foreground/60" />}
                <span className="text-muted-foreground">{label}</span>
            </div>
            <span className="font-semibold text-foreground">{value}</span>
        </div>
    );
}

export function MassiveSStepTwo({
    data,
    roles,
    faculties,
}: MassiveSummaryProps) {
    const [showPreview, setShowPreview] = useState(false);

    const getLabel = (
        arr: { id: number; name: string }[] | undefined,
        id: string | number,
    ) => arr?.find((i) => i.id.toString() === id?.toString())?.name || '—';

    // Obtenemos los datos dinámicos del estado global 'data' de Inertia
    const fileName = data.file?.name || 'Archivo de carga masiva';
    const recordCount = data.rows?.length || 0;

    const selectedFaculty = faculties.find(
        (f) => f.id.toString() === data.faculty_id?.toString(),
    );
    const schoolName = getLabel(selectedFaculty?.schools, data.school_id);

    const selectedSchool = selectedFaculty?.schools?.find(
        (s) => s.id.toString() === data.school_id?.toString(),
    );
    const sectionName = getLabel(selectedSchool?.sections, data.section_id);

    return (
        <div className="animate-in space-y-6 duration-500 zoom-in-95 fade-in">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border bg-card/50 p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <LabelHeader title="Detalles del Archivo" />
                        <Badge
                            variant="secondary"
                            className="text-[9px] font-bold tracking-tight uppercase"
                        >
                            Status: Validado
                        </Badge>
                    </div>

                    <div className="mb-6 flex items-center gap-4 rounded-xl border border-primary/10 bg-primary/5 p-3">
                        <div className="rounded-xl bg-primary/10 p-2.5 shadow-inner">
                            <FileSpreadsheet className="h-6 w-6 text-primary shadow-sm" />
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                            <p className="truncate text-sm font-bold tracking-tight">
                                {fileName}
                            </p>
                            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                Procesado como JSON
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="h-3 w-3" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-[10px]">
                                                Los datos del CSV fueron
                                                parseados a JSON para mayor
                                                seguridad.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <SummaryRow
                            label="Total de Registros"
                            value={`${recordCount} usuarios`}
                        />
                        <Separator className="my-1 border-dashed" />
                        <SummaryRow
                            label="Tipo de Carga"
                            value="Masiva / Batch"
                        />

                        <div className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-full border-dashed text-[10px] font-bold transition-all duration-300 hover:bg-primary/5 hover:text-primary"
                                onClick={() => setShowPreview(true)}
                                disabled={recordCount === 0}
                            >
                                <Eye className="mr-2 h-3.5 w-3.5" />
                                Vista Previa de los Datos
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Panel de Asignación Académica */}
                <div className="rounded-xl border bg-card/50 p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <LabelHeader title="Asignación Grupal" />
                        <Badge
                            variant="outline"
                            className="border-muted/50 text-[9px] font-medium"
                        >
                            Masivo
                        </Badge>
                    </div>

                    <div className="space-y-1">
                        <SummaryRow
                            label="Rol destino"
                            value={getLabel(roles, data.role_id)}
                        />
                        <Separator className="my-1 border-dashed opacity-50" />
                        <SummaryRow
                            label="Facultad"
                            value={getLabel(faculties, data.faculty_id)}
                        />
                        <SummaryRow label="Escuela" value={schoolName} />
                        <SummaryRow label="Sección" value={sectionName} />
                    </div>

                    <div className="mt-6 flex gap-3 rounded-lg border bg-muted/40 p-3 text-[10px] leading-relaxed text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                        <p>
                            Todos los usuarios heredan automáticamente la
                            configuración enviada en la Etapa 1.
                        </p>
                    </div>
                </div>
            </div>

            <DataPreviewModal
                open={showPreview}
                onOpenChange={setShowPreview}
                data={data.rows || []}
            />
        </div>
    );
}

function LabelHeader({ title }: { title: string }) {
    return (
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase">
            {title}
        </p>
    );
}
