import type { Faculty } from '@/modules/academic';
import type { DocumentTypeOption } from '@/modules/documents';
import type { RoleOption } from '@/modules/registration';
export interface ResourceItem {
    id: number;
    name: string;
    description: string | null;
    level: number;
    role_id?: number | null;
    created_at: string;
    documents?: {
        id: number;
        path: string;
        name?: string;
        type?: { name: string };
    }[];
    /** Metadatos adicionales que envía el listado del administrador. */
    uploader_name?: string | null;
    uploader_kind?: string | null;
    target_role_name?: string | null;
    document_type_name?: string | null;
    location_name?: string | null;
}
export interface ResourceFilters {
    faculty_id: number | string;
    school_id: number | string;
    section_id: number | string;
}
export interface ResourcePageProps {
    resources: ResourceItem[];
    documentTypes: DocumentTypeOption[];
    roles: RoleOption[];
    faculties: Faculty[];
    initialFilters: ResourceFilters | null;
}
export type ResourceForm = {
    name: string;
    description: string;
    role_id: string | null;
    level: number;
    document_type_id: string;
    location_id: string | null;
    file: File | null;
    semester_id: number | null;
};
