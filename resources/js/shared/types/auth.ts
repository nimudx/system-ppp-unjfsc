export type Assignment = {
    id: number;
    role: string;
    initials: string;
    context: string;
    color: string;
    selected: boolean;
};

export type User = {
    id: number;
    name: string;
    email: string;
    type_id: number;
    type: string;
    profile_name: string;
    assignments?: Assignment[];
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
