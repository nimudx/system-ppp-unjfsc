import { useCallback, useEffect, useState } from 'react';
import { workflow, type CompanyRequest } from '../services/company-workflow';

export function useCompanyRequest() {
    const [current, setCurrent] = useState<CompanyRequest | null>(null);
    const [loading, setLoading] = useState(true);
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
        const controller = new AbortController();
        void reload(controller.signal);
        return () => controller.abort();
    }, [reload]);
    return { current, loading, error, reload };
}
