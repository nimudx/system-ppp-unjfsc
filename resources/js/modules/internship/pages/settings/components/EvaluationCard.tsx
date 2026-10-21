import { GraduationCap } from 'lucide-react';
import type { WorkflowStage } from '../types';

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
        <div className="relative flex items-center gap-5 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/40 p-5">
            {/* Step badge */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-100 text-sm font-bold text-amber-700">
                {stage.step}
            </div>

            {/* Contenido */}
            <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-800">
                        {stage.name}
                    </span>
                </div>
                <p className="text-xs text-amber-600/80">
                    Etapa final fija — aquí se registrará la calificación del
                    estudiante. No requiere documentos adicionales.
                </p>
            </div>

            {/* Etiqueta fija */}
            <div className="shrink-0 rounded-full bg-amber-200 px-2.5 py-1 text-[10px] font-bold tracking-wide text-amber-800 uppercase">
                Evaluación Final
            </div>
        </div>
    );
}
