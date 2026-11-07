import type { NotificationSummary, Semester } from './session';

export type AuthAssignment = {
    id: number;
    role: string;
    initials: string;
    context: string;
    color?: string;
    selected: boolean;
};

export type User = {
    id: number;
    name: string;
    email: string;
    type_id: number;
    type: string;
    profile_name: string;
    assignments?: AuthAssignment[];
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    profiles?: { academic: AuthAssignment[]; staff: AuthAssignment[] };
    academic?: {
        semesters: Semester[];
        assignments: AuthAssignment[];
        role_id: number | null;
        selected_semester_id: number | null;
    };
    notifications?: NotificationSummary[];
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
