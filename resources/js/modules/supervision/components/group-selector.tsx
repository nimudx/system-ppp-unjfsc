import { Users, X, ChevronDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface GroupModule {
    id: number;
    name: string;
}

export interface GroupOption {
    id: number;
    name: string;
    module_id: number;
    module: GroupModule | null;
    section: {
        id: number;
        name: string;
        school: { name: string; faculty: { name: string } };
    };
    supervisor: {
        user: { person: { names: string; surnames: string } };
    };
    teacher: {
        user: { person: { names: string; surnames: string } };
    };
}

interface GroupSelectorProps {
    groups: GroupOption[];
    selectedGroup: GroupOption | null;
    onSelect: (group: GroupOption | null) => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export function GroupSelector({
    groups,
    selectedGroup,
    onSelect,
    isLoading = false,
    disabled = false,
}: GroupSelectorProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (group: GroupOption) => {
        onSelect(group);
        setOpen(false);
    };

    const handleClear = () => {
        onSelect(null);
        setOpen(false);
    };

    const appliedLabel = selectedGroup
        ? `${selectedGroup.section.school.name} · ${selectedGroup.section.name} · ${selectedGroup.name}`
        : null;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={selectedGroup ? 'default' : 'outline'}
                    size="sm"
                    className={`max-w-70 gap-2 transition-all ${selectedGroup ? 'pr-2' : ''}`}
                    disabled={disabled || isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="size-3.5 shrink-0 animate-spin" />
                    ) : (
                        <Users className="size-3.5 shrink-0" />
                    )}
                    <span className="truncate text-xs font-semibold">
                        {isLoading
                            ? 'Cargando grupos...'
                            : (appliedLabel ?? 'Seleccionar grupo')}
                    </span>
                    {selectedGroup ? (
                        <Badge
                            variant="secondary"
                            className="ml-1 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/20 p-0 text-[9px] text-inherit hover:bg-white/30"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                        >
                            <X className="size-2.5" />
                        </Badge>
                    ) : (
                        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                className="w-96 p-3"
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                {/* Header */}
                <div className="mb-2 flex items-center justify-between border-b pb-2">
                    <div>
                        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            Seleccionar grupo
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                            {groups.length} grupo
                            {groups.length !== 1 ? 's' : ''} disponible
                            {groups.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {selectedGroup && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] text-muted-foreground"
                            onClick={handleClear}
                        >
                            Limpiar
                        </Button>
                    )}
                </div>

                {/* Group List */}
                <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                    {groups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                            <Users className="mb-2 size-6 opacity-30" />
                            <p className="text-xs">No hay grupos disponibles</p>
                        </div>
                    ) : (
                        groups.map((group) => {
                            const isSelected = selectedGroup?.id === group.id;
                            return (
                                <button
                                    key={group.id}
                                    onClick={() => handleSelect(group)}
                                    className={`group/item flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                                        isSelected
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted/60'
                                    }`}
                                >
                                    <div
                                        className={`flex size-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                                            isSelected
                                                ? 'bg-white/20'
                                                : 'bg-muted group-hover/item:bg-muted-foreground/10'
                                        }`}
                                    >
                                        <Users
                                            className={`size-3.5 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                                        />
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <span
                                            className={`truncate text-xs leading-tight font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}
                                        >
                                            {group.name}
                                        </span>
                                        <span
                                            className={`mt-0.5 truncate text-[10px] leading-tight ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                                        >
                                            {group.section.school.name} ·{' '}
                                            {group.section.name}
                                        </span>
                                    </div>
                                    <div className="shrink-0">
                                        <Badge
                                            variant="outline"
                                            className={`h-4 border-none px-1.5 py-0 text-[9px] font-bold ${
                                                isSelected
                                                    ? 'bg-white/20 text-primary-foreground'
                                                    : 'bg-blue-500/10 text-blue-600'
                                            }`}
                                        >
                                            {group.module?.name ??
                                                `Mód. ${group.module_id}`}
                                        </Badge>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
