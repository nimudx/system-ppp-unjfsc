import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import GlobalLoader from '@/shared/components/global-loader';
import { initializeTheme } from '@/shared/hooks/use-appearance';
import { modulePagePath } from '@/shared/lib/inertia';

const appName = import.meta.env.VITE_APP_NAME || 'UNJFSC';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            modulePagePath(name),
            import.meta.glob('./modules/*/pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <GlobalLoader />
                <App {...props} />
            </StrictMode>,
        );
    },
    // GlobalLoader reemplaza la barra de progreso superior de Inertia.
    progress: false,
});

// This will set light / dark mode on load...
initializeTheme();
