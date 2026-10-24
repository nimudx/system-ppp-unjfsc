import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import AppLogoIcon from '@/shared/components/app-logo-icon';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Field, WorkflowErrors } from '../components/student-workflow';
import { workflow, type Invitation } from '../services/company-workflow';

export default function CompanyActivation() {
    const { url, props } = usePage();
    const token =
        new URLSearchParams(url.split('?')[1] ?? '').get('token') ?? '';
    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [error, setError] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const loggedIn = !!(props.auth as { user?: unknown } | undefined)?.user;
    useEffect(() => {
        const controller = new AbortController();
        if (!/^[a-zA-Z0-9]{64}$/.test(token)) {
            Promise.resolve().then(() => {
                if (!controller.signal.aborted) {
                    setError(
                        'El enlace de invitación es inválido o está incompleto.',
                    );
                    setLoading(false);
                }
            });
        } else {
            workflow
                .invitation(token, controller.signal)
                .then((result) => {
                    setInvitation(result.data);
                    setError(null);
                })
                .catch((cause) => {
                    if (!controller.signal.aborted) setError(cause);
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        }
        return () => controller.abort();
    }, [token]);
    const activate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        setBusy(true);
        setError(null);
        try {
            const result = await workflow.activate(token, {
                ...data,
                terms_accepted: data.terms_accepted === 'on',
            });
            // A full navigation refreshes shared auth props and the regenerated CSRF token.
            window.location.assign(result.next_url);
        } catch (cause) {
            setError(cause);
            setBusy(false);
        }
    };
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 p-4">
            <Head title="Activar cuenta de empresa">
                <meta name="referrer" content="no-referrer" />
            </Head>
            <AppLogoIcon className="size-12 fill-current" />
            <section className="w-full max-w-2xl space-y-5 rounded-xl border bg-card p-6">
                <h1 className="text-xl font-semibold">
                    Activa la cuenta de tu empresa
                </h1>
                <p className="text-sm text-muted-foreground">
                    La Universidad Nacional José Faustino Sánchez Carrión te
                    invita a participar en su programa de prácticas.
                </p>
                {loading && <p role="status">Verificando invitación…</p>}
                <WorkflowErrors error={error} />
                {!loading && invitation && (
                    <>
                        <div className="grid gap-3 rounded-lg bg-muted p-4 text-sm sm:grid-cols-2">
                            <p>
                                <strong>Empresa:</strong>{' '}
                                {invitation.company.razon ||
                                    invitation.company.name}
                            </p>
                            <p>
                                <strong>RUC:</strong> {invitation.company.ruc}
                            </p>
                            <p>
                                <strong>Correo:</strong>{' '}
                                {invitation.company.email}
                            </p>
                            <p>
                                <strong>Estudiante:</strong>{' '}
                                {invitation.student.name}
                            </p>
                            <p>
                                <strong>Escuela:</strong>{' '}
                                {invitation.student.school}
                            </p>
                        </div>
                        {!invitation.requires_activation ? (
                            <Button asChild>
                                <Link href="/empresa/solicitudes">
                                    Ingresar para revisar solicitudes
                                </Link>
                            </Button>
                        ) : loggedIn ? (
                            <p className="text-sm">
                                Cierra tu sesión actual antes de activar la
                                cuenta empresarial.{' '}
                                <Link
                                    className="text-primary underline"
                                    href="/logout"
                                    method="post"
                                    as="button"
                                >
                                    Cerrar sesión
                                </Link>
                            </p>
                        ) : (
                            <form onSubmit={activate} className="space-y-4">
                                <fieldset
                                    disabled={busy}
                                    className="grid gap-4 sm:grid-cols-2"
                                >
                                    <Field label="Representante">
                                        <Input
                                            name="representative_name"
                                            autoComplete="name"
                                            required
                                            maxLength={255}
                                        />
                                    </Field>
                                    <Field label="Celular">
                                        <Input
                                            name="representative_phone"
                                            type="tel"
                                            autoComplete="tel"
                                            required
                                            maxLength={30}
                                        />
                                    </Field>
                                    <Field label="Contraseña">
                                        <Input
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            minLength={8}
                                        />
                                    </Field>
                                    <Field label="Confirmar contraseña">
                                        <Input
                                            name="password_confirmation"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            minLength={8}
                                        />
                                    </Field>
                                </fieldset>
                                <label className="flex items-start gap-3 text-sm">
                                    <input
                                        name="terms_accepted"
                                        type="checkbox"
                                        required
                                        disabled={busy}
                                    />
                                    <span>{invitation.terms.text}</span>
                                </label>
                                <Button disabled={busy}>
                                    {busy ? 'Activando…' : 'Activar cuenta'}
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Activar la cuenta no acepta al estudiante.
                                    Después podrás revisar y decidir sobre su
                                    solicitud.
                                </p>
                            </form>
                        )}
                    </>
                )}
                {!loading && !invitation && (
                    <p className="text-sm">
                        Solicita al estudiante que reenvíe la invitación si el
                        enlace venció o ya fue utilizado.
                    </p>
                )}
            </section>
        </main>
    );
}
