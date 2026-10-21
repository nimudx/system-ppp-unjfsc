import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { type Faculty } from '@/shared/types';

interface UseAcademicAutoResolverOptions {
    faculties: Faculty[];
    isSubadmin: boolean;
}

/**
 * Observa los cambios de faculty_id cuando el rol es SubAdmin
 * y auto-resuelve la primera escuela y primera sección disponibles.
 * No contiene lógica de presentación: sólo efectos sobre el formulario.
 */
export function useAcademicAutoResolver({
    faculties,
    isSubadmin,
}: UseAcademicAutoResolverOptions): void {
    const { setValue, control } = useFormContext();

    const facultyId = useWatch({ control, name: 'faculty_id' });
    const roleId = useWatch({ control, name: 'role_id' });

    useEffect(() => {
        // Solo actúa si el rol activo es SubAdmin y hay una facultad seleccionada
        if (!isSubadmin || !facultyId) return;

        const safeFaculties = Array.isArray(faculties) ? faculties : [];

        const selectedFaculty = safeFaculties.find((f) => f.id?.toString() === facultyId?.toString());
        const firstSchool = selectedFaculty?.schools?.[0] ?? null;

        if (!firstSchool) {
            toast.error('Esta facultad no tiene escuelas configuradas. Verifique la configuración académica.');
            setValue('school_id', '');
            setValue('section_id', '');
            return;
        }

        const firstSection = firstSchool.sections?.[0] ?? null;

        if (!firstSection) {
            toast.error('La primera escuela de esta facultad no tiene secciones configuradas. Verifique la configuración académica.');
            setValue('school_id', '');
            setValue('section_id', '');
            return;
        }

        setValue('school_id', firstSchool.id.toString());
        setValue('section_id', firstSection.id.toString());

        // Sólo reacciona cuando cambia la facultad o el rol
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facultyId, roleId]);
}
