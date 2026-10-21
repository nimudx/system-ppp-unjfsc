import type { DocumentRequirement } from '@/modules/documents/types';
export interface PersonProfile {
    id: number;
    names: string;
    surnames: string;
    dni: string;
    phone?: string | null;
    gender?: string | null;
    path_photo?: string | null;
    path_banner?: string | null;
}
export interface AssignmentRecord {
    id: number;
    user: { id: number; name: string; email: string; person: PersonProfile };
    role_id: number;
    role?: { id: number; name: string };
    semester_id: number;
    section_id: number | null;
    access_status: number;
    approval_status: number;
    review_status: number;
    status: number;
    section: {
        id: number;
        name: string;
        faculty_id: number;
        school_id: number;
        faculty?: { id: number; name: string };
        school: {
            id: number;
            name: string;
            faculty_id: number;
            faculty: { id: number; name: string };
        };
    } | null;
    dossiers?: { id: number; approval_status: number; latest?: boolean }[];
    requirements?: DocumentRequirement[];
}
export interface DossierDetail {
    dossier: { id: number; approval_status?: number };
    requirements: DocumentRequirement[];
}
