import { Filter, X, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Faculty } from '@/shared/types';

export interface AcademicFilterValues {
    faculty_id: string;
    school_id: string;
    section_id: string;
    [key: string]: unknown;
}

interface AcademicFilterProps {
    faculties: Faculty[];
    onFilter: (values: AcademicFilterValues) => void;
    isLoading?: boolean;
    /** Incrementar este valor desde el padre para forzar un reset interno del filtro */
    //clearKey?: number;
    initialValues?: AcademicFilterValues;
    disabled?: boolean;
}

export function AcademicFilter({
    faculties,
    onFilter,
    isLoading = false,
    //clearKey = 0,
    initialValues,
    disabled = false,
}: AcademicFilterProps) {
    const [open, setOpen] = useState(false);
    const [facultyId, setFacultyId] = useState(initialValues?.faculty_id ?? '');
    const [schoolId, setSchoolId] = useState(initialValues?.school_id ?? '');
    const [sectionId, setSectionId] = useState(initialValues?.section_id ?? '');

    const [applied, setApplied] = useState<AcademicFilterValues | null>(
        initialValues ?? null,
    );

    const selectedFaculty = Array.isArray(faculties)
        ? faculties.find((f) => f.id.toString() === facultyId)
        : undefined;
    const selectedSchool = selectedFaculty?.schools.find(
        (s) => s.id.toString() === schoolId,
    );

    const handleFilter = () => {
        const values: AcademicFilterValues = {
            faculty_id: facultyId,
            school_id: schoolId,
            section_id: sectionId,
        };
        setApplied(values);
        onFilter(values);
        setOpen(false);
    };

    const handleClear = () => {
        setFacultyId('');
        setSchoolId('');
        setSectionId('');
        const empty: AcademicFilterValues = {
            faculty_id: '',
            school_id: '',
            section_id: '',
        };
        setApplied(null);
        onFilter(empty);
        setOpen(false);
    };

    const hasFilter =
        applied &&
        (applied.faculty_id || applied.school_id || applied.section_id);

    const appliedLabel = () => {
        if (!applied) return null;

        const fac = faculties.find(
            (f) => f.id.toString() === applied.faculty_id,
        );
        const sch = fac?.schools.find(
            (s) => s.id.toString() === applied.school_id,
        );
        const sec = sch?.sections.find(
            (s) => s.id.toString() === applied.section_id,
        );

        // 1. Si hay sección, mostrar "Escuela - Sección"
        if (sec && sch) {
            return `${sch.name} - ${sec.name}`;
        }

        // 2. Si no hay sección pero sí escuela
        if (sch) {
            return sch.name;
        }

        // 3. Si solo hay facultad
        if (fac) {
            return fac.name;
        }

        return null;
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={hasFilter ? 'default' : 'outline'}
                    className={`gap-2 transition-all ${hasFilter ? 'pr-2' : ''}`}
                    disabled={disabled}
                >
                    <Filter className="size-3.5 shrink-0" />
                    <span className="text-xs font-semibold">
                        {hasFilter
                            ? (appliedLabel() ?? 'Filtrado')
                            : 'Filtro académico'}
                    </span>
                    {hasFilter ? (
                        <Badge
                            variant="secondary"
                            className="ml-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-white/20 p-0 text-[9px] text-inherit hover:bg-white/30"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                        >
                            <X className="size-2.5" />
                        </Badge>
                    ) : (
                        <ChevronDown className="size-3.5 text-muted-foreground" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                className="w-80 space-y-4 p-4"
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-2">
                    <div>
                        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            Filtro académico
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                            Selecciona hasta nivel sección
                        </p>
                    </div>
                    {(facultyId || schoolId || sectionId) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] text-muted-foreground"
                            onClick={handleClear}
                        >
                            Limpiar
                        </Button>
                    )}
                </div>

                {/* Selects */}
                <div className="space-y-3">
                    {/* Facultad */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                            Facultad
                        </label>
                        <Select
                            value={facultyId}
                            onValueChange={(v) => {
                                setFacultyId(v);
                                setSchoolId('');
                                setSectionId('');
                            }}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Seleccionar facultad..." />
                            </SelectTrigger>
                            <SelectContent>
                                {faculties.map((f) => (
                                    <SelectItem
                                        key={f.id}
                                        value={f.id.toString()}
                                        className="text-sm"
                                    >
                                        {f.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Escuela */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                            Escuela
                        </label>
                        <Select
                            value={schoolId}
                            disabled={!facultyId}
                            onValueChange={(v) => {
                                setSchoolId(v);
                                setSectionId('');
                            }}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue
                                    placeholder={
                                        !facultyId
                                            ? 'Primero selecciona facultad'
                                            : 'Seleccionar escuela...'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedFaculty?.schools.map((s) => (
                                    <SelectItem
                                        key={s.id}
                                        value={s.id.toString()}
                                        className="text-sm"
                                    >
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sección */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                            Sección
                        </label>
                        <Select
                            value={sectionId}
                            disabled={!schoolId}
                            onValueChange={setSectionId}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue
                                    placeholder={
                                        !schoolId
                                            ? 'Primero selecciona escuela'
                                            : 'Seleccionar sección...'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedSchool?.sections.map((sec) => (
                                    <SelectItem
                                        key={sec.id}
                                        value={sec.id.toString()}
                                        className="text-sm"
                                    >
                                        {sec.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t pt-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 flex-1 text-xs"
                        onClick={() => setOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 flex-1 text-xs font-bold"
                        onClick={handleFilter}
                        disabled={!facultyId || isLoading}
                    >
                        {isLoading ? 'Filtrando...' : 'Aplicar filtro'}
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
