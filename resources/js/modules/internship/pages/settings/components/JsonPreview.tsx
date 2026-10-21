import { Code2 } from "lucide-react";
import { WorkflowStage } from "../types";

interface JsonPreviewProps {
    workflow: WorkflowStage[];
}

export function JsonPreview({ workflow }: JsonPreviewProps) {
    return (
        <div className="bg-slate-950 border border-slate-800 rounded-lg shadow-sm p-4 text-xs font-mono text-slate-300 overflow-hidden">
            <div className="flex justify-between items-center mb-2 text-slate-500 uppercase tracking-widest text-[10px]">
                <span>Configuración actual (JSON)</span>
                <Code2 className="w-3 h-3" />
            </div>
            <pre className="max-h-[300px] overflow-auto custom-scrollbar">
                {JSON.stringify(workflow, null, 2)}
            </pre>
        </div>
    );
}
