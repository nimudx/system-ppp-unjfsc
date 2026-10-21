import { GraduationCap } from 'lucide-react';

import type { InternshipRecord } from '@/modules/internship/types';

interface EvaluationViewProps {
    internship: InternshipRecord | null;
}

export function EvaluationView({ internship }: EvaluationViewProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-amber-100">
                <GraduationCap className="size-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-amber-900">
                Etapa de Evaluación Final
            </h2>
            <p className="max-w-md text-sm text-amber-700">
                Has completado todas las etapas documentales. Tu docente
                registrará la calificación final de tus prácticas en breve.
            </p>
            {internship?.grade && (
                <div className="mt-4 rounded-lg border border-amber-300 bg-amber-100 px-8 py-4">
                    <p className="mb-1 text-xs font-bold tracking-widest text-amber-700 uppercase">
                        Calificación
                    </p>
                    <p className="text-4xl font-black text-amber-900">
                        {internship.grade}
                    </p>
                </div>
            )}
        </div>
    );
}
