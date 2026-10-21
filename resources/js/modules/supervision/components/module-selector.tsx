import { ChevronDown, CheckCircle2, Clock, Lock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

const TOTAL_MODULES = 4;

export interface ModuleOption {
    id: number;
    label: string;
    status: 'completed' | 'current' | 'locked';
}

interface ModuleSelectorProps {
    /** The current module_id of the selected group (1–4). Modules beyond this are locked. */
    groupModuleId: number;
    /** Currently selected module id */
    selectedModuleId: number | null;
    onSelect: (moduleId: number) => void;
    disabled?: boolean;
}

const statusConfig = {
    completed: {
        label: 'Completado',
        icon: CheckCircle2,
        iconClass: 'text-green-500',
        badgeClass: 'bg-green-500/10 text-green-700',
        rowClass: 'hover:bg-muted/60',
    },
    current: {
        label: 'Pendiente',
        icon: Clock,
        iconClass: 'text-amber-500',
        badgeClass: 'bg-amber-500/10 text-amber-700',
        rowClass: 'hover:bg-muted/60',
    },
    locked: {
        label: 'No habilitado',
        icon: Lock,
        iconClass: 'text-muted-foreground/40',
        badgeClass: 'bg-muted/40 text-muted-foreground/50',
        rowClass: 'opacity-40 cursor-not-allowed',
    },
};

function buildModules(groupModuleId: number): ModuleOption[] {
    return Array.from({ length: TOTAL_MODULES }, (_, i) => {
        const id = i + 1;
        let status: ModuleOption['status'];
        if (id < groupModuleId) status = 'completed';
        else if (id === groupModuleId) status = 'current';
        else status = 'locked';
        return { id, label: `Módulo ${id}`, status };
    });
}

export function ModuleSelector({
    groupModuleId,
    selectedModuleId,
    onSelect,
    disabled = false,
}: ModuleSelectorProps) {
    const modules = buildModules(groupModuleId);
    const selected = modules.find((m) => m.id === selectedModuleId);

    const buttonLabel = selected
        ? `${selected.label} — ${statusConfig[selected.status].label}`
        : 'Seleccionar módulo';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={selected ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2 transition-all"
                    disabled={disabled}
                >
                    {selected
                        ? (() => {
                              const Icon = statusConfig[selected.status].icon;
                              return <Icon className="size-3.5 shrink-0" />;
                          })()
                        : null}
                    <span className="max-w-[180px] truncate text-xs font-semibold">
                        {buttonLabel}
                    </span>
                    <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                className="w-64 p-3"
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                {/* Header */}
                <div className="mb-2 border-b pb-2">
                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                        Módulo académico
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                        Solo puedes acceder hasta el módulo {groupModuleId}
                    </p>
                </div>

                {/* Module list */}
                <div className="space-y-1">
                    {modules.map((mod) => {
                        const cfg = statusConfig[mod.status];
                        const Icon = cfg.icon;
                        const isSelected = selectedModuleId === mod.id;
                        const isLocked = mod.status === 'locked';

                        return (
                            <button
                                key={mod.id}
                                disabled={isLocked}
                                onClick={() => !isLocked && onSelect(mod.id)}
                                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                                    isLocked
                                        ? cfg.rowClass
                                        : isSelected
                                          ? 'bg-primary text-primary-foreground'
                                          : cfg.rowClass
                                }`}
                            >
                                <Icon
                                    className={`size-4 shrink-0 ${
                                        isSelected
                                            ? 'text-primary-foreground'
                                            : cfg.iconClass
                                    }`}
                                />
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <span
                                        className={`text-xs leading-tight font-bold ${
                                            isSelected
                                                ? 'text-primary-foreground'
                                                : 'text-foreground'
                                        }`}
                                    >
                                        {mod.label}
                                    </span>
                                </div>
                                <span
                                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                                        isSelected
                                            ? 'bg-white/20 text-primary-foreground'
                                            : cfg.badgeClass
                                    }`}
                                >
                                    {cfg.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
