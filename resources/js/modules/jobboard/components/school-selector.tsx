import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import type { SchoolOption } from '../types';
import { groupSchoolsByFaculty } from '../utils';

export default function SchoolSelector({
    schools,
    selectedIds,
    onChange,
    error,
}: {
    schools: SchoolOption[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    error?: string;
}) {
    const groups = groupSchoolsByFaculty(schools);

    const toggle = (id: number) => {
        onChange(
            selectedIds.includes(id)
                ? selectedIds.filter((selected) => selected !== id)
                : [...selectedIds, id],
        );
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>Escuelas destino</Label>
                <span className="text-xs text-muted-foreground">
                    {selectedIds.length} seleccionada
                    {selectedIds.length === 1 ? '' : 's'}
                </span>
            </div>

            <p className="text-xs text-muted-foreground">
                Los docentes titulares de estas escuelas podrán proponer
                candidatos cuando la vacante sea publicada.
            </p>

            <div className="max-h-72 space-y-4 overflow-y-auto rounded-lg border p-3">
                {groups.map((group) => (
                    <div key={group.faculty} className="space-y-2">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            {group.faculty}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {group.schools.map((school) => {
                                const checked = selectedIds.includes(school.id);

                                return (
                                    <label
                                        key={school.id}
                                        htmlFor={`school-${school.id}`}
                                        className="flex cursor-pointer items-start gap-2 rounded-md p-1.5 text-sm transition-colors hover:bg-muted/50"
                                    >
                                        <Checkbox
                                            id={`school-${school.id}`}
                                            checked={checked}
                                            onCheckedChange={() =>
                                                toggle(school.id)
                                            }
                                            className="mt-0.5"
                                        />
                                        <span>{school.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {groups.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No hay escuelas activas disponibles.
                    </p>
                )}
            </div>

            {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}
        </div>
    );
}
