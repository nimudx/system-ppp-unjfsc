export interface DocumentFile {
    id: number;
    name?: string;
    path?: string | null;
    approval_status: number;
    comment?: string | null;
    justification?: string;
    grade?: number;
    created_at?: string;
    approved_at?: string | null;
    size?: number;
    /** Evento del historial: subida del archivo o dictamen del revisor. */
    event?: 'upload' | 'review';
    /** Identificador único del evento para usarlo como key. */
    event_id?: string;
    /** Nombre del docente que emitió el dictamen. */
    reviewed_by?: string | null;
}
export interface DocumentRequirement {
    code: string;
    title: string;
    status: number;
    locked?: boolean;
    has_template?: boolean;
    hasTemplate?: boolean;
    latest?: DocumentFile | null;
    history?: DocumentFile[];
}
export interface DocumentTypeOption {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    roles?: { id: number; name: string }[];
}
