import { type Faculty } from '@/shared/types';

export interface PersonFlowProps {
    roles: any[];
    faculties: Faculty[];
    mode: 'individual' | 'masivo';
    onBack: () => void;
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

    rows: any[];
    report: any;
}