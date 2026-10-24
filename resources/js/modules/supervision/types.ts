import type { DocumentRequirement } from '@/modules/documents';
export interface Faculties {
    id: number;
    name: string;
    schools: {
        id: number;
        name: string;
        sections: { id: number; name: string }[];
    }[];
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
