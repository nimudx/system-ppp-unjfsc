import type { LucideIcon } from 'lucide-react';
import {
    Clock,
    FileText,
    ShieldCheck,
    FileCheck,
    Lock as LockIcon,
} from 'lucide-react';
import type { DocumentFile } from '@/modules/documents/types';
import { Badge } from '@/shared/components/ui/badge';
import { SectionCard } from '@/shared/components/ui/section-card';

import { getDocumentStatusMeta } from '../status';

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
    isLoading?: boolean;
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

export default function RequirementsList({
    requirements,
    selectedType,
    onSelectType,
    previewEnabled,
    onTogglePreview,
    isLoading = false,
}: RequirementsListProps) {
    if (!requirements || requirements.length === 0)
        return (
            <SectionCard className="flex items-center justify-center py-8 text-sm text-muted-foreground italic">
                {isLoading
                    ? 'Cargando requisitos...'
                    : 'Sin requisitos configurados.'}
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
                    const cfg = getDocumentStatusMeta(req.status);
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
                                    className={`h-4 shrink-0 px-1.5 text-[9px] font-bold ${cfg.badge}`}
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
