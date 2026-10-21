import { Toaster } from 'sonner';
import { AppContent } from '@/shared/components/layout/app-content';
import { AppShell } from '@/shared/components/layout/app-shell';
import { AppSidebar } from '@/shared/components/layout/app-sidebar';
import { AppSidebarHeader } from '@/shared/components/layout/app-sidebar-header';
import { AssignmentAccessNotice } from '@/shared/components/layout/assignment-access-notice';
import { ExceptionHandler } from '@/shared/components/layout/exception-handler';
import { HistoricNotice } from '@/shared/components/layout/historic-notice';
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
