import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    stateLabels,
    workflow,
    type CompanyRequest,
    type RequestState,
} from '../services/company-workflow';
import { Field, WorkflowErrors } from './student-workflow';

export default function RequestManagement({
    actor,
}: {
    actor: 'teacher' | 'company';
}) {
    const [items, setItems] = useState<CompanyRequest[]>([]);
    const [state, setState] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [selectedId, setSelectedId] = useState<number | null>(() => {
        const id =
            typeof window === 'undefined'
                ? 0
                : Number(
                      new URLSearchParams(window.location.search).get(
                          'request',
                      ),
                  );
        return Number.isSafeInteger(id) && id > 0 ? id : null;
    });
    const [selected, setSelected] = useState<CompanyRequest | null>(null);
    const [comment, setComment] = useState('');
    const [error, setError] = useState<unknown>(null);
    const [detailError, setDetailError] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [revision, setRevision] = useState(0);
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
                if (!signal.aborted) setLoading(false);
            }
        },
        [page, state],
    );
    useEffect(() => {
        const controller = new AbortController();
        void load(controller.signal);
        return () => controller.abort();
    }, [load, revision]);
    useEffect(() => {
        if (!selectedId) return;
        let cancelled = false;
        workflow
            .show(selectedId)
            .then((result) => {
                if (!cancelled) {
                    setSelected(result.data);
                    setComment('');
                    setDetailError(null);
                }
            })
            .catch((cause) => {
                if (!cancelled) {
                    setSelected(null);
                    setDetailError(cause);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [selectedId, revision]);
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
                    ? await workflow.review(
                          selected.id,
                          decision,
                          comment.trim(),
                      )
                    : await workflow.decide(
                          selected.id,
                          decision,
                          comment.trim(),
                      );
            setSelected(result.data);
            setComment('');
            setRevision((value) => value + 1);
            toast.success('Decisión registrada correctamente.');
        } catch (cause) {
            setDetailError(cause);
        } finally {
            setBusy(false);
        }
    };
    const actionable =
        selected &&
        (actor === 'teacher'
            ? selected.state === 'pending_review'
            : selected.state === 'awaiting_company');
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
                            className="h-9 rounded-md border bg-background px-3"
                            value={state}
                            disabled={busy}
                            onChange={(e) => {
                                setState(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">Todos</option>
                            {Object.entries(stateLabels).map(
                                ([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ),
                            )}
                        </select>
                    </Field>
                    <Button
                        variant="outline"
                        disabled={loading || busy}
                        onClick={() => setRevision((value) => value + 1)}
                    >
                        Actualizar
                    </Button>
                </div>
            </div>
            <WorkflowErrors error={error} />
            {loading ? (
                <p role="status">Cargando solicitudes…</p>
            ) : (
                !error && (
                    <>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        {[
                                            'Empresa / RUC',
                                            'Estudiante',
                                            'Estado',
                                            'Detalle',
                                        ].map((heading) => (
                                            <th className="p-3" key={heading}>
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length ? (
                                        items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-t"
                                            >
                                                <td className="p-3">
                                                    {item.company?.name ??
                                                        item.company_data.name}
                                                    <p className="text-muted-foreground">
                                                        {item.ruc}
                                                    </p>
                                                </td>
                                                <td className="p-3">
                                                    {item.student.name}
                                                    <p className="text-muted-foreground">
                                                        {item.student.school} ·{' '}
                                                        {item.student.semester}
                                                    </p>
                                                </td>
                                                <td className="p-3">
                                                    {stateLabels[item.state]}
                                                </td>
                                                <td className="p-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={busy}
                                                        onClick={() => {
                                                            setSelected(null);
                                                            setDetailError(
                                                                null,
                                                            );
                                                            setSelectedId(
                                                                item.id,
                                                            );
                                                            setRevision(
                                                                (value) =>
                                                                    value + 1,
                                                            );
                                                        }}
                                                    >
                                                        Ver solicitud
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="p-6 text-center text-muted-foreground"
                                            >
                                                No hay solicitudes para este
                                                estado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <Button
                                variant="outline"
                                disabled={page <= 1 || busy}
                                onClick={() => setPage((value) => value - 1)}
                            >
                                Anterior
                            </Button>
                            <span className="text-sm">
                                Página {page} de {lastPage}
                            </span>
                            <Button
                                variant="outline"
                                disabled={page >= lastPage || busy}
                                onClick={() => setPage((value) => value + 1)}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </>
                )
            )}
            <WorkflowErrors error={detailError} />
            {selected && (
                <div className="space-y-4 rounded-xl border p-5">
                    <h3 className="font-semibold">
                        Solicitud #{selected.id} · {stateLabels[selected.state]}
                    </h3>
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        {Object.entries({
                            Empresa: (selected.company ?? selected.company_data)
                                .name,
                            'Razón social': (
                                selected.company ?? selected.company_data
                            ).razon,
                            RUC: selected.ruc,
                            Dirección: (
                                selected.company ?? selected.company_data
                            ).address,
                            Correo: (selected.company ?? selected.company_data)
                                .email,
                            Teléfono: (
                                selected.company ?? selected.company_data
                            ).phone,
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
                    {actionable && (
                        <>
                            <Field label="Comentario (obligatorio para observar o rechazar)">
                                <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    disabled={busy}
                                    maxLength={2000}
                                />
                            </Field>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    disabled={busy}
                                    onClick={() =>
                                        void decide(
                                            actor === 'teacher'
                                                ? 'approve'
                                                : 'accept',
                                        )
                                    }
                                >
                                    {actor === 'teacher'
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
                        </>
                    )}
                    <details className="text-sm">
                        <summary className="cursor-pointer">Historial</summary>
                        <ol className="mt-2 space-y-2">
                            {selected.history.map((event) => (
                                <li key={event.id}>
                                    {new Date(event.created_at).toLocaleString(
                                        'es-PE',
                                    )}{' '}
                                    ·{' '}
                                    {
                                        stateLabels[
                                            event.to_state as RequestState
                                        ]
                                    }
                                    {event.comment && `: ${event.comment}`}
                                </li>
                            ))}
                        </ol>
                    </details>
                </div>
            )}
        </section>
    );
}
