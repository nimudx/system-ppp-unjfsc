import { GraduationCap } from "lucide-react";
import { WorkflowStage } from "../types";

interface EvaluationCardProps {
    stage: WorkflowStage;
}

/**
 * Tarjeta especial para la etapa final de Evaluación.
 * No permite drag, no permite eliminar, no muestra columnas de documentos.
 * Siempre es la última, identificada por is_evaluation = true.
 */
export function EvaluationCard({ stage }: EvaluationCardProps) {
    return (
        <div className="relative border-2 border-dashed border-amber-300 bg-amber-50/40 rounded-lg p-5 flex items-center gap-5">
            {/* Step badge */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-700 border-2 border-amber-300 shrink-0 text-sm font-bold">
                {stage.step}
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <GraduationCap className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-800">{stage.name}</span>
                </div>
                <p className="text-xs text-amber-600/80">
                    Etapa final fija — aquí se registrará la calificación del estudiante.
                    No requiere documentos adicionales.
                </p>
            </div>

            {/* Etiqueta fija */}
            <div className="shrink-0 px-2.5 py-1 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wide">
                Evaluación Final
            </div>
        </div>
    );
}
