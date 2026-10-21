import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export default function AppLogoIcon({
    className,
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/ins-unjfsc.png"
            alt="UNJFSC Logo"
            {...props}
            className={cn('size-full object-contain', className)}
        />
    );
}
