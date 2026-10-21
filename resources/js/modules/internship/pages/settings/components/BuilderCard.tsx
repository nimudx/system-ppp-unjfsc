import { useSortable } from '@dnd-kit/react/sortable';
import { Trash2, GripVertical } from 'lucide-react';

import type { WorkflowStage } from '../types';
import { RequirementColumn } from './RequirementColumn';

interface BuilderCardProps {
    stage: WorkflowStage;
    onUpdateName: (id: string, name: string) => void;
    onDelete: (id: string) => void;
    onAddRequirement: (
        stageId: string,
        type: 'development' | 'validation',
        documentInfo: { name: string; code: string },
    ) => void;
    onRemoveRequirement: (
        stageId: string,
        type: 'development' | 'validation',
        docIndex: number,
    ) => void;
    availableDocuments: { id: number; name: string; code: string }[];
}

export function BuilderCard({
    stage,
    onUpdateName,
    onDelete,
    onAddRequirement,
    onRemoveRequirement,
    availableDocuments = [],
}: BuilderCardProps) {
    const { ref, handleRef, isDragging } = useSortable({
        id: `stage-${stage.id}`,
        type: 'stage',
        accept: 'stage',
        index: stage.step - 1,
        group: 'stages',
    });

    return (
        <div
            ref={ref}
            className={`space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm ${isDragging ? 'opacity-50 shadow-lg ring-2 ring-primary' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                        {stage.step}
                    </span>
                    <input
                        type="text"
                        className="w-full rounded border-none bg-transparent p-0 px-2 text-lg font-semibold transition-colors hover:bg-slate-50 focus:ring-0"
                        value={stage.name}
                        onChange={(e) => onUpdateName(stage.id, e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDelete(stage.id)}
                        className="p-2 text-slate-400 transition-colors hover:text-destructive"
                        title="Eliminar etapa"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    {/* Drag & Drop Handle */}
                    <div
                        ref={handleRef}
                        className="cursor-move p-2 text-slate-300 transition-colors hover:text-slate-500"
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <RequirementColumn
                    type="development"
                    stageId={stage.id}
                    documents={stage.required_docs.development}
                    onAdd={(type, name) =>
                        onAddRequirement(stage.id, type, name)
                    }
                    onRemove={(type, idx) =>
                        onRemoveRequirement(stage.id, type, idx)
                    }
                    availableDocuments={availableDocuments}
                />
                <RequirementColumn
                    type="validation"
                    stageId={stage.id}
                    documents={stage.required_docs.validation}
                    onAdd={(type, name) =>
                        onAddRequirement(stage.id, type, name)
                    }
                    onRemove={(type, idx) =>
                        onRemoveRequirement(stage.id, type, idx)
                    }
                    availableDocuments={availableDocuments}
                />
            </div>
        </div>
    );
}
