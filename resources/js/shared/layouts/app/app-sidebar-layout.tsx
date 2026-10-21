import { AppContent } from '@/shared/components/app-content';
import { AppShell } from '@/shared/components/app-shell';
import { AppSidebar } from '@/shared/components/app-sidebar';
import { AppSidebarHeader } from '@/shared/components/app-sidebar-header';
import { ExceptionHandler } from '@/shared/components/exception-handler';
import { HistoricNotice } from '@/shared/components/historic-notice';
import { AssignmentAccessNotice } from '@/shared/components/assignment-access-notice';
import { Toaster } from 'sonner';
import type { AppLayoutProps } from '@/shared/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <Toaster position="top-center" richColors closeButton />
            <ExceptionHandler />
            <HistoricNotice />
            <AssignmentAccessNotice />
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
