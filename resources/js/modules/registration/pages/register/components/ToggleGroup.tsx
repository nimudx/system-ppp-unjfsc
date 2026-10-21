import { cn } from '@/shared/lib/utils';

interface Option<T extends string> {
    code: T;
    title: string;
}

interface Props<T extends string> {
    options: Option<T>[];
    selectedCode: T;
    onChange: (code: T) => void;
}

export function ToggleGroup<T extends string>({
    options,
    selectedCode,
    onChange,
}: Props<T>) {
    return (
        <div className="flex w-fit gap-1 rounded-lg border bg-muted/40 p-1">
            {options.map((option) => (
                <button
                    key={option.code}
                    type="button"
                    onClick={() => onChange(option.code)}
                    className={cn(
                        'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                        selectedCode === option.code
                            ? 'border border-border bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {option.title}
                </button>
            ))}
        </div>
    );
}
