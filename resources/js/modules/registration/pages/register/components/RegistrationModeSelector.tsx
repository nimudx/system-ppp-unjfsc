import { UserRound, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// Reutilizamos la lógica de SelectionCard que tenías en el monolito
function SelectionCard({
    icon,
    title,
    description,
    isSelected,
    onClick,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex w-full flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all hover:bg-muted/50',
                isSelected
                    ? 'border-primary bg-muted/30 ring-1 ring-primary'
                    : 'border-border',
            )}
        >
            <div
                className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg border',
                    isSelected
                        ? 'border-primary/20 bg-primary/5 text-primary'
                        : 'border-border bg-muted/50 text-muted-foreground',
                )}
            >
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </button>
    );
}

export function RegistrationModeSelector({
    mode,
    setMode,
}: {
    mode: 'individual' | 'masivo';
    setMode: (mode: 'individual' | 'masivo') => void;
}) {
    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
                Tipo de Registro
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SelectionCard
                    icon={<UserRound className="h-5 w-5" />}
                    title="Individual"
                    description="Registro uno a uno con validación de DNI."
                    isSelected={mode === 'individual'}
                    onClick={() => setMode('individual')}
                />
                <SelectionCard
                    icon={<FileSpreadsheet className="h-5 w-5" />}
                    title="Masivo (CSV)"
                    description="Carga de múltiples registros mediante archivo."
                    isSelected={mode === 'masivo'}
                    onClick={() => setMode('masivo')}
                />
            </div>
        </div>
    );
}
