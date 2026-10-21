import { Separator } from '@/shared/components/ui/separator';
import { FileSpreadsheet, Users, Eye, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { DataPreviewModal } from './partials/DataPreviewModal';
import { Badge } from '@/shared/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/ui/tooltip";

import { type Faculty } from '@/shared/types';

interface MassiveSummaryProps {
    data: any;
    roles: any[];
    faculties: Faculty[];
}

function SummaryRow({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
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

export function MassiveSStepTwo({ data, roles, faculties }: MassiveSummaryProps) {
    const [showPreview, setShowPreview] = useState(false);

    const getLabel = (arr: any[] | undefined, id: string | number) => arr?.find((i: any) => i.id.toString() === id?.toString())?.name || '—';

    // Obtenemos los datos dinámicos del estado global 'data' de Inertia
    const fileName = data.file?.name || "Archivo de carga masiva";
    const recordCount = data.rows?.length || 0;

    const selectedFaculty = faculties.find((f: any) => f.id.toString() === data.faculty_id?.toString());
    const schoolName = getLabel(selectedFaculty?.schools, data.school_id);

    const selectedSchool = selectedFaculty?.schools?.find((s: any) => s.id.toString() === data.school_id?.toString());
    const sectionName = getLabel(selectedSchool?.sections, data.section_id);

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border bg-card/50 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <LabelHeader title="Detalles del Archivo" />
                        <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-tight">
                            Status: Validado
                        </Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-6 p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="p-2.5 bg-primary/10 rounded-xl shadow-inner">
                            <FileSpreadsheet className="h-6 w-6 text-primary shadow-sm" />
                        </div>
                        <div className="overflow-hidden space-y-0.5">
                            <p className="text-sm font-bold truncate tracking-tight">{fileName}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                Procesado como JSON
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="h-3 w-3" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className='text-[10px]'>Los datos del CSV fueron parseados a JSON para mayor seguridad.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <SummaryRow label="Total de Registros" value={`${recordCount} usuarios`} />
                        <Separator className="my-1 border-dashed" />
                        <SummaryRow label="Tipo de Carga" value="Masiva / Batch" />

                        <div className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full text-[10px] h-8 font-bold border-dashed hover:bg-primary/5 hover:text-primary transition-all duration-300"
                                onClick={() => setShowPreview(true)}
                                disabled={recordCount === 0}
                            >
                                <Eye className="w-3.5 h-3.5 mr-2" />
                                Vista Previa de los Datos
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Panel de Asignación Académica */}
                <div className="rounded-xl border bg-card/50 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <LabelHeader title="Asignación Grupal" />
                        <Badge variant="outline" className="text-[9px] font-medium border-muted/50">
                            Masivo
                        </Badge>
                    </div>

                    <div className="space-y-1">
                        <SummaryRow label="Rol destino" value={getLabel(roles, data.role_id)} />
                        <Separator className="my-1 border-dashed opacity-50" />
                        <SummaryRow label="Facultad" value={getLabel(faculties, data.faculty_id)} />
                        <SummaryRow label="Escuela" value={schoolName} />
                        <SummaryRow label="Sección" value={sectionName} />
                    </div>

                    <div className="mt-6 p-3 rounded-lg bg-muted/40 border text-[10px] text-muted-foreground leading-relaxed flex gap-3">
                        <Users className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                        <p>Todos los usuarios heredan automáticamente la configuración enviada en la Etapa 1.</p>
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
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
            {title}
        </p>
    );
}
