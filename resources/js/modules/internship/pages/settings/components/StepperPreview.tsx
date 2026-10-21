import { FileText, Eye } from 'lucide-react';
import type { WorkflowStage } from '../types';

interface StepperPreviewProps {
    workflow: WorkflowStage[];
}

export function StepperPreview({ workflow }: StepperPreviewProps) {
    return (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-6 flex items-center text-sm font-semibold">
                <Eye className="mr-2 h-4 w-4" />
                Vista Previa Estudiante
            </h3>

            <div className="flex flex-col gap-8">
                {workflow.map((step, index) => {
                    const isActive = index === 0;

                    return (
                        <div
                            key={step.id}
                            className="group flex cursor-default gap-4"
                        >
                            <div className="flex flex-col items-center">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold ${isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-slate-200 bg-white text-slate-400'}`}
                                >
                                    {step.step}
                                </div>
                                {index !== workflow.length - 1 && (
                                    <div className="my-1 h-full w-0.5 bg-slate-100"></div>
                                )}
                            </div>

                            <div className="flex-1 pb-6">
                                <h4
                                    className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}
                                >
                                    {step.name}
                                </h4>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {step.required_docs.development.length ===
                                    0 ? (
                                        <span className="text-[10px] text-slate-400 italic">
                                            Sin requisitos
                                        </span>
                                    ) : (
                                        step.required_docs.development.map(
                                            (d, dIdx) => (
                                                <div
                                                    key={dIdx}
                                                    className="flex items-center rounded border bg-white px-2 py-1 text-xs text-slate-500 shadow-sm"
                                                >
                                                    <FileText className="mr-1 h-3 w-3 text-slate-400" />
                                                    {d.name}
                                                </div>
                                            ),
                                        )
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
