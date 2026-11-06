import { useState } from 'react';
import { SectionCard } from '@/shared/components/ui/section-card';
import { stateLabels, type CompanyRequest } from '../services/company-workflow';
import { cn } from './workflow-ui';

const PREVIEW_COUNT = 3;

export function RequestHistory({
    history,
}: {
    history?: CompanyRequest['history'] | null;
}) {
    const [expanded, setExpanded] = useState(false);

    if (!history || history.length === 0) return null;

    // Más reciente primero
    const events = [...history].sort(
        (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const visible = expanded ? events : events.slice(0, PREVIEW_COUNT);

    return (
        <SectionCard>
            <SectionCard.Header
                title="Historial de la solicitud"
                description="Cambios de estado y comentarios"
            />
            <SectionCard.Body className="py-4">
                <ol className="relative ml-1.5 border-l">
                    {visible.map((event, i) => (
                        <li
                            key={event.id}
                            style={{ animationDelay: `${i * 60}ms` }}
                            className="relative pb-5 pl-5 duration-300 last:pb-0 motion-safe:animate-in motion-safe:fill-mode-both motion-safe:fade-in motion-safe:slide-in-from-left-2"
                        >
                            <span
                                aria-hidden
                                className={cn(
                                    'absolute top-1 -left-[6px] size-2.5 rounded-full ring-4 ring-card',
                                    i === 0
                                        ? 'bg-primary'
                                        : 'bg-muted-foreground/40',
                                )}
                            />
                            <p className="text-sm leading-tight font-medium">
                                {stateLabels[event.to_state]}
                            </p>
                            <time
                                dateTime={event.created_at}
                                className="text-xs text-muted-foreground"
                            >
                                {new Date(event.created_at).toLocaleString(
                                    'es-PE',
                                    { dateStyle: 'medium', timeStyle: 'short' },
                                )}
                            </time>
                            {event.comment && (
                                <p className="mt-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs">
                                    {event.comment}
                                </p>
                            )}
                        </li>
                    ))}
                </ol>

                {events.length > PREVIEW_COUNT && (
                    <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => setExpanded((v) => !v)}
                        className="mt-3 text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        {expanded ? 'Ver menos' : `Ver todo (${events.length})`}
                    </button>
                )}
            </SectionCard.Body>
        </SectionCard>
    );
}