import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import AppLogoIcon from '@/shared/components/app-logo-icon';
import { cn } from '@/shared/lib/utils';
import type { AuthLayoutProps } from '@/shared/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
    withBackground = false,
}: AuthLayoutProps) {
    return (
        <div
            className={cn(
                'relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10',
                withBackground
                    ? 'overflow-hidden bg-neutral-900'
                    : 'bg-background',
            )}
        >
            {withBackground && (
                <>
                    <img
                        src="/images/login/campus-licenciamiento-1280.webp"
                        srcSet="/images/login/campus-licenciamiento-768.webp 768w, /images/login/campus-licenciamiento-1280.webp 1280w, /images/login/campus-licenciamiento-1920.webp 1920w"
                        sizes="100vw"
                        alt=""
                        aria-hidden
                        fetchPriority="high"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    {/* Oscurece la foto para que el formulario se lea bien */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0b2a5b]/70 via-black/40 to-black/60" />
                </>
            )}

            <div
                className={cn(
                    'relative w-full max-w-sm',
                    withBackground &&
                        'rounded-2xl border border-white/20 bg-background/95 p-8 shadow-2xl backdrop-blur-sm',
                )}
            >
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-white" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
