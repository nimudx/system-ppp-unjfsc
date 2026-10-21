import { AlertCircle, CheckCircle2, Clock, FileText, ShieldCheck, FileCheck, Circle, Info, Lock as LockIcon } from "lucide-react";
import { Badge } from "../../../shared/components/ui/badge";
import { SectionCard } from "../../../shared/components/ui/section-card";

export interface RequirementItem {
    code: string;
    title: string;
    status: number;
    locked?: boolean;
    latest?: any;
    [key: string]: any;
}

export interface RequirementsListProps {
    requirements: RequirementItem[];
    selectedType: number;
    onSelectType: (index: number) => void;
    previewEnabled: boolean;
    onTogglePreview: () => void;
}

export const getIcon = (code: string) => {
    const icons: Record<string, any> = {
        horario: Clock,
        carga_lectiva: FileText,
        resolucion: ShieldCheck,
        ficha: FileCheck,
        record: FileText,
    }
    return icons[code] || FileText;
}

const statusConfig: Record<number, { label: string; icon: any; className: string; badgeClass: string }> = {
    0: { label: 'Sin iniciar', icon: Info, className: 'text-muted-foreground', badgeClass: 'bg-muted/60 text-muted-foreground border-transparent' },
    1: { label: 'Aprobado', icon: CheckCircle2, className: 'text-green-600', badgeClass: 'bg-green-500/10 text-green-700 border-green-200' },
    2: { label: 'Pendiente', icon: Clock, className: 'text-amber-600', badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-200' },
    3: { label: 'Observado', icon: AlertCircle, className: 'text-red-600', badgeClass: 'bg-red-500/10 text-red-700 border-red-200' },
};

export default function RequirementsList({
    requirements,
    selectedType,
    onSelectType,
    previewEnabled,
    onTogglePreview
}: RequirementsListProps) {
    if (!requirements || requirements.length === 0) return (
        <SectionCard className="flex items-center justify-center text-muted-foreground text-sm italic py-8">
            Cargando requisitos...
        </SectionCard>
    );

    return (
        <SectionCard>
            <SectionCard.Header
                title="Archivos requeridos"
                description="Selecciona un archivo para gestionar"
            />
            <SectionCard.Body className="space-y-2">
                {requirements.map((req, idx) => {
                    const isActive = selectedType === idx;
                    const cfg = statusConfig[req.status > 3 ? 3 : req.status] ?? statusConfig[0];
                    const Icon = getIcon(req.code);
                    return (
                        <button
                            key={req.code}
                            onClick={() => onSelectType(idx)}
                            disabled={req.locked}
                            className={`inline-flex items-center justify-between whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 w-full ${isActive
                                ? 'bg-primary hover:bg-primary text-primary-foreground'
                                : 'hover:bg-muted/50 hover:text-accent-foreground text-muted-foreground'
                                } ${req.locked ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <div className="flex items-center">
                                <Icon className={`mr-2 h-4 w-4 shrink-0 ${isActive && !req.locked ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                <span className="truncate max-w-[150px] text-xs">{req.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[9px] font-bold h-4 px-1.5 shrink-0 ${cfg.badgeClass}`}>
                                    {cfg.label}
                                </Badge>
                                {req.locked && <LockIcon className="h-3 w-3 text-muted-foreground" />}
                            </div>
                        </button>
                    );
                })}
            </SectionCard.Body>
            <SectionCard.Footer>
                <label htmlFor="preview-toggle" className="text-xs font-medium cursor-pointer">
                    Previsualización
                </label>
                <button
                    id="preview-toggle"
                    onClick={onTogglePreview}
                    className={`inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${previewEnabled ? 'bg-primary' : 'bg-input'
                        }`}
                >
                    <span className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg transition-transform ${previewEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                </button>
            </SectionCard.Footer>
        </SectionCard>
    );
}
