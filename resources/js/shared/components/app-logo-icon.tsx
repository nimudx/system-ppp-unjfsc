import { usePage } from '@inertiajs/react';
import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export const DEFAULT_LOGO = '/ins-unjfsc.png';

/**
 * Logo de la plataforma: el de la sección del usuario, el general que subió el
 * administrador o, si no hay ninguno, el escudo de la UNJFSC.
 */
export default function AppLogoIcon({
    className,
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    const { branding } = usePage().props;

    return (
        <img
            src={branding?.logoUrl ?? DEFAULT_LOGO}
            alt="Logo"
            {...props}
            className={cn('size-full object-contain', className)}
        />
    );
}
