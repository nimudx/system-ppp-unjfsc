import { useFormContext, useWatch } from 'react-hook-form';
import type { Faculty } from '@/modules/academic';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';

import { useAcademicAutoResolver } from './useAcademicAutoResolver';

export function AcademicSelectorRHF({
    roleId,
    roleUser,
    faculties = [],
}: {
    roleId: string;
    roleUser: number | null;
    faculties?: Faculty[];
}) {
    const { control, setValue } = useFormContext();

    const isSubadmin = roleId === '2';
    const isTeacher = roleUser === 3;

    const facultyId = useWatch({ control, name: 'faculty_id' });
    const schoolId = useWatch({ control, name: 'school_id' });

    const safeFaculties = Array.isArray(faculties) ? faculties : [];

    // Obtener la facultad seleccionada y sus escuelas
    const selectedFaculty = safeFaculties.find(
        (f) => f.id?.toString() === facultyId?.toString(),
    );
    const filteredSchools = Array.isArray(selectedFaculty?.schools)
        ? selectedFaculty.schools
        : [];

    // Obtener la escuela seleccionada y sus secciones
    const selectedSchool = filteredSchools.find(
        (s) => s.id?.toString() === schoolId?.toString(),
    );
    const filteredSections = Array.isArray(selectedSchool?.sections)
        ? selectedSchool.sections
        : [];

    // Lógica de auto-resolución para SubAdmin delegada al hook
    useAcademicAutoResolver({
        faculties: safeFaculties,
        isSubadmin,
    });

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Facultad */}
            <FormField
                control={control}
                name="faculty_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Facultad</FormLabel>
                        <Select
                            onValueChange={(v) => {
                                field.onChange(v);
                                setValue('school_id', '');
                                setValue('section_id', '');
                            }}
                            value={field.value}
                            disabled={isTeacher}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {safeFaculties.map((f) => (
                                    <SelectItem
                                        key={f.id}
                                        value={f.id?.toString()}
                                    >
                                        {f.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {!isSubadmin && (
                <FormField
                    control={control}
                    name="school_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Escuela</FormLabel>
                            <Select
                                onValueChange={(v) => {
                                    field.onChange(v);
                                    setValue('section_id', '');
                                }}
                                value={field.value}
                                disabled={!facultyId || isTeacher}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {filteredSchools.map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={s.id.toString()}
                                        >
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {!isSubadmin && (
                <FormField
                    control={control}
                    name="section_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sección</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!facultyId || !schoolId || isTeacher}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {filteredSections.map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={s.id.toString()}
                                        >
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
    );
}
