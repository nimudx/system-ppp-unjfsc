import { Head, useForm } from '@inertiajs/react';
import {
    BadgeCheck,
    Building2,
    CalendarDays,
    ImagePlus,
    Mail,
    ShieldCheck,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import {
    edit as editCompanyProfile,
    update as updateCompanyProfile,
} from '@/routes/company/profile';
import Heading from '@/shared/components/heading';
import InputError from '@/shared/components/input-error';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import AppLayout from '@/shared/layouts/app-layout';
import type { BreadcrumbItem } from '@/shared/types';

type CompanyProfileData = {
    id: number;
    name: string;
    ruc: string;
    razon: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    representative_name: string | null;
    representative_phone: string | null;
    logo_url: string | null;
    activated_at: string | null;
    account: {
        email: string;
        code: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Perfil empresarial',
        href: editCompanyProfile().url,
    },
];

function formatDate(value: string | null): string {
    if (!value) return '—';

    return new Date(value).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

export default function CompanyProfile({
    company,
}: {
    company: CompanyProfileData;
}) {
    const [logoPreview, setLogoPreview] = useState<string | null>(
        company.logo_url,
    );

    const { data, setData, patch, processing, recentlySuccessful, errors } =
        useForm({
            razon: company.razon ?? '',
            name: company.name,
            phone: company.phone ?? '',
            address: company.address ?? '',
            website: company.website ?? '',
            representative_name: company.representative_name ?? '',
            representative_phone: company.representative_phone ?? '',
            photo: null as File | null,
            remove_photo: false,
        });

    const initial = company.name.charAt(0).toUpperCase();

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        patch(updateCompanyProfile().url, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        setData('photo', file);
        setData('remove_photo', false);
        setLogoPreview(file ? URL.createObjectURL(file) : company.logo_url);
    };

    const removeLogo = () => {
        setData('photo', null);
        setData('remove_photo', true);
        setLogoPreview(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfil empresarial" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="space-y-1">
                    <Heading
                        variant="small"
                        title="Perfil empresarial"
                        description="Administra los datos públicos, de contacto y del representante de tu empresa."
                    />
                    <p className="text-xs text-muted-foreground">
                        Esta información se muestra a los docentes titulares y
                        estudiantes que participan en la bolsa laboral.
                    </p>
                </div>

                {/* Identidad de la empresa */}
                <section className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-primary/10 via-background to-primary/5 p-5 md:p-6">
                    <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/10 blur-3xl" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                        {logoPreview ? (
                            <img
                                src={logoPreview}
                                alt={`Logo de ${company.name}`}
                                className="size-20 shrink-0 rounded-2xl border object-cover shadow-sm"
                            />
                        ) : (
                            <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-3xl font-bold text-primary">
                                {initial}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                                    {company.name}
                                </h1>
                                <Badge className="bg-green-600 text-white">
                                    <BadgeCheck className="mr-1 size-3" />
                                    Cuenta activa
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {company.razon}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                    <Building2 className="size-3.5" />
                                    RUC {company.ruc}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <CalendarDays className="size-3.5" />
                                    Activa desde{' '}
                                    {formatDate(company.activated_at)}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Mail className="size-3.5" />
                                    {company.email}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    <form onSubmit={submit} className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Identidad de la empresa</CardTitle>
                                <CardDescription>
                                    Datos legales y comerciales que identifican
                                    a tu empresa.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="razon">Razón social</Label>
                                    <Input
                                        id="razon"
                                        value={data.razon}
                                        onChange={(event) =>
                                            setData('razon', event.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.razon} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Nombre comercial
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="ruc">
                                        RUC (no editable)
                                    </Label>
                                    <Input
                                        id="ruc"
                                        value={company.ruc}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Si el RUC es incorrecto, contacta con la
                                        coordinación académica.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Contacto y ubicación</CardTitle>
                                <CardDescription>
                                    Canales para que los estudiantes y docentes
                                    puedan comunicarse contigo.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        Teléfono de la empresa
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(event) =>
                                            setData('phone', event.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Correo de la empresa (no editable)
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={company.email ?? ''}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        El correo de acceso se gestiona desde la
                                        cuenta de usuario.
                                    </p>
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="address">
                                        Dirección legal
                                    </Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(event) =>
                                            setData(
                                                'address',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="website">
                                        Sitio web (opcional)
                                    </Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        placeholder="https://ejemplo.com"
                                        value={data.website}
                                        onChange={(event) =>
                                            setData(
                                                'website',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.website} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Representante de la empresa
                                </CardTitle>
                                <CardDescription>
                                    Persona responsable de validar las
                                    solicitudes y coordinar las prácticas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="representative_name">
                                        Nombre completo
                                    </Label>
                                    <Input
                                        id="representative_name"
                                        value={data.representative_name}
                                        onChange={(event) =>
                                            setData(
                                                'representative_name',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.representative_name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="representative_phone">
                                        Teléfono del representante
                                    </Label>
                                    <Input
                                        id="representative_phone"
                                        value={data.representative_phone}
                                        onChange={(event) =>
                                            setData(
                                                'representative_phone',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.representative_phone}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Logo de la empresa</CardTitle>
                                <CardDescription>
                                    Se mostrará en tu perfil y en las vacantes
                                    que publiques.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Vista previa del logo"
                                        className="size-20 shrink-0 rounded-2xl border object-cover"
                                    />
                                ) : (
                                    <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border bg-muted text-2xl font-bold text-muted-foreground">
                                        {initial}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="photo"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                                    >
                                        <ImagePlus className="size-4" />
                                        Seleccionar imagen
                                    </Label>
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={handlePhoto}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG o WEBP. Tamaño máximo 2 MB.
                                    </p>
                                    {logoPreview && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={removeLogo}
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            Quitar logo
                                        </Button>
                                    )}
                                    <InputError message={errors.photo} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-wrap items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Guardando...'
                                    : 'Guardar cambios'}
                            </Button>
                            {recentlySuccessful && (
                                <p className="text-sm font-medium text-green-600">
                                    Datos actualizados correctamente.
                                </p>
                            )}
                        </div>
                    </form>

                    {/* Columna lateral */}
                    <aside className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cuenta de acceso</CardTitle>
                                <CardDescription>
                                    Credenciales con las que ingresas al
                                    sistema.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                                        <Mail className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">
                                            Correo de acceso
                                        </p>
                                        <p className="truncate font-medium">
                                            {company.account.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                                        <ShieldCheck className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">
                                            Código de usuario
                                        </p>
                                        <p className="truncate font-medium">
                                            {company.account.code}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                                        <UserRound className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">
                                            Representante registrado
                                        </p>
                                        <p className="truncate font-medium">
                                            {company.representative_name ||
                                                'Sin registrar'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Estado de la empresa</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Validación
                                    </span>
                                    <Badge className="bg-green-600 text-white">
                                        Activa
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        RUC
                                    </span>
                                    <span className="font-medium tabular-nums">
                                        {company.ruc}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Activación
                                    </span>
                                    <span className="font-medium">
                                        {formatDate(company.activated_at)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="rounded-xl border bg-muted/40 p-4 text-sm">
                            <p className="font-medium">
                                ¿Necesitas cambiar el RUC o el correo de acceso?
                            </p>
                            <p className="mt-1 text-muted-foreground">
                                Estos datos están vinculados a la validación
                                académica. Solicita el cambio a la coordinación
                                de prácticas de la UNJFSC.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
