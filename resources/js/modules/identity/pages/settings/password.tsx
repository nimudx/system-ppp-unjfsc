import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef, useState } from 'react';
import PasswordController from '@/actions/App/Domains/Identity/Http/Controllers/Settings/PasswordController';
import { edit } from '@/routes/user-password';
import Heading from '@/shared/components/heading';
import InputError from '@/shared/components/input-error';
import PasswordInput from '@/shared/components/password-input';
import PasswordStrength, {
    isPasswordStrong,
} from '@/shared/components/password-strength';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import AppLayout from '@/shared/layouts/app-layout';
import SettingsLayout from '@/shared/layouts/settings/layout';
import type { BreadcrumbItem } from '@/shared/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contraseña',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const mismatch = confirmation.length > 0 && confirmation !== newPassword;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contraseña" />

            <h1 className="sr-only">Configuración de contraseña</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Actualizar contraseña"
                        description="Usa una contraseña larga y difícil de adivinar para mantener tu cuenta segura"
                    />

                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onSuccess={() => {
                            setNewPassword('');
                            setConfirmation('');
                        }}
                        onError={(errors) => {
                            setNewPassword('');
                            setConfirmation('');

                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        Contraseña actual
                                    </Label>

                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        placeholder="Contraseña actual"
                                    />

                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        Nueva contraseña
                                    </Label>

                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder="Nueva contraseña"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        aria-describedby="password-rules"
                                    />

                                    <InputError message={errors.password} />

                                    <div id="password-rules">
                                        <PasswordStrength value={newPassword} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirmar contraseña
                                    </Label>

                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder="Confirmar contraseña"
                                        value={confirmation}
                                        onChange={(e) =>
                                            setConfirmation(e.target.value)
                                        }
                                        aria-invalid={mismatch || undefined}
                                    />

                                    <InputError
                                        message={
                                            errors.password_confirmation ??
                                            (mismatch
                                                ? 'Las contraseñas no coinciden.'
                                                : undefined)
                                        }
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={
                                            processing ||
                                            !isPasswordStrong(newPassword) ||
                                            confirmation !== newPassword
                                        }
                                        data-test="update-password-button"
                                    >
                                        Guardar contraseña
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Guardado
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
