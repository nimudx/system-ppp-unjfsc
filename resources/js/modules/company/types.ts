export interface CompanyProfile {
    id: number;
    name: string;
    ruc: string;
    razon?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    path_photo?: string | null;
    path_banner?: string | null;
}
