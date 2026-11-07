import type { DocumentRequirement } from '@/modules/documents';
import type { UserSummary } from '@/shared/types/models';

export interface Faculties {
    id: number;
    name: string;
    schools: {
        id: number;
        name: string;
        sections: { id: number; name: string }[];
    }[];
}

/** Docente o supervisor asignado a un grupo de prácticas. */
export interface GroupAssignment {
    id: number;
    user: UserSummary;
    placement?: {
        internship_type: string;
        company_name: string;
        area_name: string;
        position: string;
        start_date: string;
        end_date: string;
        boss_name: string;
        boss_position: string;
        boss_phone: string;
        boss_email: string;
    } | null;
}

/** Estudiante que puede agregarse a un grupo. */
export interface StudentSummary {
    id: number;
    user: UserSummary;
}

export interface InternshipGroup {
    id: number;
    name: string;
    module?: {
        id: number;
        name: string;
    } | null;
    teacher: GroupAssignment;
    supervisor: GroupAssignment;
    section: {
        id: number;
        name: string;
        school: {
            name: string;
            faculty: {
                name: string;
            };
        };
    };
    students_count?: number;
}

export interface Supervision {
    id: number;
    module_id: number;
    approval_status: number;
}

export interface StudentSupervision {
    id: number;
    user: {
        email: string;
        person: { names: string; surnames: string };
    };
    section: {
        name: string;
        school: {
            name: string;
            faculty: { name: string };
        };
    };
    search_module?: number;
    supervision: Supervision;
}

export interface SupervisionAnnex extends DocumentRequirement {
    evaluation_id?: number;
    supervision_id: number;
    grade?: number;
}
