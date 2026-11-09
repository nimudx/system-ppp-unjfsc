import type { Faculty } from '@/modules/academic';

export interface RoleOption {
    id: number;
    name: string;
}
export type CsvRow = Record<string, string>;
export interface CsvValidationError {
    row: number;
    errors: Record<string, string[] | undefined>;
}
export interface RegistrationReport {
    total: number;
    success_count: number;
    failed_count: number;
    errors: { row: number; dni: string; email: string; message: string }[];
}
export interface RegistrationLookupResponse {
    message: string;
    data: {
        user_exists?: boolean;
        person_exists?: boolean;
        user_id?: number;
        person?: { id: number; dni: string; names: string; surnames: string };
    };
}

export interface PersonFlowProps {
    roles: RoleOption[];
    faculties: Faculty[];
    mode: 'individual' | 'masivo';
}

export interface PersonInitialState {
    role_id: string;
    faculty_id: string;
    school_id: string;
    section_id: string;

    email: string;
    user_exists: boolean;
    user_id: number | null;

    person_exists: boolean;
    person_id: number | null;
    dni: string;
    names: string;
    surnames: string;
    gender: string;

    rows: CsvRow[];
    report: RegistrationReport | null;
    file?: File;
}
