/**
 * Identificadores de rol y tipo de usuario alineados con la base de datos.
 * Úsalos en lugar de números sueltos para que un cambio de seed no rompa la UI.
 */
export const ROLES = {
    ADMIN: 1,
    SUBADMIN: 2,
    TEACHER: 3,
    SUPERVISOR: 4,
    STUDENT: 5,
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const USER_TYPES = {
    ADMIN: 1,
    ACADEMIC: 2,
    COMPANY: 3,
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];
