import { Head, router, useForm } from '@inertiajs/react';
import { ImageUp, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { destroy, edit, update } from '@/routes/branding';
import { DEFAULT_LOGO } from '@/shared/components/app-logo-icon';
import Heading from '@/shared/components/heading';
import InputError from '@/shared/components/input-error';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import AppLayout from '@/shared/layouts/app-layout';
import SettingsLayout from '@/shared/layouts/settings/layout';
import type { BreadcrumbItem } from '@/shared/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Logo', href: edit().url }];

type Props = {
    scope: 'global' | 'section';
    label: string;
    currentLogo: string | null;
};

export default function Branding({ scope, label, currentLogo }: Props) {
    const [preview, setPreview] = useState<string | null>(null);
    const { setData, post, processing, errors, reset, data } = useForm<{
        logo: File | null;
    }>({ logo: null });

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const selectFile = (file: File | null) => {
        setData('logo', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPreview(null);
            },
        });
    };

    const restore = () => {
        router.delete(destroy().url, { preserveScroll: true });
    };

    const shown = preview ?? currentLogo ?? DEFAULT_LOGO;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logo" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title={label}
                        description={
                            scope === 'global'
                                ? 'Es el logo que todos ven junto a "Sistema de Practicas", salvo las secciones que tengan su propio logo.'
                                : 'Lo verán tú, tus alumnos y los docentes supervisores de esta sección. Solo cambia la imagen, no el nombre del sistema.'
                        }
                    />

                    <div className="flex items-center gap-4 rounded-lg border p-4">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-md border bg-muted/40 p-1">
                            <img
                                src={shown}
                                alt="Vista previa del logo"
                                className="size-full object-contain"
                            />
                        </div>
                        <div className="space-y-1 text-sm">
                            <p className="font-medium">Sistema de Practicas</p>
                            <p className="text-muted-foreground">
                                {preview
                                    ? 'Vista previa (aún no guardada)'
                                    : currentLogo
                                      ? 'Logo actual'
                                      : 'Logo por defecto'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="logo">Nueva imagen</Label>
                            <input
                                id="logo"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) =>
                                    selectFile(e.target.files?.[0] ?? null)
                                }
                                className="block w-full cursor-pointer rounded-md border border-input bg-transparent text-sm file:mr-3 file:cursor-pointer file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                            />
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG o WebP, hasta 2 MB. Se ve mejor una
                                imagen cuadrada con fondo transparente.
                            </p>
                            <InputError message={errors.logo} />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                type="submit"
                                disabled={processing || !data.logo}
                            >
                                <ImageUp className="size-4" />
                                Guardar logo
                            </Button>

                            {currentLogo && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={restore}
                                    disabled={processing}
                                >
                                    <RotateCcw className="size-4" />
                                    Restaurar logo original
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
