// Indicadores reales que envía DashboardService para cada rol.

export type StudentRow = {
    id: number;
    name: string;
    company: string;
    address: string | null;
    status: {
        label: string;
        tone: 'success' | 'warning' | 'danger' | 'info' | 'muted';
    };
};

export type CompanyStats = {
    company: {
        id: number;
        name: string;
        ruc: string;
        razon: string | null;
        address: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        representative_name: string | null;
        representative_phone: string | null;
        logo_url: string | null;
        activated_at: string | null;
    } | null;
    profile: {
        percent: number;
        completed: number;
        total: number;
        missing: string[];
    };
    vacancies: {
        total: number;
        published: number;
        draft: number;
        pendingReview: number;
        observed: number;
        closed: number;
        thisMonth: number;
        positions: number;
        views: number;
    };
    candidates: {
        total: number;
        proposed: number;
        contacted: number;
        hired: number;
        discarded: number;
    };
    requests: {
        total: number;
        awaitingCompany: number;
        accepted: number;
        declined: number;
        thisMonth: number;
    };
    recentVacancies: {
        id: number;
        title: string;
        status: string;
        status_label: string;
        type_label: string;
        modality_label: string;
        positions_count: number;
        candidates_count: number;
        views_count: number;
        published_at: string | null;
        updated_at: string | null;
        deadline_at: string | null;
    }[];
    recentRequests: {
        id: number;
        student: string;
        school: string | null;
        state: string;
        state_label: string;
        updated_at: string | null;
    }[];
    tasks: {
        title: string;
        detail: string;
        href: string;
        priority: 'high' | 'medium' | 'low';
    }[];
};

export type SuperAdminStats = {
    semester: string | null;
    companies: { total: number; thisMonth: number };
    users: { total: number; activePercent: number };
    security: { failedToday: number; lockoutsToday: number };
    operations: {
        students: { total: number; thisMonth: number };
        teachers: { total: number };
        internships: { total: number; withSupervisorPercent: number };
        pendingDocuments: number;
        pendingCompanies: number;
        pendingSubmissions: number;
        pendingVacancies: number;
        publishedVacancies: number;
        resources: number;
    };
    usersByType: { name: string; total: number; percent: number }[];
    bySchool: { school: string; students: number }[];
    recentUsers: {
        id: number;
        name: string;
        email: string;
        type: string | null;
        created_at: string | null;
    }[];
    tasks: {
        title: string;
        detail: string;
        href: string;
        priority: 'high' | 'medium' | 'low';
    }[];
    storage: {
        usedBytes: number;
        freeBytes: number | null;
        totalBytes: number | null;
    };
    server: { cpuPercent: number | null; memoryPercent: number | null };
    recentActions: { action: string; at: string | null }[];
};

export type AdminStats = {
    students: { total: number; thisMonth: number };
    teachers: { total: number; schools: number };
    internships: { total: number; withSupervisorPercent: number };
    pendingDocuments: number;
    bySchool: { school: string; students: number }[];
    alerts: {
        title: string;
        detail: string;
        level: 'warning' | 'danger' | 'info';
    }[];
};

export type TeacherStats = {
    semester: string | null;
    students: number;
    pendingVisits: number;
    pendingReports: { total: number; plans: number; reports: number };
    unreadMessages: number;
    agenda: {
        date: string;
        event: string;
        name: string;
        company: string | null;
    }[];
    recentStudents: StudentRow[];
};

export type SupervisorStats = {
    students: { total: number; companies: number };
    visits: { done: number; approvedPercent: number };
    validatedReports: { total: number; lastAt: string | null };
    incidents: number;
    route: StudentRow[];
    statuses: StudentRow[];
};

export type StudentDocumentStatus = 0 | 1 | 2 | 3;

export type StudentDocument = {
    code: string;
    title: string;
    status: StudentDocumentStatus;
    status_label: string;
    comment: string | null;
    updated_at: string | null;
};

export type StudentSubmission = {
    type: 'plan' | 'report';
    title: string;
    status: StudentDocumentStatus;
    status_label: string;
    grade: number | null;
    comment: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    reviewer: string | null;
    file_url: string | null;
    attempts: number;
    can_submit: boolean;
};

export type StudentModule = {
    module: number;
    status: StudentDocumentStatus;
    status_label: string;
    grade: number | null;
    evaluated_at: string | null;
};

export type StudentActivity = {
    title: string;
    detail: string | null;
    at: string | null;
    tone: 'success' | 'warning' | 'danger' | 'info' | 'muted';
};

export type StudentNotification = {
    id: number;
    type: string;
    title: string;
    document: string | null;
    status: number | null;
    comment: string | null;
    at: string | null;
    read: boolean;
};

export type StudentTask = {
    title: string;
    detail: string;
    href: string;
    priority: 'high' | 'medium' | 'low';
};

export type StudentStats = {
    meta: {
        name: string;
        code: string | null;
        school: string | null;
        faculty: string | null;
        semester: string | null;
        company: string | null;
        position: string | null;
        boss: string | null;
        start_date: string | null;
        end_date: string | null;
        internship_type: string | null;
    };
    dossier: {
        approved: number;
        uploaded: number;
        total: number;
        percent: number;
        items: StudentDocument[];
    };
    cv: {
        uploaded: boolean;
        updated_at: string | null;
        file_url: string | null;
    };
    formalization: {
        state: string;
        state_label: string;
        percent: number;
        company_state: string | null;
        company_state_label: string;
        data_status: number;
        validation_status: number;
        approved_documents: number;
        total_documents: number;
        documents: StudentDocument[];
    };
    annexes: {
        approved: number;
        uploaded: number;
        total: number;
        percent: number;
        items: StudentDocument[];
    };
    practice: {
        percent: number;
        days_total: number;
        days_elapsed: number;
        days_left: number;
        active: boolean;
        not_started: boolean;
        finished: boolean;
        start_date: string | null;
        end_date: string | null;
    };
    submissions: StudentSubmission[];
    supervision: {
        approved: number;
        total: number;
        percent: number;
        modules: StudentModule[];
    };
    notifications: {
        unread: number;
        recent: StudentNotification[];
    };
    activity: StudentActivity[];
    tasks: StudentTask[];
};
