import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const STORAGE_KEY = 'jobboard-menu-badge-seen';

function readSeen(): boolean {
    if (typeof window === 'undefined') return false;

    try {
        return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

/** Rutas internas del módulo (no incluye la vitrina pública `/bolsa`). */
function isJobBoardSection(url: string): boolean {
    try {
        const { pathname } = new URL(url, 'http://localhost');
        const sections = [
            '/empresa/bolsa',
            '/bolsa/administracion',
            '/bolsa/vacantes',
        ];

        return sections.some(
            (section) =>
                pathname === section || pathname.startsWith(`${section}/`),
        );
    } catch {
        return false;
    }
}

/**
 * Indica si la etiqueta "Nuevo" de Bolsa laboral debe mostrarse en el menú.
 *
 * Se apaga cuando vence `jobboard.menu_badge_until` o cuando el usuario ya
 * visitó una sección interna del módulo. La marca en localStorage es solo una
 * comodidad por navegador y nunca debe romper el render.
 */
export function useJobBoardMenuBadge(): boolean {
    const { url, props } = usePage();
    const insideSection = isJobBoardSection(url);

    useEffect(() => {
        if (!insideSection) return;

        try {
            window.localStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // El navegador puede bloquear localStorage (modo privado).
        }
    }, [insideSection]);

    if (insideSection || readSeen()) return false;

    // La etiqueta se apaga con la primera fecha que venza: la del menú o la
    // del lanzamiento experimental del módulo.
    const expiries = [
        props.jobboard?.menuBadgeUntil,
        props.jobboard?.experimentalUntil,
    ]
        .filter((value): value is string => Boolean(value))
        .map((value) => new Date(`${value}T23:59:59`))
        .filter((date) => !Number.isNaN(date.getTime()));

    if (expiries.length === 0) return false;

    const expiry = new Date(
        Math.min(...expiries.map((date) => date.getTime())),
    );

    return new Date() <= expiry;
}
