import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/utils';

/** Retardo antes de mostrar el overlay: evita parpadeos en navegaciones rápidas. */
const SHOW_DELAY_MS = 180;

/** Tiempo mínimo visible una vez mostrado, para que la aparición no sea brusca. */
const MIN_VISIBLE_MS = 350;

/** Red de seguridad: si Inertia nunca emite `finish`, el overlay se oculta. */
const MAX_VISIBLE_MS = 30000;

/** Debe coincidir con la transición de opacidad definida en el componente. */
const FADE_OUT_MS = 220;

/** Pequeña espera para que la página nueva se pinte antes de desvanecer el overlay. */
const PAINT_DELAY_MS = 48;

const SPLASH_ID = 'app-loading-splash';

/**
 * Pantalla de carga global del sistema.
 *
 * Se apoya en los eventos de Inertia (`start`, `navigate` y `finish`) y en un
 * temporizador de respaldo. También retira la pantalla de carga estática que
 * pinta `resources/views/app.blade.php` antes de que React monte la aplicación.
 */
export default function GlobalLoader() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const splash = document.getElementById(SPLASH_ID);

        if (!splash) {
            return;
        }

        let dismissed = false;
        let removeTimer: number | null = null;

        const dismiss = () => {
            if (dismissed) {
                return;
            }

            dismissed = true;
            splash.classList.add('is-leaving');

            removeTimer = window.setTimeout(() => {
                removeTimer = null;
                splash.remove();
            }, FADE_OUT_MS);
        };

        // El frame permite que el fundido se aprecie; el temporizador evita
        // que una pestaña en segundo plano deje la pantalla visible.
        const frame = window.requestAnimationFrame(dismiss);
        const fallback = window.setTimeout(dismiss, 300);

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(fallback);

            if (removeTimer !== null) {
                window.clearTimeout(removeTimer);
            }
        };
    }, []);

    useEffect(() => {
        let isVisible = false;
        let activeVisits = 0;
        let shownAt = 0;

        let showTimer: number | null = null;
        let hideTimer: number | null = null;
        let paintTimer: number | null = null;
        let safetyTimer: number | null = null;

        const setOverlayVisible = (next: boolean) => {
            isVisible = next;
            setVisible(next);
        };

        const cancelHide = () => {
            if (hideTimer !== null) {
                window.clearTimeout(hideTimer);
                hideTimer = null;
            }

            if (paintTimer !== null) {
                window.clearTimeout(paintTimer);
                paintTimer = null;
            }
        };

        const clearAllTimers = () => {
            cancelHide();

            if (showTimer !== null) {
                window.clearTimeout(showTimer);
                showTimer = null;
            }

            if (safetyTimer !== null) {
                window.clearTimeout(safetyTimer);
                safetyTimer = null;
            }
        };

        const startSafetyTimeout = () => {
            if (safetyTimer !== null) {
                window.clearTimeout(safetyTimer);
            }

            safetyTimer = window.setTimeout(() => {
                safetyTimer = null;
                activeVisits = 0;
                setOverlayVisible(false);
            }, MAX_VISIBLE_MS);
        };

        const beginVisit = () => {
            activeVisits += 1;

            // Una navegación nueva invalida cualquier ocultamiento pendiente.
            cancelHide();

            if (isVisible) {
                return;
            }

            if (showTimer !== null) {
                return;
            }

            showTimer = window.setTimeout(() => {
                showTimer = null;

                if (activeVisits <= 0) {
                    return;
                }

                shownAt = Date.now();
                setOverlayVisible(true);
                startSafetyTimeout();
            }, SHOW_DELAY_MS);
        };

        const endVisit = () => {
            activeVisits = Math.max(0, activeVisits - 1);

            if (activeVisits > 0) {
                return;
            }

            if (showTimer !== null) {
                window.clearTimeout(showTimer);
                showTimer = null;
            }

            if (safetyTimer !== null) {
                window.clearTimeout(safetyTimer);
                safetyTimer = null;
            }

            if (!isVisible) {
                return;
            }

            const elapsed = Date.now() - shownAt;
            const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

            hideTimer = window.setTimeout(() => {
                hideTimer = null;

                // Da tiempo a que la página nueva se pinte debajo del overlay.
                paintTimer = window.setTimeout(() => {
                    paintTimer = null;
                    setOverlayVisible(false);
                }, PAINT_DELAY_MS);
            }, wait);
        };

        const offStart = router.on('start', (event) => {
            const { visit } = event.detail;

            // Prefetch y visitas asíncronas no bloquean la interfaz.
            if (visit.prefetch || visit.async) {
                return;
            }

            beginVisit();
        });

        const offFinish = router.on('finish', (event) => {
            const { visit } = event.detail;

            if (visit.prefetch || visit.async) {
                return;
            }

            endVisit();
        });

        const offNavigate = router.on('navigate', () => {
            // Mantiene sincronizado el estado cuando la navegación cambia.
            cancelHide();
        });

        const offProgress = router.on('progress', () => {
            // Subidas largas: mientras haya progreso, la red de seguridad se renueva.
            if (isVisible && activeVisits > 0) {
                startSafetyTimeout();
            }
        });

        return () => {
            offStart();
            offFinish();
            offNavigate();
            offProgress();
            clearAllTimers();
        };
    }, []);

    return (
        <div
            aria-hidden={!visible}
            role="status"
            aria-live="polite"
            className={cn(
                'fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-[#3F94D5] transition-opacity duration-200 ease-out',
                visible ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
        >
            <div
                className={cn(
                    'flex flex-col items-center gap-8 transition-transform duration-300 ease-out',
                    visible ? 'translate-y-0' : 'translate-y-1',
                )}
            >
                <img
                    src="/ins-unjfsc.png"
                    alt="UNJFSC"
                    width={120}
                    height={120}
                    draggable={false}
                    className="h-auto w-24 drop-shadow-[0_8px_20px_rgba(15,37,67,0.25)] select-none sm:w-28"
                />

                <svg
                    viewBox="0 0 50 50"
                    fill="none"
                    aria-hidden="true"
                    className="size-14 animate-loader-spin text-white motion-reduce:animate-loader-spin-slow"
                >
                    <circle
                        cx="25"
                        cy="25"
                        r="21"
                        stroke="currentColor"
                        strokeOpacity={0.3}
                        strokeWidth={3.5}
                    />
                    <circle
                        cx="25"
                        cy="25"
                        r="21"
                        stroke="currentColor"
                        strokeWidth={3.5}
                        strokeLinecap="round"
                        strokeDasharray="132"
                        strokeDashoffset="99"
                    />
                </svg>

                <span className="sr-only">Cargando…</span>
            </div>
        </div>
    );
}
