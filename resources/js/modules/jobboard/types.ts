export type VacancyStatus =
    | 'draft'
    | 'pending_review'
    | 'observed'
    | 'rejected'
    | 'published'
    | 'closed';

export type VacancyType = 'practicas' | 'empleo';

export type VacancyModality = 'presencial' | 'remoto' | 'hibrido';

export type VacancyCloseReason = 'filled' | 'expired' | 'withdrawn';

export interface VacancySchool {
    id: number;
    name: string;
    faculty: string | null;
}

export interface VacancyCompany {
    id: number;
    name: string;
}

export interface VacancyContact {
    ruc: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    representative_name: string | null;
    representative_phone: string | null;
}

export interface VacancySummary {
    id: number;
    title: string;
    status: VacancyStatus;
    status_label: string;
    type: VacancyType;
    type_label: string;
    modality: VacancyModality;
    modality_label: string;
    area_name: string | null;
    location: string | null;
    positions_count: number;
    deadline_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    published_at: string | null;
    closed_at: string | null;
    closed_reason: VacancyCloseReason | null;
    closed_reason_label: string | null;
    review_comment: string | null;
    is_new: boolean;
    candidates_count: number;
    company: VacancyCompany | null;
    schools: VacancySchool[];
}

export interface VacancyDetail extends VacancySummary {
    description: string | null;
    requirements: string | null;
    reviewed_at: string | null;
    contact: VacancyContact | null;
}

export interface SchoolOption {
    id: number;
    name: string;
    faculty: string | null;
}

export interface SelectOption {
    value: string;
    label: string;
}

export interface VacancyFormOptions {
    types: SelectOption[];
    modalities: SelectOption[];
}

export interface CompanyJobBoardIndexProps {
    vacancies: VacancyDetail[];
    company: {
        name: string;
        ruc: string | null;
    };
}

export interface CompanyJobBoardFormProps {
    vacancy: VacancyDetail | null;
    schools: SchoolOption[];
    options: VacancyFormOptions;
}

export type CandidateStatus =
    | 'proposed'
    | 'contacted'
    | 'hired'
    | 'discarded';

export interface StudentSummary {
    assignment_id: number;
    name: string | null;
    dni: string | null;
    email: string | null;
    code: string | null;
    school: string | null;
    section: string | null;
    semester: string | null;
    record_approved: boolean;
    cv: { name: string; url: string } | null;
}

export interface EligibleStudent extends StudentSummary {
    already_proposed: boolean;
}

export interface VacancyCandidateSummary {
    id: number;
    vacancy_id: number;
    status: CandidateStatus;
    status_label: string;
    note: string | null;
    status_note: string | null;
    created_at: string | null;
    proposed_by: string | null;
    proposed_by_assignment_id: number;
    student?: StudentSummary;
}

export interface AdminVacancyDetail extends VacancyDetail {
    reviewed_by: string | null;
    candidates: VacancyCandidateSummary[];
}

export interface TeacherVacancyDetail extends VacancyDetail {
    candidates: VacancyCandidateSummary[];
    students: EligibleStudent[];
}

export interface AdminJobBoardIndexProps {
    vacancies: VacancySummary[];
    statuses: SelectOption[];
    candidate_statuses: SelectOption[];
    schools: SchoolOption[];
    filters: {
        status: string | null;
    };
}

export interface TeacherJobBoardIndexProps {
    vacancies: VacancySummary[];
    teacher: {
        assignment_id: number;
        section: string | null;
        school: string | null;
        semester: string | null;
    };
}

