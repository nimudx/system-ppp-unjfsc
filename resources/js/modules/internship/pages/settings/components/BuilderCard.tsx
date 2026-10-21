import { Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/react/sortable";
import { WorkflowStage } from "../types";
import { RequirementColumn } from "./RequirementColumn";

interface BuilderCardProps {
    stage: WorkflowStage;
    onUpdateName: (id: string, name: string) => void;
    onDelete: (id: string) => void;
    onAddRequirement: (stageId: string, type: 'development' | 'validation', documentInfo: { name: string; code: string }) => void;
    onRemoveRequirement: (stageId: string, type: 'development' | 'validation', docIndex: number) => void;
    availableDocuments: any[];
}

export function BuilderCard({ stage, onUpdateName, onDelete, onAddRequirement, onRemoveRequirement, availableDocuments = [] }: BuilderCardProps) {
    const { ref, handleRef, isDragging } = useSortable({
        id: `stage-${stage.id}`,
        type: 'stage',
        accept: 'stage',
        index: stage.step - 1,
        group: 'stages'
    });

    return (
        <div
            ref={ref}
            className={`bg-card border border-border rounded-lg shadow-sm p-6 space-y-4 ${isDragging ? "opacity-50 ring-2 ring-primary shadow-lg" : ""}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                        {stage.step}
                    </span>
                    <input
                        type="text"
                        className="text-lg font-semibold bg-transparent border-none focus:ring-0 p-0 hover:bg-slate-50 transition-colors rounded px-2 w-full"
                        value={stage.name}
                        onChange={(e) => onUpdateName(stage.id, e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDelete(stage.id)}
                        className="p-2 text-slate-400 hover:text-destructive transition-colors"
                        title="Eliminar etapa"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {/* Drag & Drop Handle */}
                    <div ref={handleRef} className="cursor-move p-2 text-slate-300 hover:text-slate-500 transition-colors">
                        <GripVertical className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <RequirementColumn
                    type="development"
                    stageId={stage.id}
                    documents={stage.required_docs.development}
                    onAdd={(type, name) => onAddRequirement(stage.id, type, name)}
                    onRemove={(type, idx) => onRemoveRequirement(stage.id, type, idx)}
                    availableDocuments={availableDocuments}
                />
                <RequirementColumn
                    type="validation"
                    stageId={stage.id}
                    documents={stage.required_docs.validation}
                    onAdd={(type, name) => onAddRequirement(stage.id, type, name)}
                    onRemove={(type, idx) => onRemoveRequirement(stage.id, type, idx)}
                    availableDocuments={availableDocuments}
                />
            </div>
        </div>
    );
}
