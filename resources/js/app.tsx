import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './shared/hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'UNJFSC';

const pages = import.meta.glob('./modules/**/*.tsx');

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

    resolve: async (name) => {
        const aliases: Record<string, string> = {
            landing: 'public/pages/landing',
            'company/register': 'company/pages/register',
            'auth/login': 'identity/pages/auth/login',
            'auth/register': 'identity/pages/auth/register',
        };

        const page = aliases[name] ?? name;
        const path = `./modules/${page}.tsx`;
        const resolver = pages[path];

        if (!resolver) {
            throw new Error(
                `Página de Inertia no encontrada: "${name}". Ruta buscada: "${path}"`,
            );
        }

        return resolvePageComponent(path, pages);
    },

    setup({ el, App, props }) {
        createRoot(el).render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },

    progress: {
        color: '#4B5563',
    },
});

initializeTheme();