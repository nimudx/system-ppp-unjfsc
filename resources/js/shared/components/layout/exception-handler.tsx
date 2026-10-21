import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * ExceptionHandler — Fuente ÚNICA de toasts para respuestas Inertia.
 *
 * Convención:
 * - Todo controlador que devuelva `back()->with('message'|'success'|'error', ...)` será
 *   manejado automáticamente aquí. Los componentes NO deben poner toast.success/error
 *   dentro de onSuccess/onError de router.*.
 * - Los componentes solo usan toast.* para operaciones que NO pasan por Inertia
 *   (fetch puro, validaciones Zod, lógica local).
 *
 * Se usa `router.on('success')` de Inertia para detectar CADA visita exitosa,
 * resolviendo el bug de React donde useEffect no re-dispara si el string flash no cambia.
 */
export function ExceptionHandler() {
    useEffect(() => {
        // Escuchar cada visita Inertia exitosa
        const removeSuccessListener = router.on('success', (event) => {
            const flash = (event.detail.page.props as any).flash;
            if (!flash) return;

            const successMsg = flash.success || flash.message;
            const errorMsg = flash.error;

            // Flash de éxito (string)
            if (successMsg && typeof successMsg === 'string') {
                toast.success(successMsg);
            }

            // Flash de error (string simple)
            if (typeof errorMsg === 'string') {
                toast.error(errorMsg);
            }

            // Flash de error (objeto estructurado con status/code)
            if (errorMsg && typeof errorMsg === 'object' && errorMsg.message) {
                switch (errorMsg.status) {
                    case 409: // Conflictos de lógica (Business Exceptions)
                    case 209: // Códigos personalizados
                        toast.error(errorMsg.message, {
                            description: `Código: ${errorMsg.code}`,
                            duration: 6000,
                        });
                        break;

                    case 403: // Prohibido
                        toast.warning('Acceso denegado', {
                            description: errorMsg.message,
                        });
                        break;

                    case 404: // No encontrado
                        toast.info('No encontrado', {
                            description: errorMsg.message,
                        });
                        break;

                    default:
                        toast.error('Ocurrió un error', {
                            description: errorMsg.message,
                        });
                }
            }
        });

        return () => removeSuccessListener();
    }, []);

    return null;
}
