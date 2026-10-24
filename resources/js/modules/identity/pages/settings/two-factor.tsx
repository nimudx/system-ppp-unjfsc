import { Form, Head } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import TwoFactorRecoveryCodes from '@/modules/identity/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/modules/identity/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/modules/identity/hooks/use-two-factor-auth';
import { disable, enable, show } from '@/routes/two-factor';
import Heading from '@/shared/components/heading';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import AppLayout from '@/shared/layouts/app-layout';
import SettingsLayout from '@/shared/layouts/settings/layout';
import type { BreadcrumbItem } from '@/shared/types';

type Props = {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Verificación en dos pasos',
        href: show.url(),
    },
];

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Verificación en dos pasos" />

            <h1 className="sr-only">
                Configuración de verificación en dos pasos
            </h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Verificación en dos pasos"
                        description="Administra la verificación en dos pasos de tu cuenta"
                    />
                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge variant="default">Activada</Badge>
                            <p className="text-muted-foreground">
                                Con la verificación en dos pasos activada, al
                                iniciar sesión se te pedirá un código seguro que
                                obtienes desde una aplicación de autenticación
                                (TOTP) en tu celular.
                            </p>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />

                            <div className="relative inline">
                                <Form {...disable.form()}>
                                    {({ processing }) => (
                                        <Button
                                            variant="destructive"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <ShieldBan /> Desactivar
                                            verificación
                                        </Button>
                                    )}
                                </Form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge variant="destructive">Desactivada</Badge>
                            <p className="text-muted-foreground">
                                Si activas la verificación en dos pasos, al
                                iniciar sesión se te pedirá un código seguro que
                                obtienes desde una aplicación de autenticación
                                (TOTP) en tu celular.
                            </p>

                            <div>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                    >
                                        <ShieldCheck />
                                        Continuar configuración
                                    </Button>
                                ) : (
                                    <Form
                                        {...enable.form()}
                                        onSuccess={() =>
                                            setShowSetupModal(true)
                                        }
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                <ShieldCheck />
                                                Activar verificación
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
