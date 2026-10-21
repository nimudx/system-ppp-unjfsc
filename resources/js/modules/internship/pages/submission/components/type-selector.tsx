import { SectionCard } from "@/shared/components/ui/section-card";
import { CheckCircle2, GraduationCap, Laptop, UserCheck } from "lucide-react";

const TYPE_OPTIONS = [
    { value: 'development', label: 'Desarrollo', icon: Laptop, desc: 'Pasantía en empresa' },
    { value: 'validation', label: 'Convalidación', icon: CheckCircle2, desc: 'Experiencia laboral previa' },
];

const ORIGIN_OPTIONS = [
    { value: 'direct', label: 'Directo', icon: UserCheck, desc: 'Convenio propio' },
    { value: 'application', label: 'Postulación', icon: GraduationCap, desc: 'Convocatoria universitaria' },
];

export const TYPE_LABELS: Record<string, string> = {
    development: 'Desarrollo',
    validation: 'Convalidación',
    direct: 'Directo',
    application: 'Postulación',
};


// ── ASIDE: TypeSelector Vertical ───────────────────────────────────────────
export function TypeSelector({ type, setType, origin, setOrigin, disabled }: {
    type: string;
    setType: (v: string) => void;
    origin: string;
    setOrigin: (v: string) => void;
    disabled: boolean;
}) {
    return (
        <SectionCard>
            <SectionCard.Header
                title="Tipo de Pasantía"
                description="Selecciona un tipo de pasantía"
            />
            <SectionCard.Body className="flex flex-col gap-3 py-4">
                <div className="flex flex-col gap-2">
                    {TYPE_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = type === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    setType(opt.value);
                                    if (opt.value === 'validation') setOrigin('direct');
                                }}
                                disabled={disabled}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200
                                ${isSelected
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'
                                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <div className={`p-2 rounded-lg shrink-0 transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                    <Icon className="size-4" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold leading-tight">{opt.label}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Origen (solo Desarrollo) */}
                {type === 'development' && (
                    <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                        <div className="px-1 pt-2 pb-1">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">
                                Origen de Vacante
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            {ORIGIN_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = origin === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => setOrigin(opt.value)}
                                        disabled={disabled}
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200
                                        ${isSelected
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                                                : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'
                                            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <div className={`p-2 rounded-lg shrink-0 transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            <Icon className="size-4" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-bold leading-tight">{opt.label}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </SectionCard.Body>
        </SectionCard>
    );
}