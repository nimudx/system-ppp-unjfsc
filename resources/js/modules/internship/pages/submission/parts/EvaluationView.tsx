import { GraduationCap } from "lucide-react";

interface EvaluationViewProps {
    internship: any;
}

export function EvaluationView({ internship }: EvaluationViewProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 p-16 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/30 text-center">
            <div className="size-16 rounded-full bg-amber-100 flex items-center justify-center">
                <GraduationCap className="size-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-amber-900">Etapa de Evaluación Final</h2>
            <p className="text-sm text-amber-700 max-w-md">
                Has completado todas las etapas documentales. Tu docente registrará
                la calificación final de tus prácticas en breve.
            </p>
            {internship?.grade && (
                <div className="mt-4 px-8 py-4 bg-amber-100 rounded-lg border border-amber-300">
                    <p className="text-xs text-amber-700 font-bold uppercase tracking-widest mb-1">Calificación</p>
                    <p className="text-4xl font-black text-amber-900">{internship.grade}</p>
                </div>
            )}
        </div>
    );
}
