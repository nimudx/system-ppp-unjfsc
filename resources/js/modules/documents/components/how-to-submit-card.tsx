import { CircleAlert, Download } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';

export interface HowToSubmitStep {
    title: string;
    description: string;
}

interface HowToSubmitCardProps {
    steps: HowToSubmitStep[];
    /** Nota final bajo la lista de pasos. */
    note: string;
    title?: string;
    /** Muestra el botón de descarga en el primer paso. */
    hasTemplate?: boolean;
    elevated?: boolean;
}

/**
 * Guía de entrega: pasos numerados + nota de advertencia.
 * Cada pantalla aporta sus propios textos.
 */
export default function HowToSubmitCard({
    steps,
    note,
    title = 'Subir tu documento correctamente',
    hasTemplate = false,
    elevated = false,
}: HowToSubmitCardProps) {
    return (
        <SectionCard elevated={elevated}>
            <SectionCard.Header>
                <div className="flex h-9 items-center">
                    <h3 className="text-sm leading-none font-semibold tracking-tight">
                        {title}
                    </h3>
                </div>
            </SectionCard.Header>

            <SectionCard.Body>
                <ol className="space-y-3">
                    {steps.map((step, index) => (
                        <li key={step.title} className="flex gap-3">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums">
                                {index + 1}
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium">
                                    {step.title}
                                </p>
                                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                    {step.description}
                                </p>

                                {index === 0 && hasTemplate && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 w-full"
                                    >
                                        <Download />
                                        Descargar formato
                                    </Button>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>

                <div className="mt-4 flex items-start gap-2 border-t pt-3">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />

                    <p className="text-xs leading-relaxed text-muted-foreground">
                        {note}
                    </p>
                </div>
            </SectionCard.Body>
        </SectionCard>
    );
}
