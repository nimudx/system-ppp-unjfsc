import { cn } from '@/shared/lib/utils';

interface Option {
    code: string;
    title: string;
}

interface Props {
    options: Option[];
    selectedCode: string;
    onChange: (code: any) => void;
}

export function ToggleGroup({ options, selectedCode, onChange }: Props) {
    return (
        <div className="flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
            {options.map((option) => (
                <button
                    key={option.code}
                    type="button"
                    onClick={() => onChange(option.code)}
                    className={cn(
                        'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                        selectedCode === option.code
                            ? 'bg-background text-foreground shadow-sm border border-border'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {option.title}
                </button>
            ))}
        </div>
    );
}