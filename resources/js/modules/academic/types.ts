export interface Semester {
    id: number;
    code: string;
    cycle: string;
    status: number;
}

export interface Section {
    id: number;
    name: string;
    status: number;
}

export interface School {
    id: number;
    name: string;
    status: number;
    sections: Section[];
}

export interface Faculty {
    id: number;
    name: string;
    schools: School[];
}
