import { useForm, usePage } from '@inertiajs/react';
import { update as updateDetails } from '@/routes/profile/details';
import Heading from '@/shared/components/heading';
import InputError from '@/shared/components/input-error';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export default function UpdateCompanyProfileForm({ data }: { data: any }) {
    const { auth } = usePage().props as any;
    const email = auth.user.email || '';
    const code = email.split('@')[0];

    const {
        data: formData,
        setData,
        patch,
        processing,
        recentlySuccessful,
        errors,
    } = useForm({
        razon: data.razon || '',
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
        website: data.website || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(updateDetails().url, {
            preserveScroll: true,
        });
    };

    return (
        <section className="space-y-6">
            <Heading
                variant="small"
                title="Información de Usuario"
                description="Credenciales y acceso al sistema."
            />

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="code">Código</Label>
                    <Input
                        id="code"
                        value={code}
                        disabled
                        className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Correo Empresarial</Label>
                    <Input
                        id="email"
                        value={email}
                        disabled
                        className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                    />
                </div>
            </div>

            <div className="my-6 h-px w-full bg-border" />

            <Heading
                variant="small"
                title="Información Corporativa"
                description="Actualiza los datos públicos de la empresa."
            />

            <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="ruc">RUC (No editable)</Label>
                    <Input
                        id="ruc"
                        value={data.ruc}
                        disabled
                        className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="razon">Razón Social</Label>
                    <Input
                        id="razon"
                        value={formData.razon}
                        onChange={(e) => setData('razon', e.target.value)}
                        required
                    />
                    <InputError message={errors.razon} className="mt-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre Comercial</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            required
                        />
                        <InputError message={errors.phone} className="mt-2" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="address">Dirección Legal</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setData('address', e.target.value)}
                            required
                        />
                        <InputError message={errors.address} className="mt-2" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="website">Sitio Web (Opcional)</Label>
                        <Input
                            id="website"
                            type="url"
                            placeholder="https://ejemplo.com"
                            value={formData.website}
                            onChange={(e) => setData('website', e.target.value)}
                        />
                        <InputError message={errors.website} className="mt-2" />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={processing}>
                        Guardar Cambios
                    </Button>

                    {recentlySuccessful && (
                        <p className="text-sm text-green-600">
                            Guardado correctamente.
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}
