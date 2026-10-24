// Components
import { Form, Head } from '@inertiajs/react';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import TextLink from '@/shared/components/text-link';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/ui/spinner';
import AuthLayout from '@/shared/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verifica tu correo"
            description="Confirma tu correo haciendo clic en el enlace que te acabamos de enviar."
        >
            <Head title="Verificación de correo" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    Te enviamos un nuevo enlace de verificación al correo que
                    registraste.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            Reenviar correo de verificación
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            Cerrar sesión
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
