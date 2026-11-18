import { Button } from '@/shared/components/ui/button';
import { WorkflowErrors } from '@/shared/components/workflow-ui';

import { stateLabels, type CompanyRequest } from '../services/company-workflow';

export default function RequestStatusPanel({
    current,
    onReload,
    onResend,
    sending,
    sendError,
}: {
    current: CompanyRequest;
    onReload: () => Promise<void>;
    onResend: () => Promise<void>;
    sending: boolean;
    sendError: unknown;
}) {
    return (
        <section className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">{stateLabels[current.state]}</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void onReload()}
                >
                    Actualizar estado
                </Button>
            </div>
            <p className="text-sm">
                {current.company?.name ?? current.company_data.name} · RUC{' '}
                {current.ruc}
            </p>
            {current.review_comment && (
                <p className="text-sm">
                    <strong>Revisión del titular:</strong>{' '}
                    {current.review_comment}
                </p>
            )}
            {current.company_comment && (
                <p className="text-sm">
                    <strong>Respuesta de la empresa:</strong>{' '}
                    {current.company_comment}
                </p>
            )}
            {current.state === 'pending_review' && (
                <p className="text-sm">
                    El titular de tu escuela y semestre revisará la propuesta.
                    La invitación se enviará después de su aprobación.
                </p>
            )}
            {current.state === 'awaiting_company' && (
                <>
                    <p className="text-sm">
                        La empresa debe activar su cuenta, si corresponde, y
                        aceptar tu participación.
                    </p>
                    <Button
                        variant="outline"
                        disabled={sending}
                        onClick={() => void onResend()}
                    >
                        {sending ? 'Enviando…' : 'Reenviar correo a la empresa'}
                    </Button>
                    <WorkflowErrors error={sendError} />
                </>
            )}
            {current.ruc_document_url && (
                <a
                    className="text-sm text-primary underline"
                    href={current.ruc_document_url}
                >
                    Descargar ficha RUC adjunta
                </a>
            )}
            <details className="text-sm">
                <summary className="cursor-pointer">
                    Historial de la solicitud
                </summary>
                <ol className="mt-3 space-y-2">
                    {current.history.map((event) => (
                        <li key={event.id}>
                            {new Date(event.created_at).toLocaleString('es-PE')}{' '}
                            · {stateLabels[event.to_state]}
                            {event.comment ? `: ${event.comment}` : ''}
                        </li>
                    ))}
                </ol>
            </details>
        </section>
    );
}
