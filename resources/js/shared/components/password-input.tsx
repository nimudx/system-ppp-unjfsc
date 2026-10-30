import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type'>;

/**
 * Campo de contraseña con botón de "ojito" para mostrar u ocultar lo escrito.
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, ...props }, ref) => {
        const [visible, setVisible] = useState(false);

        return (
            <div className="relative">
                <Input
                    ref={ref}
                    type={visible ? 'text' : 'password'}
                    className={cn('pr-10', className)}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setVisible((value) => !value)}
                    aria-label={
                        visible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    aria-pressed={visible}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
                >
                    {visible ? (
                        <EyeOff className="size-4" />
                    ) : (
                        <Eye className="size-4" />
                    )}
                </button>
            </div>
        );
    },
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
