import { Head } from '@inertiajs/react';
import { CircleAlert, KeyRound } from 'lucide-react';
import AppLogoIcon from '@/shared/components/app-logo-icon';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export default function CompanyActivation() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 p-4">
            <Head title="Activar cuenta empresarial" />
            <AppLogoIcon className="size-12 fill-current" />
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="size-5 text-primary" />
                        Activación de cuenta empresarial
                    </CardTitle>
                    <CardDescription>
                        Completa los datos que solicita el enlace de invitación
                        recibido por correo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <Alert>
                        <CircleAlert className="size-4" />
                        <AlertTitle>
                            Integración de activación pendiente
                        </AlertTitle>
                        <AlertDescription>
                            No se encontró en este backend un mecanismo
                            verificable para validar el token, comprobar su
                            expiración o activar la cuenta. Este formulario es
                            solo una vista previa: no envía ni almacena datos.
                        </AlertDescription>
                    </Alert>

                    <div className="grid gap-2 sm:grid-cols-2">
                        {[
                            [
                                'Enlace inválido',
                                'Se mostrará si el servidor no reconoce el token.',
                            ],
                            [
                                'Enlace expirado',
                                'Se mostrará si el servidor reporta que venció.',
                            ],
                            [
                                'Cuenta ya activada',
                                'Se mostrará si el servidor reporta que ya se utilizó.',
                            ],
                            [
                                'Activación completada',
                                'Se mostrará únicamente tras confirmación real del servidor.',
                            ],
                        ].map(([title, description]) => (
                            <div key={title} className="rounded-md border p-3">
                                <p className="text-sm font-medium">{title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <form className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="company-name">Empresa</Label>
                            <Input
                                id="company-name"
                                disabled
                                placeholder="Se completará desde la invitación"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-ruc">RUC</Label>
                            <Input
                                id="company-ruc"
                                disabled
                                placeholder="Se completará desde la invitación"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="representative">
                                Representante
                            </Label>
                            <Input
                                id="representative"
                                disabled
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-phone">Teléfono</Label>
                            <Input
                                id="company-phone"
                                disabled
                                placeholder="Teléfono de contacto"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-email">
                                Correo de acceso
                            </Label>
                            <Input
                                id="account-email"
                                type="email"
                                disabled
                                placeholder="correo@empresa.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                disabled
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="password-confirmation">
                                Confirmar contraseña
                            </Label>
                            <Input
                                id="password-confirmation"
                                type="password"
                                disabled
                                autoComplete="new-password"
                            />
                        </div>
                        <label className="flex items-start gap-3 text-sm sm:col-span-2">
                            <Checkbox disabled />
                            <span>
                                Acepto los términos de uso y privacidad.
                            </span>
                        </label>
                        <Button
                            type="button"
                            disabled
                            className="sm:col-span-2"
                        >
                            Activar cuenta
                        </Button>
                    </form>

                    <p className="text-xs text-muted-foreground">
                        El formulario se habilitará cuando el backend confirme
                        el contrato del enlace y los campos requeridos. No se ha
                        creado un segundo mecanismo de invitación.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
