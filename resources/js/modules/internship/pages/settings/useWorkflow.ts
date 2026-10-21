import { useState } from 'react';
import { WorkflowStage } from './types';

export function useWorkflow(initialState: WorkflowStage[]) {
    const [workflow, setWorkflow] = useState<WorkflowStage[]>(initialState);

    const addStage = () => {
        setWorkflow(prev => {
            const arr = [...prev];
            // Insertar siempre ANTES de la etapa de evaluación (última)
            const evalIdx = arr.findIndex(s => s.is_evaluation);
            const insertAt = evalIdx === -1 ? arr.length : evalIdx;
            const newStage = {
                id: crypto.randomUUID(),
                step: insertAt + 1,
                name: "Nueva Etapa",
                is_evaluation: false,
                required_docs: { development: [], validation: [] }
            };
            arr.splice(insertAt, 0, newStage);
            return arr.map((s, idx) => ({ ...s, step: idx + 1 }));
        });
    };

    const updateStageName = (id: string, name: string) => {
        setWorkflow(prev => prev.map(s => s.id === id ? { ...s, name } : s));
    };

    const deleteStage = (id: string) => {
        setWorkflow(prev => {
            // La etapa de evaluación no se puede eliminar
            const target = prev.find(s => s.id === id);
            if (target?.is_evaluation) return prev;
            const filtered = prev.filter(s => s.id !== id);
            return filtered.map((s, idx) => ({ ...s, step: idx + 1 }));
        });
    };

    const addRequirement = (stageId: string, type: 'development' | 'validation', documentInfo: { name: string; code: string }) => {
        if (!documentInfo.name.trim()) return;
        setWorkflow(prev => prev.map(s => {
            if (s.id === stageId) {
                return {
                    ...s,
                    required_docs: {
                        ...s.required_docs,
                        [type]: [...s.required_docs[type], documentInfo]
                    }
                };
            }
            return s;
        }));
    };

    const removeRequirement = (stageId: string, type: 'development' | 'validation', docIndex: number) => {
        setWorkflow(prev => prev.map(s => {
            if (s.id === stageId) {
                const updatedList = [...s.required_docs[type]];
                updatedList.splice(docIndex, 1);
                return {
                    ...s,
                    required_docs: {
                        ...s.required_docs,
                        [type]: updatedList
                    }
                };
            }
            return s;
        }));
    };

    const initializeWorkflow = (schema: WorkflowStage[]) => {
        setWorkflow(schema);
    };

    const reorderStage = (oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex) return;
        setWorkflow(prev => {
            // No mover la etapa de evaluación ni mover hacia su posición
            const evalIdx = prev.findIndex(s => s.is_evaluation);
            if (prev[oldIndex]?.is_evaluation) return prev;     // No mover la evaluación
            if (evalIdx !== -1 && newIndex >= evalIdx) return prev; // No moverse hasta la posición evaluación
            const arr = [...prev];
            const [item] = arr.splice(oldIndex, 1);
            arr.splice(newIndex, 0, item);
            return arr.map((s, idx) => ({ ...s, step: idx + 1 }));
        });
    };

    const reorderRequirement = (stageId: string, type: 'development' | 'validation', oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex) return;
        setWorkflow(prev => prev.map(s => {
            if (s.id === stageId) {
                const arr = [...s.required_docs[type]];
                const [item] = arr.splice(oldIndex, 1);
                arr.splice(newIndex, 0, item);
                return {
                    ...s,
                    required_docs: {
                        ...s.required_docs,
                        [type]: arr
                    }
                };
            }
            return s;
        }));
    };

    return {
        workflow,
        initializeWorkflow,
        addStage,
        updateStageName,
        deleteStage,
        addRequirement,
        removeRequirement,
        reorderStage,
        reorderRequirement
    };
}
