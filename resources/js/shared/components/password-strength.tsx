import { Check, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// Deben coincidir con Password::defaults() en AppServiceProvider.
export const PASSWORD_RULES = [
    {
        label: 'Minúscula y mayúscula',
        test: (value: string) => /\p{Ll}/u.test(value) && /\p{Lu}/u.test(value),
    },
    { label: 'Números (0-9)', test: (value: string) => /\p{N}/u.test(value) },
    {
        label: 'Caracteres especiales (!@#$%...)',
        test: (value: string) => /[\p{Z}\p{S}\p{P}]/u.test(value),
    },
    {
        label: 'Al menos 8 caracteres',
        test: (value: string) => value.length >= 8,
    },
];

const LEVELS = [
    { label: 'Muy débil', bar: 'bg-red-500', text: 'text-red-600' },
    { label: 'Débil', bar: 'bg-orange-500', text: 'text-orange-600' },
    { label: 'Regular', bar: 'bg-yellow-500', text: 'text-yellow-600' },
    { label: 'Buena', bar: 'bg-lime-500', text: 'text-lime-600' },
    { label: 'Fuerte', bar: 'bg-green-600', text: 'text-green-600' },
];

export function isPasswordStrong(value: string): boolean {
    return PASSWORD_RULES.every((rule) => rule.test(value));
}

/**
 * Lista de requisitos de la contraseña y barra que va de débil a fuerte según se cumplen.
 */
export default function PasswordStrength({ value }: { value: string }) {
    const passed = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
    const level = LEVELS[passed];
    const percent = (passed / PASSWORD_RULES.length) * 100;

    return (
        <div className="space-y-3 rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium">Tu contraseña debe incluir:</p>

            <ul className="space-y-1">
                {PASSWORD_RULES.map((rule) => {
                    const ok = rule.test(value);

                    return (
                        <li
                            key={rule.label}
                            className={cn(
                                'flex items-center gap-2',
                                ok ? 'text-green-600' : 'text-muted-foreground',
                            )}
                        >
                            {ok ? (
                                <Check className="size-4" aria-hidden />
                            ) : (
                                <X className="size-4" aria-hidden />
                            )}
                            <span>{rule.label}</span>
                            <span className="sr-only">
                                {ok ? '(cumplido)' : '(pendiente)'}
                            </span>
                        </li>
                    );
                })}
            </ul>

            <div className="space-y-1">
                <div
                    className="h-2 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label="Seguridad de la contraseña"
                    aria-valuemin={0}
                    aria-valuemax={PASSWORD_RULES.length}
                    aria-valuenow={passed}
                    aria-valuetext={value ? level.label : 'Sin contraseña'}
                >
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-300',
                            level.bar,
                        )}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                {value && (
                    <p className={cn('text-xs font-medium', level.text)}>
                        Seguridad: {level.label}
                    </p>
                )}
            </div>
        </div>
    );
}
