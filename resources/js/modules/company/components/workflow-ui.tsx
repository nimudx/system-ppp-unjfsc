import type { LucideIcon } from 'lucide-react';
import { AlertCircle, Check, Info, Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { WorkflowError } from '../services/company-workflow';

/* -------------------------------------------------------------------------- */
/* Utilidades                                                                 */
/* -------------------------------------------------------------------------- */

// Si ya tienes `cn` (shadcn), reemplaza este helper por tu import.
export const cn = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' ');

export type StepState = 'done' | 'current' | 'attention' | 'locked';

/* -------------------------------------------------------------------------- */
/* Primitivas que ya existían (misma API)                                     */
/* -------------------------------------------------------------------------- */

export function Field({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="grid gap-2 text-sm font-medium">
            {label}
            {children}
        </label>
    );
}

export function WorkflowErrors({ error }: { error: unknown }) {
    if (!error) return null;
    const message = error instanceof Error ? error.message : String(error);
    const details =
        error instanceof WorkflowError ? Object.entries(error.errors) : [];
    return (
        <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/60 bg-destructive/5 p-3 text-sm text-destructive motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 duration-300"
        >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
                <p>{message}</p>
                {details.length > 1 && (
                    <ul className="list-disc pl-4">
                        {details.map(([key, values]) => (
                            <li key={key}>{values.join(' ')}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Nuevas primitivas                                                          */
/* -------------------------------------------------------------------------- */

export function DataItem({
    label,
    value,
    href,
}: {
    label: string;
    value?: string | null;
    href?: string;
}) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            {value && href ? (
                <a
                    href={href}
                    className="text-sm font-medium break-words text-primary hover:underline"
                >
                    {value}
                </a>
            ) : (
                <p className="text-sm font-medium break-words">
                    {value || '—'}
                </p>
            )}
        </div>
    );
}

const calloutTone = {
    info: 'border-border bg-muted/40 text-foreground',
    success:
        'border-green-200 bg-green-500/10 text-green-800 dark:border-green-900 dark:text-green-300',
    warning:
        'border-amber-200 bg-amber-500/10 text-amber-800 dark:border-amber-900 dark:text-amber-300',
} as const;

export function Callout({
    tone = 'info',
    icon: Icon = Info,
    className,
    children,
}: {
    tone?: keyof typeof calloutTone;
    icon?: LucideIcon;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'flex items-start gap-2.5 rounded-lg border p-3 text-sm',
                calloutTone[tone],
                className,
            )}
        >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}

export function ConsentCheck({
    checked,
    onChange,
    disabled,
    children,
}: {
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
    children: ReactNode;
}) {
    return (
        <label
            className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors duration-200',
                checked ? 'border-primary/40 bg-primary/5' : 'hover:bg-muted/40',
                disabled && 'cursor-not-allowed opacity-60',
            )}
        >
            <input
                type="checkbox"
                required
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <span>{children}</span>
        </label>
    );
}

/* -------------------------------------------------------------------------- */
/* Paso numerado                                                              */
/* -------------------------------------------------------------------------- */

export function StepBadge({
    index,
    state,
    pulse = false,
}: {
    index: number;
    state: StepState;
    pulse?: boolean;
}) {
    return (
        <span className="relative grid size-8 shrink-0 place-items-center">
            {pulse && state === 'current' && (
                <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-primary/30 motion-safe:animate-ping"
                />
            )}
            <span
                className={cn(
                    'relative grid size-8 place-items-center rounded-full border text-sm font-semibold transition-colors duration-500',
                    state === 'done' && 'border-green-500 bg-green-500 text-white',
                    state === 'current' &&
                        'border-primary bg-primary text-primary-foreground',
                    state === 'attention' &&
                        'border-red-500 bg-red-500 text-white',
                    state === 'locked' &&
                        'border-border bg-muted text-muted-foreground',
                )}
            >
                {state === 'done' ? (
                    <Check className="size-4 duration-300 motion-safe:animate-in motion-safe:zoom-in-50" />
                ) : state === 'attention' ? (
                    <AlertCircle className="size-4" />
                ) : state === 'locked' ? (
                    <Lock className="size-3.5" />
                ) : (
                    index
                )}
            </span>
        </span>
    );
}

export function StepCard({
    index,
    title,
    description,
    state,
    action,
    lockedHint,
    delay = 0,
    children,
}: {
    index: number;
    title: string;
    description?: string;
    state: StepState;
    action?: ReactNode;
    lockedHint?: string;
    delay?: number;
    children?: ReactNode;
}) {
    const locked = state === 'locked';
    const titleId = `step-${index}-title`;

    return (
        <section
            aria-labelledby={titleId}
            style={{ animationDelay: `${delay}ms` }}
            className={cn(
                'rounded-xl border bg-card transition-colors duration-500 motion-safe:animate-in motion-safe:fill-mode-both motion-safe:fade-in motion-safe:slide-in-from-bottom-2',
                state === 'current' && 'border-primary/40 shadow-sm',
                state === 'attention' && 'border-red-300 shadow-sm',
                locked && 'border-dashed bg-muted/20',
            )}
        >
            <header className="flex flex-wrap items-start gap-3 p-4 md:px-6 md:py-5">
                <div className="mt-0.5">
                    <StepBadge index={index} state={state} />
                </div>
                <div className="min-w-[12rem] flex-1">
                    <h3
                        id={titleId}
                        className={cn(
                            'text-base leading-tight font-semibold',
                            locked && 'text-muted-foreground',
                        )}
                    >
                        {title}
                    </h3>
                    {description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </header>

            {locked ? (
                lockedHint && (
                    <p className="px-4 pb-4 pl-[3.75rem] text-sm text-muted-foreground md:pr-6 md:pb-5 md:pl-[4.75rem]">
                        {lockedHint}
                    </p>
                )
            ) : children ? (
                <div className="space-y-5 border-t p-4 md:p-6">{children}</div>
            ) : null}
        </section>
    );
}