import { usePage } from '@inertiajs/react';
import { ROLES } from '@/shared/config/roles';

/**
 * Rol activo del usuario en la sesión.
 *
 * `isAdmin` conserva la semántica histórica de la UI: incluye tanto al
 * administrador como al subadministrador.
 */
export function useRole() {
    const { role } = usePage().props;
    const roleId = role ?? null;

    return {
        role: roleId,
        isAdmin: roleId === ROLES.ADMIN || roleId === ROLES.SUBADMIN,
        isSuperAdmin: roleId === ROLES.ADMIN,
        isSubAdmin: roleId === ROLES.SUBADMIN,
        isTeacher: roleId === ROLES.TEACHER,
        isSupervisor: roleId === ROLES.SUPERVISOR,
        isStudent: roleId === ROLES.STUDENT,
    };
}
