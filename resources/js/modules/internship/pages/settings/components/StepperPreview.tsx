import { FileText, Eye } from "lucide-react";
import { WorkflowStage } from "../types";

interface StepperPreviewProps {
    workflow: WorkflowStage[];
}

export function StepperPreview({ workflow }: StepperPreviewProps) {
    return (
        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-semibold mb-6 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa Estudiante
            </h3>

            <div className="flex flex-col gap-8">
                {workflow.map((step, index) => {
                    const isActive = index === 0;

                    return (
                        <div key={step.id} className="flex gap-4 group cursor-default">
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-slate-200 bg-white text-slate-400'}`}>
                                    {step.step}
                                </div>
                                {index !== workflow.length - 1 && (
                                    <div className="w-0.5 h-full bg-slate-100 my-1"></div>
                                )}
                            </div>

                            <div className="flex-1 pb-6">
                                <h4 className={`font-semibold text-sm ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {step.name}
                                </h4>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {step.required_docs.development.length === 0 ? (
                                        <span className="text-[10px] text-slate-400 italic">Sin requisitos</span>
                                    ) : (
                                        step.required_docs.development.map((d: any, dIdx) => (
                                            <div key={dIdx} className="flex items-center text-xs text-slate-500 bg-white border rounded px-2 py-1 shadow-sm">
                                                <FileText className="w-3 h-3 mr-1 text-slate-400" />
                                                {d.name}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
