import { Code2 } from 'lucide-react';
import type { WorkflowStage } from '../types';

interface JsonPreviewProps {
    workflow: WorkflowStage[];
}

export function JsonPreview({ workflow }: JsonPreviewProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-[10px] tracking-widest text-slate-500 uppercase">
                <span>Configuración actual (JSON)</span>
                <Code2 className="h-3 w-3" />
            </div>
            <pre className="custom-scrollbar max-h-[300px] overflow-auto">
                {JSON.stringify(workflow, null, 2)}
            </pre>
        </div>
    );
}
