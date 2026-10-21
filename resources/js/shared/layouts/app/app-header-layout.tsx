import { AppContent } from '@/shared/components/layout/app-content';
import { AppHeader } from '@/shared/components/layout/app-header';
import { AppShell } from '@/shared/components/layout/app-shell';
import type { AppLayoutProps } from '@/shared/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <AppShell>
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
