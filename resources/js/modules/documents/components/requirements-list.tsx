import type { LucideIcon } from 'lucide-react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    ShieldCheck,
    FileCheck,
    Info,
    Lock as LockIcon,
} from 'lucide-react';
import type { DocumentFile } from '@/modules/documents/types';
import { Badge } from '@/shared/components/ui/badge';
import { SectionCard } from '@/shared/components/ui/section-card';

export interface RequirementItem {
    code: string;
    title: string;
    status: number;
    locked?: boolean;
    latest?: DocumentFile | null;
    history?: DocumentFile[];
}

export interface RequirementsListProps {
    requirements: RequirementItem[];
    selectedType: number;
    onSelectType: (index: number) => void;
    previewEnabled: boolean;
    onTogglePreview: () => void;
}

export const getIcon = (code: string) => {
    const icons: Record<string, LucideIcon> = {
        horario: Clock,
        carga_lectiva: FileText,
        resolucion: ShieldCheck,
        ficha: FileCheck,
        record: FileText,
    };
    return icons[code] || FileText;
};

const statusConfig: Record<
    number,
    {
        label: string;
        icon: LucideIcon;
        className: string;
        badgeClass: string;
    }
> = {
    0: {
        label: 'Sin iniciar',
        icon: Info,
        className: 'text-muted-foreground',
        badgeClass: 'bg-muted/60 text-muted-foreground border-transparent',
    },
    1: {
        label: 'Aprobado',
        icon: CheckCircle2,
        className: 'text-green-600',
        badgeClass: 'bg-green-500/10 text-green-700 border-green-200',
    },
    2: {
        label: 'Pendiente',
        icon: Clock,
        className: 'text-amber-600',
        badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-200',
    },
    3: {
        label: 'Observado',
        icon: AlertCircle,
        className: 'text-red-600',
        badgeClass: 'bg-red-500/10 text-red-700 border-red-200',
    },
};

export default function RequirementsList({
    requirements,
    selectedType,
    onSelectType,
    previewEnabled,
    onTogglePreview,
}: RequirementsListProps) {
    if (!requirements || requirements.length === 0)
        return (
            <SectionCard className="flex items-center justify-center py-8 text-sm text-muted-foreground italic">
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
                    const cfg =
                        statusConfig[req.status > 3 ? 3 : req.status] ??
                        statusConfig[0];
                    const Icon = getIcon(req.code);
                    return (
                        <button
                            key={req.code}
                            onClick={() => onSelectType(idx)}
                            disabled={req.locked}
                            className={`inline-flex h-10 w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none ${
                                isActive
                                    ? 'bg-primary text-primary-foreground hover:bg-primary'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-accent-foreground'
                            } ${req.locked ? 'cursor-not-allowed opacity-50 grayscale' : ''}`}
                        >
                            <div className="flex items-center">
                                <Icon
                                    className={`mr-2 h-4 w-4 shrink-0 ${isActive && !req.locked ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                                />
                                <span className="max-w-[150px] truncate text-xs">
                                    {req.title}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={`h-4 shrink-0 px-1.5 text-[9px] font-bold ${cfg.badgeClass}`}
                                >
                                    {cfg.label}
                                </Badge>
                                {req.locked && (
                                    <LockIcon className="h-3 w-3 text-muted-foreground" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </SectionCard.Body>
            <SectionCard.Footer>
                <label
                    htmlFor="preview-toggle"
                    className="cursor-pointer text-xs font-medium"
                >
                    Previsualización
                </label>
                <button
                    id="preview-toggle"
                    onClick={onTogglePreview}
                    className={`inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                        previewEnabled ? 'bg-primary' : 'bg-input'
                    }`}
                >
                    <span
                        className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg transition-transform ${
                            previewEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                    />
                </button>
            </SectionCard.Footer>
        </SectionCard>
    );
}
