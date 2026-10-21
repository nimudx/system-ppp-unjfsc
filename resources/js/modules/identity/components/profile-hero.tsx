import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { update as updateMedia } from '@/routes/profile/media';

export default function ProfileHero({ profileData }: { profileData: any }) {
    // Helper function to prepend /storage/ to partial paths saving 'http'
    const getStorageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('/storage/'))
            return path;
        return `/storage/${path}`;
    };

    // Estados para las previsualizaciones visuales
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(
        getStorageUrl(profileData?.path_photo),
    );
    const [previewBanner, setPreviewBanner] = useState<string | null>(
        getStorageUrl(profileData?.path_banner),
    );

    // Estados para almacenar el Archivo real (File) para luego enviarlo al backend
    // null: sin cambios, undefined (no lo usamos, pero lo representaremos para eliminar)
    // usaremos 'deleted' como un string temporal si el usuario elimina la foto antes de guardar
    const [photoAction, setPhotoAction] = useState<File | 'deleted' | null>(
        null,
    );
    const [bannerAction, setBannerAction] = useState<File | 'deleted' | null>(
        null,
    );

    // Referencias a los inputs ocultos
    const photoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    // Manejador: Cuando el usuario selecciona una foto
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('La imagen es muy pesada', {
                    description: 'Por favor, comprímela o usa una de menos de 2MB.',
                });
                e.target.value = ''; // Limpiar el input
                return;
            }
            setPhotoAction(file);
            setPreviewPhoto(URL.createObjectURL(file)); // Crea una URL temporal para ver la foto ya mismo!
        }
    };

    // Manejador: Cuando el usuario selecciona un banner
    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('La imagen de portada es muy pesada', {
                    description: 'Por favor, comprímela o usa una de menos de 2MB.',
                });
                e.target.value = '';
                return;
            }
            setBannerAction(file);
            setPreviewBanner(URL.createObjectURL(file));
        }
    };

    const handleRemovePhoto = () => {
        setPhotoAction('deleted');
        setPreviewPhoto(null);
    };

    const handleRemoveBanner = () => {
        setBannerAction('deleted');
        setPreviewBanner(null);
    };

    // Función temporal: Aquí luego meteremos Inertia router.post()
    const handleSaveImages = () => {
        router.post(
            updateMedia().url,
            {
                photo: photoAction,
                banner: bannerAction,
            },
            {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    setPhotoAction(null);
                    setBannerAction(null);
                },
            },
        );
    };

    const hasChanges = photoAction !== null || bannerAction !== null;

    return (
        <div className="relative mb-8 flex flex-col items-center">
            {/* --- SECCIÓN BANNER --- */}
            <div className="group relative h-48 w-full overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                {previewBanner ? (
                    <img
                        src={previewBanner}
                        alt="Portada del perfil. Max 2MB."
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full bg-linear-to-r from-zinc-300 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700" />
                )}

                {/* Botón flotante para cambiar Banner (Aparece en la esquina inferior derecha) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute right-4 bottom-4 z-10 opacity-70 transition-opacity hover:opacity-100"
                        >
                            <Camera className="mr-2 h-4 w-4" />
                            Editar Portada
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => bannerInputRef.current?.click()}
                        >
                            <ImagePlus className="mr-2 h-4 w-4" />
                            <span>Subir foto</span>
                        </DropdownMenuItem>
                        {previewBanner && (
                            <DropdownMenuItem
                                onClick={handleRemoveBanner}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Eliminar foto</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <input
                    type="file"
                    ref={bannerInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleBannerChange}
                    aria-label="Upload banner image"
                />
            </div>

            {/* --- SECCIÓN AVATAR --- */}
            {/* Se posiciona de forma "absoluta" (relative y margen negativo) para solaparse sobre el banner */}
            <div className="group relative -mt-16 sm:-mt-20">
                <Avatar className="h-32 w-32 shrink-0 rounded-full border-4 border-white shadow-xl sm:h-36 sm:w-36 dark:border-zinc-950">
                    <AvatarImage
                        src={previewPhoto || ''}
                        className="object-cover"
                    />
                    <AvatarFallback className="bg-zinc-100 text-3xl font-bold dark:bg-zinc-800">
                        {/* Puedes poner aquí las iniciales: 'US' */}
                        UI
                    </AvatarFallback>
                </Avatar>

                {/* Botón flotante superpuesto al Avatar. Aparece solo al hacer hover. */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Edit profile photo"
                        >
                            <Camera className="h-8 w-8 text-white" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                        <DropdownMenuItem
                            onClick={() => photoInputRef.current?.click()}
                        >
                            <ImagePlus className="mr-2 h-4 w-4" />
                            <span>Subir foto</span>
                        </DropdownMenuItem>
                        {previewPhoto && (
                            <DropdownMenuItem
                                onClick={handleRemovePhoto}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Eliminar foto</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <input
                    type="file"
                    ref={photoInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    aria-label="Upload profile photo"
                />
            </div>

            {/* --- ACCIÓN DE GUARDADO --- */}
            {hasChanges && (
                <div className="mt-6 flex justify-center">
                    <Button
                        onClick={handleSaveImages}
                        className="px-8 shadow-lg"
                    >
                        Guardar mis nuevas fotos
                    </Button>
                </div>
            )}
        </div>
    );
}
