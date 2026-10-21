import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Fragment } from "react";

interface StepItem {
    id: number;
    label: string;
}

interface StepperProps {
    currentStep: number;
    steps: StepItem[]; // Ahora es un array de objetos
}

function StepBadge({
    number,
    label,
    status,
}: {
    number: number;
    label: string;
    status: 'active' | 'completed' | 'pending';
}) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all',
                    status === 'completed' &&
                    'border-primary bg-primary text-primary-foreground',
                    status === 'active' &&
                    'border-primary text-primary bg-background',
                    status === 'pending' &&
                    'border-border text-muted-foreground bg-background',
                )}
            >
                {status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4" />
                ) : (
                    number
                )}
            </div>
            <span
                className={cn(
                    'hidden text-sm font-medium sm:block',
                    status === 'active' && 'text-foreground',
                    status !== 'active' && 'text-muted-foreground',
                )}
            >
                {label}
            </span>
        </div>
    );
}

function StepConnector({ completed }: { completed: boolean }) {
    return (
        <div
            className={cn(
                'h-px flex-1 transition-all',
                completed ? 'bg-primary' : 'bg-border',
            )}
        />
    );
}


export function Stepper({ currentStep, steps }: StepperProps) {
    return (
        <div className="flex items-center gap-2">
            {steps.map((step, i) => {
                const status: 'active' | 'completed' | 'pending' =
                    currentStep > step.id
                        ? 'completed'
                        : currentStep === step.id
                            ? 'active'
                            : 'pending';

                return (
                    <Fragment key={step.id}>
                        {i > 0 && (
                            <StepConnector
                                completed={currentStep >= step.id}
                            />
                        )}

                        <StepBadge
                            number={i + 1}
                            label={step.label}
                            status={status}
                        />
                    </Fragment>
                );
            })}
        </div>
    );
}