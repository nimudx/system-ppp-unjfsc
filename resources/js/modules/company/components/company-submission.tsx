import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Field, WorkflowErrors } from '@/shared/components/workflow-ui';

import {
    workflow,
    type CompanyRequest,
    type Lookup,
} from '../services/company-workflow';

export default function CompanySubmission({
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
        <Card>
            <CardHeader className="border-b">
                <CardTitle>1. Datos de la empresa</CardTitle>
                <CardDescription>
                    Verifica el RUC y registra la empresa donde realizarás tus
                    prácticas pre-profesionales.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
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
                                        required={
                                            !lookup.found && name !== 'razon'
                                        }
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
            </CardContent>
        </Card>
    );
}
