import { useMemo } from 'react';
import type { Faculty } from '@/modules/academic';
import type { CompanyProfile } from '@/modules/company';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';

export interface LocationValue {
    location_id: number | null;
}

interface LocationSelectorProps {
    /** El nivel seleccionado por el usuario (2=Fac, 3=Esc, 4=Sec, 5=Empresa) */
    level: number;
    faculties: Faculty[];
    companies?: CompanyProfile[];
    onChange: (value: LocationValue) => void;
    /** Estado interno controlado por el padre */
    selectedFacultyId: string;
    selectedSchoolId: string;
    selectedSectionId: string;
    selectedCompanyId: string;
    onFacultyChange: (v: string) => void;
    onSchoolChange: (v: string) => void;
    onSectionChange: (v: string) => void;
    onCompanyChange: (v: string) => void;
    disabled?: boolean;
}

export function LocationSelector({
    level,
    faculties,
    companies = [],
    onChange,
    selectedFacultyId,
    selectedSchoolId,
    selectedSectionId,
    selectedCompanyId,
    onFacultyChange,
    onSchoolChange,
    onSectionChange,
    onCompanyChange,
    disabled = false,
}: LocationSelectorProps) {
    // Aplanar escuelas y secciones a partir del árbol de facultades
    const allSchools = useMemo(
        () =>
            faculties.flatMap((f) =>
                (f.schools ?? []).map((s) => ({ ...s, faculty_id: f.id })),
            ),
        [faculties],
    );

    const allSections = useMemo(
        () =>
            allSchools.flatMap((s) =>
                (s.sections ?? []).map((sec) => ({
                    ...sec,
                    school_id: s.id,
                })),
            ),
        [allSchools],
    );

    const filteredSchools = selectedFacultyId
        ? allSchools.filter((s) => s.faculty_id === Number(selectedFacultyId))
        : [];

    const filteredSections = selectedSchoolId
        ? allSections.filter((s) => s.school_id === Number(selectedSchoolId))
        : [];

    // Notifica al padre cada vez que cambia la selección final
    const notify = (id: number | null) => {
        onChange({ location_id: id });
    };

    // level 5: solo Empresa
    if (level === 5) {
        return (
            <div className="flex flex-col gap-2">
                <Label>Empresa</Label>
                <Select
                    value={selectedCompanyId}
                    disabled={disabled}
                    onValueChange={(v) => {
                        onCompanyChange(v);
                        notify(Number(v));
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona la empresa..." />
                    </SelectTrigger>
                    <SelectContent>
                        {companies.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Siempre visible si level >= 2 */}
            <div className="flex flex-col gap-2">
                <Label>Facultad</Label>
                <Select
                    value={selectedFacultyId}
                    disabled={disabled}
                    onValueChange={(v) => {
                        onFacultyChange(v);
                        onSchoolChange('');
                        onSectionChange('');
                        // Si el nivel objetivo es facultad, notificamos aquí
                        if (level === 2) notify(Number(v));
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona una facultad..." />
                    </SelectTrigger>
                    <SelectContent>
                        {faculties.map((f) => (
                            <SelectItem key={f.id} value={f.id.toString()}>
                                {f.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Solo visible si level >= 3 (Escuela o Sección) */}
            {level >= 3 && (
                <div className="flex flex-col gap-2">
                    <Label>Escuela</Label>
                    <Select
                        value={selectedSchoolId}
                        disabled={disabled || !selectedFacultyId}
                        onValueChange={(v) => {
                            onSchoolChange(v);
                            onSectionChange('');
                            if (level === 3) notify(Number(v));
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue
                                placeholder={
                                    !selectedFacultyId
                                        ? 'Primero elige una facultad'
                                        : 'Selecciona una escuela...'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredSchools.map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Solo visible si level === 4 (Sección) */}
            {level === 4 && (
                <div className="flex flex-col gap-2">
                    <Label>Sección</Label>
                    <Select
                        value={selectedSectionId}
                        disabled={disabled || !selectedSchoolId}
                        onValueChange={(v) => {
                            onSectionChange(v);
                            notify(Number(v));
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue
                                placeholder={
                                    !selectedSchoolId
                                        ? 'Primero elige una escuela'
                                        : 'Selecciona una sección...'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredSections.map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}
