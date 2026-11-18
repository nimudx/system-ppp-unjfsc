import { Link, router } from '@inertiajs/react';

import { Check, Lock } from 'lucide-react';

import { useEffect, useState, type ReactNode } from 'react';

import { Button } from '@/shared/components/ui/button';

import { SectionCard } from '@/shared/components/ui/section-card';

import { cn } from '@/shared/lib/utils';

export interface GateStep {
    label: string;
    done?: boolean;
}

interface CompanyRequiredCardProps {
    /** true cuando el estudiante ya puede usar la pantalla. */
    unlocked: boolean;

    /** Mientras se consulta la solicitud de empresa. */
    loading?: boolean;

    /** Destino del botón para completar los datos en Pasantía. */
    href: string;

    description?: string;

    steps?: GateStep[];

    /** Props de Inertia a recargar al volver a la pestaña (mientras esté bloqueado). */
    refreshOn?: string[];

    /** La vista real; se muestra cuando unlocked es true. */
    children: ReactNode;
}

type Phase = 'locked' | 'unlocking' | 'open';

const UNLOCK_MS = 1000;

const DEFAULT_DESCRIPTION =
    'Primero la empresa debe aceptarte y debes registrar los datos del jefe inmediato y de la práctica en Pasantía.';

const DEFAULT_STEPS: GateStep[] = [
    { label: 'La empresa acepta tu solicitud' },
    { label: 'Guardas los datos del jefe inmediato y de la práctica' },
];

/**
 * Compuerta común de Formalización, Revisión de prácticas y Anexos.
 * Bloqueada: silueta borrosa de la vista + tarjeta centrada.
 * Al desbloquearse en vivo: el candado se abre y la vista se revela.
 */
export default function CompanyRequiredCard({
    unlocked,
    loading = false,
    href,
    description = DEFAULT_DESCRIPTION,
    steps = DEFAULT_STEPS,
    refreshOn,
    children,
}: CompanyRequiredCardProps) {
    const [phase, setPhase] = useState<Phase>(
        unlocked && !loading ? 'open' : 'locked',
    );

    const [hasSeenLocked, setHasSeenLocked] = useState(!unlocked && !loading);

    const [previousProps, setPreviousProps] = useState({
        unlocked,
        loading,
    });

    // Sincronizar el estado cuando cambian las props.
    if (
        previousProps.unlocked !== unlocked ||
        previousProps.loading !== loading
    ) {
        setPreviousProps({ unlocked, loading });

        if (!loading) {
            if (!unlocked) {
                setHasSeenLocked(true);
                setPhase('locked');
            } else {
                setPhase((currentPhase) =>
                    currentPhase === 'locked'
                        ? hasSeenLocked
                            ? 'unlocking'
                            : 'open'
                        : currentPhase,
                );
            }
        }
    }

    useEffect(() => {
        if (phase !== 'unlocking') {
            return;
        }

        const timer = window.setTimeout(() => setPhase('open'), UNLOCK_MS);

        return () => window.clearTimeout(timer);
    }, [phase]);

    // Si completó los datos en otra pestaña, al volver se recarga solo.
    const refreshKey = refreshOn?.join(',') ?? '';

    useEffect(() => {
        if (unlocked || !refreshKey) {
            return;
        }

        let last = 0;

        const refresh = () => {
            if (
                document.visibilityState !== 'visible' ||
                Date.now() - last < 5000
            ) {
                return;
            }

            last = Date.now();
            router.reload({ only: refreshKey.split(',') });
        };

        document.addEventListener('visibilitychange', refresh);
        window.addEventListener('focus', refresh);

        return () => {
            document.removeEventListener('visibilitychange', refresh);
            window.removeEventListener('focus', refresh);
        };
    }, [unlocked, refreshKey]);

    if (phase === 'open') {
        return (
            <div
                className={cn(
                    hasSeenLocked && 'motion-safe:animate-gate-reveal',
                )}
            >
                {children}
            </div>
        );
    }

    const unlocking = phase === 'unlocking';

    return (
        <div className="relative min-h-[34rem] overflow-hidden rounded-xl">
            <GhostWorkbench settled={unlocking} loading={loading} />

            {loading ? (
                <p
                    role="status"
                    className="absolute inset-0 grid place-items-center text-sm text-muted-foreground"
                >
                    Consultando tu solicitud…
                </p>
            ) : (
                <div className="absolute inset-0 grid place-items-center p-4">
                    <SectionCard
                        elevated
                        className={cn(
                            'motion-safe:animate-gate-in w-full max-w-md transition duration-300',
                            unlocking && 'scale-95 opacity-0 delay-[650ms]',
                        )}
                    >
                        <SectionCard.Body
                            role="status"
                            aria-live="polite"
                            className="space-y-5 py-8 text-center"
                        >
                            <LockBadge unlocking={unlocking} />

                            <div className="space-y-1.5">
                                <h3 className="text-base font-semibold tracking-tight">
                                    {unlocking
                                        ? 'Todo listo'
                                        : 'Aún no puedes subir documentos'}
                                </h3>

                                <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
                                    {unlocking
                                        ? 'Ya puedes entregar tus documentos.'
                                        : description}
                                </p>
                            </div>

                            {!unlocking && (
                                <>
                                    <ol className="mx-auto w-fit space-y-2 text-left">
                                        {steps.map((step) => (
                                            <li
                                                key={step.label}
                                                className="flex items-center gap-2.5 text-xs"
                                            >
                                                <span
                                                    className={cn(
                                                        'flex size-4 shrink-0 items-center justify-center rounded-full border',
                                                        step.done
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-dashed border-muted-foreground/50',
                                                    )}
                                                >
                                                    {step.done && (
                                                        <Check className="size-2.5" />
                                                    )}
                                                </span>

                                                <span
                                                    className={cn(
                                                        step.done
                                                            ? 'text-muted-foreground line-through'
                                                            : 'text-foreground',
                                                    )}
                                                >
                                                    {step.label}
                                                </span>
                                            </li>
                                        ))}
                                    </ol>

                                    <Button asChild>
                                        <Link href={href}>Ir a Pasantía</Link>
                                    </Button>
                                </>
                            )}
                        </SectionCard.Body>
                    </SectionCard>
                </div>
            )}
        </div>
    );
}

function LockBadge({ unlocking }: { unlocking: boolean }) {
    return (
        <div className="relative mx-auto flex size-14 items-center justify-center">
            {!unlocking && (
                <span className="motion-safe:animate-gate-halo absolute inset-0 rounded-full bg-primary/20" />
            )}

            <span
                className={cn(
                    'relative flex size-14 items-center justify-center rounded-full border transition-colors duration-300',
                    unlocking
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                )}
            >
                <Lock
                    className={cn(
                        'absolute size-5 transition duration-200',
                        unlocking && 'scale-50 opacity-0',
                    )}
                />

                <Check
                    className={cn(
                        'absolute size-5 transition delay-150 duration-300',
                        !unlocking && 'scale-50 opacity-0',
                    )}
                />
            </span>
        </div>
    );
}

/** Silueta de los tres paneles (lista, documento, historial) detrás de la tarjeta. */
function GhostWorkbench({
    settled,
    loading,
}: {
    settled: boolean;
    loading: boolean;
}) {
    const block = cn(
        'rounded-xl border bg-muted/40',
        loading && 'motion-safe:animate-pulse',
    );

    return (
        <div
            aria-hidden
            className={cn(
                'pointer-events-none absolute inset-0 grid gap-4 transition duration-500 lg:grid-cols-[18rem_1fr_20rem]',
                settled ? 'opacity-0 delay-[650ms]' : 'opacity-70 blur-[2px]',
            )}
        >
            <div className="hidden space-y-4 lg:block">
                <div className={cn(block, 'h-56')} />
                <div className={cn(block, 'h-40')} />
            </div>

            <div className={cn(block, 'h-full min-h-[34rem]')} />

            <div className="hidden space-y-4 lg:block">
                <div className={cn(block, 'h-40')} />
                <div className={cn(block, 'h-56')} />
            </div>
        </div>
    );
}
