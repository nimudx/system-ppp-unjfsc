import { ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import EmptyState from '@/shared/components/empty-state';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    stateLabels,
    workflow,
    type CompanyRequest,
    type RequestState,
} from '../services/company-workflow';
import { Field, WorkflowErrors } from './student-workflow';

const readRequestId = () => {
    if (typeof window === 'undefined') return null;
    const id = Number(new URLSearchParams(window.location.search).get('request'));
    return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const stateTone = (state: string) => {
    if (state.includes('reject'))
        return 'bg-red-500/10 text-red-700 ring-red-500/25 dark:text-red-400';
    if (state.includes('observ'))
        return 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-400';
    if (state.includes('accept') || state.includes('approv'))
        return 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400';
    if (state.includes('pending') || state.includes('awaiting'))
        return 'bg-sky-500/10 text-sky-700 ring-sky-500/25 dark:text-sky-400';
    return 'bg-muted text-muted-foreground ring-border';
};

function StateBadge({ state }: { state: RequestState }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset transition-colors duration-300 ${stateTone(state)}`}
        >
            {stateLabels[state]}
        </span>
    );
}

function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-md bg-muted motion-reduce:animate-none ${className}`}
        />
    );
}

export default function RequestManagement({
    actor,
}: {
    actor: 'teacher' | 'company';
}) {
    const [initialId] = useState(readRequestId);
    const [items, setItems] = useState<CompanyRequest[]>([]);
    const [state, setState] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [listRevision, setListRevision] = useState(0);

    const [selectedId, setSelectedId] = useState<number | null>(initialId);
    const [selected, setSelected] = useState<CompanyRequest | null>(null);
    const [detailLoading, setDetailLoading] = useState(initialId !== null);
    const [detailError, setDetailError] = useState<unknown>(null);
    const [detailRevision, setDetailRevision] = useState(0);
    const [comment, setComment] = useState('');
    const [busy, setBusy] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const load = useCallback(
        async (signal: AbortSignal) => {
            setLoading(true);
            setError(null);
            try {
                const query = new URLSearchParams({
                    page: String(page),
                    per_page: '15',
                    ...(state ? { state } : {}),
                });
                const result = await workflow.list(query.toString(), signal);
                setItems(result.data);
                setLastPage(result.meta.last_page);
            } catch (cause) {
                if (!signal.aborted) setError(cause);
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                    setLoaded(true);
                }
            }
        },
        [page, state],
    );
    useEffect(() => {
        const controller = new AbortController();
        void load(controller.signal);
        return () => controller.abort();
    }, [load, listRevision]);

    useEffect(() => {
        if (!selectedId) return;
        let cancelled = false;
        workflow
            .show(selectedId)
            .then((result) => {
                if (cancelled) return;
                setSelected(result.data);
                setComment('');
            })
            .catch((cause) => {
                if (cancelled) return;
                setSelected(null);
                setDetailError(cause);
            })
            .finally(() => {
                if (!cancelled) setDetailLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [selectedId, detailRevision]);

    useEffect(() => {
        const url = new URL(window.location.href);
        if (selectedId) url.searchParams.set('request', String(selectedId));
        else url.searchParams.delete('request');
        window.history.replaceState(window.history.state, '', url);
    }, [selectedId]);

    const open = selectedId !== null;

    const closeRequest = useCallback(() => {
        setSelectedId(null);
        setDetailError(null);
    }, []);

    // Esc cierra el detalle (si no se está registrando una decisión)
    useEffect(() => {
        if (!open || busy) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeRequest();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, busy, closeRequest]);

    const openRequest = (id: number) => {
        if (id !== selectedId) {
            setDetailError(null);
            setDetailLoading(true);
            setSelectedId(id);
        }
        // En móvil el detalle reemplaza la lista: volvemos al inicio del panel.
        if (window.matchMedia('(max-width: 1023px)').matches) {
            requestAnimationFrame(() =>
                panelRef.current?.scrollIntoView({ block: 'start' }),
            );
        }
    };

    const decide = async (decision: string) => {
        if (!selected) return;
        if (
            (decision === 'observe' || decision === 'reject') &&
            !comment.trim()
        ) {
            setDetailError('Escribe el motivo de la observación o rechazo.');
            return;
        }
        setBusy(true);
        setDetailError(null);
        try {
            const result =
                actor === 'teacher'
                    ? await workflow.review(selected.id, decision, comment.trim())
                    : await workflow.decide(selected.id, decision, comment.trim());
            setSelected(result.data);
            setComment('');
            setListRevision((value) => value + 1);
            toast.success('Decisión registrada correctamente.');
        } catch (cause) {
            setDetailError(cause);
        } finally {
            setBusy(false);
        }
    };

    const showingStale = detailLoading && selected && selected.id !== selectedId;
    const data = selected ? (selected.company ?? selected.company_data) : null;
    const actionable =
        selected &&
        !detailLoading &&
        (actor === 'teacher'
            ? selected.state === 'pending_review'
            : selected.state === 'awaiting_company');
    const firstLoad = loading && !loaded;
    const refreshing = loading && loaded;

    return (
        <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">
                        {actor === 'teacher'
                            ? 'Solicitudes de incorporación de empresas'
                            : 'Solicitudes de estudiantes'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {actor === 'teacher'
                            ? 'Revisa las solicitudes de tu escuela y semestre.'
                            : 'Confirma expresamente si aceptas al estudiante para realizar sus prácticas.'}
                    </p>
                </div>
                <div className="flex items-end gap-2">
                    <Field label="Estado">
                        <select
                            className="h-9 rounded-md border bg-background px-3 transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            value={state}
                            disabled={busy}
                            onChange={(e) => {
                                setState(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">Todos</option>
                            {Object.entries(stateLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Button
                        variant="outline"
                        disabled={loading || busy}
                        onClick={() => setListRevision((value) => value + 1)}
                    >
                        {refreshing ? 'Actualizando…' : 'Actualizar'}
                    </Button>
                </div>
            </div>

            <WorkflowErrors error={error} />

            {/* Master / detalle: lista a la izquierda, detalle al costado (lg+).
                En móvil el detalle reemplaza la lista y se vuelve con "Volver". */}
            <div
                className={`grid grid-cols-1 items-start transition-[grid-template-columns,column-gap] duration-300 ease-out motion-reduce:transition-none lg:gap-x-0 ${open ? 'lg:grid-cols-[2fr_3fr] lg:gap-x-5' : 'lg:grid-cols-[1fr_0fr]'}`}
            >
                {/* MASTER */}
                <div className={`min-w-0 space-y-3 ${open ? 'max-lg:hidden' : ''}`}>
                    {(!error || items.length > 0) && (
                        <>
                            <div
                                className="relative overflow-x-auto rounded-lg border"
                                aria-busy={loading}
                            >
                                <div
                                    className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-primary transition-opacity duration-300 ${refreshing ? 'animate-pulse opacity-100' : 'opacity-0'}`}
                                />
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-3">Empresa / RUC</th>
                                            {!open && <th className="p-3">Estudiante</th>}
                                            <th className="p-3">Estado</th>
                                            <th className="w-10 p-3">
                                                <span className="sr-only">Ver solicitud</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody
                                        className={`transition-opacity duration-200 ${refreshing ? 'opacity-60' : 'opacity-100'}`}
                                    >
                                        {firstLoad ? (
                                            Array.from({ length: 5 }, (_, i) => (
                                                <tr key={i} className="border-t">
                                                    <td className="p-3">
                                                        <Skeleton className="h-4 w-40" />
                                                        <Skeleton className="mt-2 h-3 w-24" />
                                                    </td>
                                                    {!open && (
                                                        <td className="p-3">
                                                            <Skeleton className="h-4 w-32" />
                                                            <Skeleton className="mt-2 h-3 w-20" />
                                                        </td>
                                                    )}
                                                    <td className="p-3">
                                                        <Skeleton className="h-5 w-24 rounded-full" />
                                                    </td>
                                                    <td className="p-3" />
                                                </tr>
                                            ))
                                        ) : items.length ? (
                                            items.map((item) => {
                                                const isSelected = item.id === selectedId;
                                                return (
                                                    <tr
                                                        key={item.id}
                                                        onClick={() => openRequest(item.id)}
                                                        className={`group cursor-pointer border-t transition-colors duration-200 hover:bg-muted/40 ${isSelected ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                                                    >
                                                        <td className="p-3">
                                                            <span className="font-medium">
                                                                {item.company?.name ??
                                                                    item.company_data.name}
                                                            </span>
                                                            <p className="text-muted-foreground">
                                                                {item.ruc}
                                                            </p>
                                                            {open && (
                                                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                                                    {item.student.name}
                                                                </p>
                                                            )}
                                                        </td>
                                                        {!open && (
                                                            <td className="p-3">
                                                                {item.student.name}
                                                                <p className="text-muted-foreground">
                                                                    {item.student.school} ·{' '}
                                                                    {item.student.semester}
                                                                </p>
                                                            </td>
                                                        )}
                                                        <td className="p-3">
                                                            <StateBadge state={item.state} />
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled={busy}
                                                                aria-label={`Ver solicitud #${item.id}`}
                                                                aria-pressed={isSelected}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openRequest(item.id);
                                                                }}
                                                            >
                                                                <ChevronRight
                                                                    className={`size-4 transition-transform duration-300 ${isSelected ? 'rotate-180 text-primary' : 'text-muted-foreground group-hover:translate-x-0.5'}`}
                                                                />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-6 text-center">
                                                    <EmptyState title="No hay solicitudes para este estado." />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    variant="outline"
                                    disabled={page <= 1 || busy || loading}
                                    onClick={() => setPage((value) => value - 1)}
                                >
                                    Anterior
                                </Button>
                                <span className="text-sm tabular-nums">
                                    Página {page} de {lastPage}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={page >= lastPage || busy || loading}
                                    onClick={() => setPage((value) => value + 1)}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* DETALLE: siempre montado; el ancho se anima, el contenido no se re-acomoda */}
                <div
                    ref={panelRef}
                    aria-live="polite"
                    className={`min-w-0 overflow-hidden transition-[opacity,visibility] duration-300 motion-reduce:transition-none lg:sticky lg:top-4 ${open ? 'visible opacity-100' : 'invisible opacity-0 max-lg:hidden'}`}
                >
                    <div
                        className="flex flex-col rounded-xl border bg-card lg:max-h-[calc(100vh-2rem)] lg:min-w-[22rem]"
                        aria-busy={detailLoading}
                    >
                        <div className="flex shrink-0 items-start justify-between gap-3 border-b p-4">
                            <h3 className="flex flex-wrap items-center gap-2 font-semibold">
                                Solicitud #{selected?.id ?? selectedId ?? ''}
                                {selected && <StateBadge state={selected.state} />}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={busy}
                                onClick={closeRequest}
                            >
                                <span className="lg:hidden">Volver a la lista</span>
                                <span className="max-lg:hidden">Cerrar</span>
                            </Button>
                        </div>

                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                            <WorkflowErrors error={detailError} />

                            {detailError != null && !selected && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setDetailError(null);
                                        setDetailLoading(true);
                                        setDetailRevision((value) => value + 1);
                                    }}
                                >
                                    Reintentar
                                </Button>
                            )}

                            {!selected && detailLoading && (
                                <div role="status" className="grid gap-3 sm:grid-cols-2">
                                    <span className="sr-only">Cargando solicitud…</span>
                                    {Array.from({ length: 8 }, (_, i) => (
                                        <div key={i}>
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="mt-2 h-4 w-3/4" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selected && data && (
                                <div
                                    className={`space-y-4 transition-opacity duration-200 ${showingStale ? 'pointer-events-none opacity-50' : 'opacity-100'}`}
                                >
                                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                        {Object.entries({
                                            Empresa: data.name,
                                            'Razón social': data.razon,
                                            RUC: selected.ruc,
                                            Dirección: data.address,
                                            Correo: data.email,
                                            Teléfono: data.phone,
                                            Estudiante: selected.student.name,
                                            'Escuela / semestre': `${selected.student.school} / ${selected.student.semester ?? ''}`,
                                        }).map(([label, value]) => (
                                            <div key={label}>
                                                <dt className="font-medium">{label}</dt>
                                                <dd className="break-words text-muted-foreground">
                                                    {value || '—'}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                    {selected.ruc_document_url && (
                                        <a
                                            className="text-sm text-primary underline"
                                            href={selected.ruc_document_url}
                                        >
                                            Descargar ficha RUC (PDF)
                                        </a>
                                    )}
                                    {actor === 'teacher' && (
                                        <p className="text-sm">
                                            Verifica la existencia y los datos de la empresa
                                            antes de aprobar. La consulta por RUC del sistema
                                            solo comprueba el catálogo local.
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Declaración del estudiante: {selected.declaration.text}
                                    </p>
                                    {selected.review_comment && (
                                        <p className="text-sm">
                                            <strong>Titular:</strong> {selected.review_comment}
                                        </p>
                                    )}
                                    {selected.company_comment && (
                                        <p className="text-sm">
                                            <strong>Empresa:</strong> {selected.company_comment}
                                        </p>
                                    )}
                                    <details className="text-sm">
                                        <summary className="cursor-pointer select-none">
                                            Historial
                                        </summary>
                                        <ol className="mt-2 space-y-2 border-l pl-4">
                                            {selected.history.map((event) => (
                                                <li key={event.id}>
                                                    {new Date(event.created_at).toLocaleString(
                                                        'es-PE',
                                                    )}{' '}
                                                    · {stateLabels[event.to_state as RequestState]}
                                                    {event.comment && `: ${event.comment}`}
                                                </li>
                                            ))}
                                        </ol>
                                    </details>
                                </div>
                            )}
                        </div>

                        {/* Acciones siempre visibles, aunque el contenido sea largo */}
                        {actionable && (
                            <div className="shrink-0 space-y-3 border-t bg-card p-4">
                                <Field label="Comentario (obligatorio para observar o rechazar)">
                                    <Textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        disabled={busy}
                                        maxLength={2000}
                                        rows={3}
                                    />
                                </Field>
                                <p className="-mt-1 text-right text-xs tabular-nums text-muted-foreground">
                                    {comment.length}/2000
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        disabled={busy}
                                        onClick={() =>
                                            void decide(actor === 'teacher' ? 'approve' : 'accept')
                                        }
                                    >
                                        {busy
                                            ? 'Registrando…'
                                            : actor === 'teacher'
                                              ? 'Aprobar empresa y enviar invitación'
                                              : 'Aceptar estudiante'}
                                    </Button>
                                    {actor === 'teacher' && (
                                        <Button
                                            variant="outline"
                                            disabled={busy}
                                            onClick={() => void decide('observe')}
                                        >
                                            Observar
                                        </Button>
                                    )}
                                    <Button
                                        variant="destructive"
                                        disabled={busy}
                                        onClick={() => void decide('reject')}
                                    >
                                        {actor === 'teacher'
                                            ? 'Rechazar solicitud'
                                            : 'Rechazar estudiante'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}