import { useCallback, useEffect, useState } from 'react';
import { workflow, type CompanyRequest } from '../services/company-workflow';

/**
 * Consulta la solicitud de empresa del estudiante.
 *
 * Si la página ya recibió la solicitud desde el servidor (prop
 * `companyRequest`), se usa como estado inicial y no se hace la petición
 * extra: así Pasantía y Formalización no muestran un estado vacío mientras
 * cargan.
 */
export function useCompanyRequest(initial?: CompanyRequest | null) {
    const hasInitial = initial !== undefined;
    const [current, setCurrent] = useState<CompanyRequest | null>(
        initial ?? null,
    );
    const [loading, setLoading] = useState(!hasInitial);
    const [error, setError] = useState('');
    const reload = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        try {
            const result = await workflow.current(signal);
            setCurrent(result.data);
            setError('');
        } catch (cause) {
            if (signal?.aborted) return;
            setError(
                cause instanceof Error
                    ? cause.message
                    : 'No se pudo consultar tu solicitud.',
            );
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);
    useEffect(() => {
        if (hasInitial) return;

        const controller = new AbortController();
        void reload(controller.signal);
        return () => controller.abort();
    }, [hasInitial, reload]);
    return { current, loading, error, reload };
}
