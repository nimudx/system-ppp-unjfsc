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

export type SuperAdminStats = {
    companies: { total: number; thisMonth: number };
    users: { total: number; activePercent: number };
    security: { failedToday: number; lockoutsToday: number };
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
