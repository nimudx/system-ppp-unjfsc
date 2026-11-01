import { router } from '@inertiajs/react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { PlacementRecord } from '@/modules/internship/types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    stateLabels,
    workflow,
    WorkflowError,
    type CompanyRequest,
    type Lookup,
} from '../services/company-workflow';

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
            className="space-y-2 rounded-lg border border-destructive p-3 text-sm text-destructive"
        >
            <p>{message}</p>
            {details.length > 1 && (
                <ul className="list-disc pl-4">
                    {details.map(([key, values]) => (
                        <li key={key}>{values.join(' ')}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function CompanySubmission({
    current,
    onSaved,
}: {
    current: CompanyRequest | null;
    onSaved: () => Promise<void>;
}) {
    const [ruc, setRuc] = useState(current?.ruc ?? '');
    const [lookup, setLookup] = useState<Lookup | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [checked, setChecked] = useState(false);
    const verify = async (event: FormEvent) => {
        event.preventDefault();
        setBusy(true);
        setError(null);
        setLookup(null);
        setChecked(false);
        try {
            setLookup(await workflow.lookup(ruc));
        } catch (cause) {
            setError(cause);
        } finally {
            setBusy(false);
        }
    };
    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!lookup || !checked) return;
        const data = lookup.found
            ? new FormData()
            : new FormData(event.currentTarget);
        data.set('ruc', ruc);
        data.set('declaration_accepted', '1');
        setBusy(true);
        setError(null);
        try {
            await workflow.submit(data, current?.id);
            toast.success(
                lookup.found
                    ? 'Confirmación enviada a la empresa.'
                    : 'Solicitud enviada al docente titular.',
            );
            await onSaved();
        } catch (cause) {
            setError(cause);
        } finally {
            setBusy(false);
        }
    };
    const company =
        lookup?.company ?? (current?.ruc === ruc ? current.company_data : null);
    return (
        <section className="space-y-5">
            <h3 className="font-semibold">
                1. Consulta y solicitud de empresa
            </h3>
            <form onSubmit={verify} className="flex items-end gap-3">
                <div className="flex-1">
                    <Field label="RUC de la empresa">
                        <Input
                            value={ruc}
                            onChange={(e) => {
                                setRuc(e.target.value);
                                setLookup(null);
                                setChecked(false);
                            }}
                            required
                            pattern="[0-9]{11}"
                            maxLength={11}
                            inputMode="numeric"
                            disabled={busy}
                        />
                    </Field>
                </div>
                <Button disabled={busy}>
                    {busy ? 'Consultando…' : 'Verificar RUC'}
                </Button>
            </form>
            <WorkflowErrors error={error} />
            {lookup && (
                <form onSubmit={submit} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {lookup.found
                            ? 'Empresa registrada. Sus datos se cargaron del catálogo; la empresa debe confirmar tu participación.'
                            : 'Empresa nueva. Completa los datos para que el docente titular revise su incorporación.'}
                    </p>
                    <fieldset
                        disabled={busy}
                        className="grid gap-4 sm:grid-cols-2"
                        key={`${ruc}-${lookup.found}`}
                    >
                        {(
                            [
                                ['name', 'Nombre comercial', 'text'],
                                ['razon', 'Razón social', 'text'],
                                ['address', 'Dirección fiscal', 'text'],
                                ['phone', 'Teléfono corporativo', 'tel'],
                                ['email', 'Correo de la empresa', 'email'],
                            ] as const
                        ).map(([name, label, type]) => (
                            <Field key={name} label={label}>
                                <Input
                                    name={name}
                                    type={type}
                                    defaultValue={company?.[name] ?? ''}
                                    readOnly={lookup.found}
                                    required={!lookup.found && name !== 'razon'}
                                    maxLength={name === 'phone' ? 30 : 255}
                                />
                            </Field>
                        ))}
                        {!lookup.found && (
                            <Field label="Ficha RUC (PDF opcional, hasta 5 MB)">
                                <Input
                                    type="file"
                                    name="ruc_document"
                                    accept="application/pdf,.pdf"
                                />
                            </Field>
                        )}
                    </fieldset>
                    <label className="flex items-start gap-3 text-sm">
                        <input
                            type="checkbox"
                            required
                            checked={checked}
                            disabled={busy}
                            onChange={(e) => setChecked(e.target.checked)}
                        />
                        <span>{lookup.declaration.text}</span>
                    </label>
                    <Button disabled={busy || !checked}>
                        {busy
                            ? 'Enviando…'
                            : lookup.found
                              ? 'Enviar confirmación a la empresa'
                              : 'Enviar solicitud al docente titular'}
                    </Button>
                </form>
            )}
        </section>
    );
}

function PracticeForm({
    current,
    placement,
    type,
    origin,
    onSaved,
}: {
    current: CompanyRequest;
    placement: PlacementRecord | null;
    type: string;
    origin: string;
    onSaved: () => Promise<void>;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [checked, setChecked] = useState(false);
    const locked = placement?.approval_status === 1;
    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!checked || !current.can_register_practice || !current.company_id)
            return;
        const values = Object.fromEntries(new FormData(event.currentTarget));
        setBusy(true);
        setError(null);
        try {
            await workflow.placement({
                company: { id: current.company_id },
                internship_type: type,
                origin_type: origin,
                practice_declaration_accepted: true,
                placement: values,
            });
            toast.success(
                'Jefe inmediato y datos de práctica guardados. Documentación habilitada.',
            );
            await onSaved();
            router.reload();
        } catch (cause) {
            setError(cause);
        } finally {
            setBusy(false);
        }
    };
    const date = (value?: string) => value?.slice(0, 10) ?? '';
    return (
        <form onSubmit={save} className="space-y-5">
            <h3 className="font-semibold">
                3. Jefe inmediato y datos de la práctica
            </h3>
            {locked && (
                <p className="text-sm text-muted-foreground">
                    La formalización fue aprobada y sus datos están bloqueados
                    para edición.
                </p>
            )}
            <WorkflowErrors error={error} />
            <fieldset disabled={busy || locked} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    {(
                        [
                            [
                                'boss_name',
                                'Nombre completo del jefe inmediato',
                                'text',
                            ],
                            [
                                'boss_position',
                                'Cargo del jefe inmediato',
                                'text',
                            ],
                            ['boss_phone', 'Celular de contacto', 'tel'],
                            ['boss_email', 'Correo de contacto', 'email'],
                            ['area_name', 'Área de desempeño', 'text'],
                            ['position', 'Cargo a ocupar', 'text'],
                        ] as const
                    ).map(([name, label, inputType]) => (
                        <Field key={name} label={label}>
                            <Input
                                name={name}
                                type={inputType}
                                defaultValue={placement?.[name] ?? ''}
                                required
                                maxLength={name === 'boss_phone' ? 30 : 255}
                            />
                        </Field>
                    ))}
                    <Field label="Fecha estimada de inicio">
                        <Input
                            name="start_date"
                            type="date"
                            defaultValue={date(placement?.start_date)}
                            required
                        />
                    </Field>
                    <Field label="Fecha estimada de término">
                        <Input
                            name="end_date"
                            type="date"
                            defaultValue={date(placement?.end_date)}
                            required
                        />
                    </Field>
                </div>
                <Field label="Descripción de funciones">
                    <Textarea
                        name="description"
                        defaultValue={placement?.description ?? ''}
                        maxLength={1000}
                    />
                </Field>
                <label className="flex items-start gap-3 text-sm">
                    <input
                        type="checkbox"
                        required
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                    />
                    <span>
                        Declaro que los datos del jefe inmediato y de la
                        práctica registrados son válidos y correctos.
                    </span>
                </label>
                <Button disabled={busy || !checked}>
                    {busy
                        ? 'Guardando…'
                        : placement
                          ? 'Guardar cambios de práctica'
                          : 'Guardar datos de práctica'}
                </Button>
            </fieldset>
        </form>
    );
}

export default function StudentWorkflow({
    current,
    loading,
    error,
    reload,
    placement,
    type,
    origin,
}: {
    current: CompanyRequest | null;
    loading: boolean;
    error: string;
    reload: () => Promise<void>;
    placement: PlacementRecord | null;
    type: string;
    origin: string;
}) {
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<unknown>(null);
    const resend = async () => {
        if (!current) return;
        setSending(true);
        setSendError(null);
        try {
            await workflow.resend(current.id);
            toast.success('Correo encolado para envío.');
            await reload();
        } catch (cause) {
            setSendError(cause);
        } finally {
            setSending(false);
        }
    };
    if (loading)
        return (
            <p role="status" className="p-4 text-sm">
                Consultando tu solicitud…
            </p>
        );
    if (error)
        return (
            <div className="space-y-3">
                <WorkflowErrors error={error} />
                <Button onClick={() => void reload()}>
                    Volver a consultar
                </Button>
            </div>
        );
    return (
        <div className="space-y-7 p-1">
            {current && (
                <section className="space-y-3 rounded-lg border bg-muted/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-semibold">
                            {stateLabels[current.state]}
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void reload()}
                        >
                            Actualizar estado
                        </Button>
                    </div>
                    <p className="text-sm">
                        {current.company?.name ?? current.company_data.name} ·
                        RUC {current.ruc}
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
                            El titular de tu escuela y semestre revisará la
                            propuesta. La invitación se enviará después de su
                            aprobación.
                        </p>
                    )}
                    {current.state === 'awaiting_company' && (
                        <>
                            <p className="text-sm">
                                2. La empresa debe activar su cuenta, si
                                corresponde, y aceptar tu participación.
                            </p>
                            <Button
                                variant="outline"
                                disabled={sending}
                                onClick={() => void resend()}
                            >
                                {sending
                                    ? 'Enviando…'
                                    : 'Reenviar correo a la empresa'}
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
                                    {new Date(event.created_at).toLocaleString(
                                        'es-PE',
                                    )}{' '}
                                    · {stateLabels[event.to_state]}
                                    {event.comment ? `: ${event.comment}` : ''}
                                </li>
                            ))}
                        </ol>
                    </details>
                </section>
            )}
            {(!current || current.can_resubmit) && (
                <CompanySubmission
                    key={`${current?.id ?? 'new'}-${current?.state ?? ''}`}
                    current={current}
                    onSaved={reload}
                />
            )}
            {current?.can_register_practice ? (
                <PracticeForm
                    key={placement?.id ?? 'new'}
                    current={current}
                    placement={placement}
                    type={type}
                    origin={origin}
                    onSaved={reload}
                />
            ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    El jefe inmediato, los datos de práctica y la carga de
                    archivos se habilitarán cuando la empresa acepte al
                    estudiante.
                </p>
            )}
            {current?.can_upload_documents && (
                <p className="text-sm text-green-700">
                    La práctica está registrada. Puedes presentar los documentos
                    del expediente y acceder a la revisión de planes e informes.
                </p>
            )}
        </div>
    );
}
