/**
 * Estados que envía el backend. Los valores deben coincidir con los enums de
 * cada dominio en `app/Domains` y con los seeds de la base de datos.
 */

export const APPROVAL_STATUS = {
    REJECTED: 0,
    APPROVED: 1,
    PENDING: 2,
} as const;

export const ACCESS_STATUS = {
    BLOCKED: 0,
    FULL: 1,
    LIMITED: 2,
    READ_ONLY: 3,
} as const;

export const REVIEW_STATUS = {
    NONE: 0,
    UNDER_REVIEW: 1,
    OBSERVED: 2,
} as const;

/** Estado de un documento dentro de un expediente. */
export const DOCUMENT_STATUS = {
    NOT_STARTED: 0,
    APPROVED: 1,
    PENDING: 2,
    OBSERVED: 3,
} as const;

/** Estado de una entrega de práctica (supervisión). */
export const PRACTICE_SUBMISSION_STATUS = {
    APPROVED: 1,
    PENDING: 2,
    OBSERVED: 3,
} as const;

/** Dictamen de una solicitud de gestión de asignación. */
export const REQUEST_APPROVAL_STATUS = {
    APPROVED: 1,
    REJECTED: 3,
} as const;
