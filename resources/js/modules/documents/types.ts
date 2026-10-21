export interface DocumentFile {
    id: number;
    name?: string;
    path?: string | null;
    approval_status: number;
    comment?: string | null;
    justification?: string;
    grade?: number;
    created_at?: string;
    size?: number;
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
