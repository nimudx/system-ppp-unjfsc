import { useForm, usePage } from '@inertiajs/react';
import type { PersonProfile } from '@/modules/identity/types';
import { update as updateDetails } from '@/routes/profile/details';
import Heading from '@/shared/components/heading';
import InputError from '@/shared/components/input-error';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export default function UpdatePersonProfileForm({
    data,
}: {
    data: PersonProfile;
}) {
    const { auth } = usePage().props;
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
        names: data.names || '',
        surnames: data.surnames || '',
        phone: data.phone || '',
        gender: data.gender || '',
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
                    <Label htmlFor="email">Correo Institucional</Label>
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
                title="Información Personal"
                description="Actualiza tus datos personales básicos."
            />

            <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="dni">DNI (No editable)</Label>
                    <Input
                        id="dni"
                        value={data.dni}
                        disabled
                        className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="names">Nombres</Label>
                        <Input
                            id="names"
                            value={formData.names}
                            onChange={(e) => setData('names', e.target.value)}
                            required
                        />
                        <InputError message={errors.names} className="mt-2" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="surnames">Apellidos</Label>
                        <Input
                            id="surnames"
                            value={formData.surnames}
                            onChange={(e) =>
                                setData('surnames', e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.surnames}
                            className="mt-2"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="phone">Celular</Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                    <InputError message={errors.phone} className="mt-2" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="gender">Género</Label>
                    <select
                        id="gender"
                        aria-label="Género"
                        value={formData.gender}
                        onChange={(e) => setData('gender', e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    >
                        <option value="">Seleccione...</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                    </select>
                    <InputError message={errors.gender} className="mt-2" />
                </div>

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={processing}>
                        Guardar Detalles
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
