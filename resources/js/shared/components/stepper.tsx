import { CheckCircle2 } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/shared/lib/utils';

interface StepItem {
    id: number;
    label: string;
}

interface StepperProps {
    currentStep: number;
    steps: StepItem[];
    onStepClick?: (id: number) => void;
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
                        'border-primary bg-background text-primary',
                    status === 'pending' &&
                        'border-border bg-background text-muted-foreground',
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

export function Stepper({ currentStep, steps, onStepClick }: StepperProps) {
    return (
        <div className="flex items-center gap-2">
            {steps.map((step, i) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;

                const status: 'active' | 'completed' | 'pending' = isCompleted
                    ? 'completed'
                    : isActive
                      ? 'active'
                      : 'pending';

                const canClick = onStepClick && (isCompleted || isActive);

                return (
                    <Fragment key={step.id}>
                        {i > 0 && (
                            <StepConnector completed={currentStep >= step.id} />
                        )}

                        <div
                            onClick={() => canClick && onStepClick(step.id)}
                            className={cn(
                                'transition-all duration-200',
                                canClick
                                    ? 'cursor-pointer hover:opacity-80 active:scale-95'
                                    : 'cursor-default',
                            )}
                        >
                            <StepBadge
                                number={i + 1}
                                label={step.label}
                                status={status}
                            />
                        </div>
                    </Fragment>
                );
            })}
        </div>
    );
}
