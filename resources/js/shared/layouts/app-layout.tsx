import AppLayoutTemplate from '@/shared/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/shared/types';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);
