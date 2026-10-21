import type { Semester } from '@/modules/academic';
import type { Auth } from '@/shared/types/auth';
export interface BusinessError {
    message: string;
    code?: string;
    status?: number;
}
declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            role: number | null;
            sidebarOpen: boolean;
            flash: {
                message?: string;
                success?: string;
                error?: string | BusinessError;
            };
            academic: {
                historicMode: boolean;
                accessStatus: number | null;
                currentSemester: Semester | null;
                selectedAssignmentId?: number;
                sessionToken: string | null;
            };
            [key: string]: unknown;
        };
    }
}
