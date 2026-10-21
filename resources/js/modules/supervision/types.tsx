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
