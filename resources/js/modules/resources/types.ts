import type { Faculty } from '@/modules/academic';
import type { DocumentTypeOption } from '@/modules/documents/types';
import type { RoleOption } from '@/modules/registration/types';
export interface ResourceItem {
    id: number;
    name: string;
    description: string;
    level: number;
    created_at: string;
    documents?: {
        id: number;
        path: string;
        name?: string;
        type?: { name: string };
    }[];
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
