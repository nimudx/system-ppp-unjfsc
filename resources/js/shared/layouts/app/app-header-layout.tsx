import { AppContent } from '@/shared/components/app-content';
import { AppHeader } from '@/shared/components/app-header';
import { AppShell } from '@/shared/components/app-shell';
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
