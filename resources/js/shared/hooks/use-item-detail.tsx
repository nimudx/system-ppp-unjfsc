import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';

export interface UseItemDetailOptions<T> {
    /** Función que retorna el endpoint HTTP de donde se traerá el detalle */
    fetchUrl: (id: number) => string;
    /** Llave del parámetro en la URL para el Deep Linking. Por defecto 'a' */
    urlQueryKey?: string;
    /** Callback opcional que se ejecuta al cargar los datos con éxito */
    onLoaded?: (data: T) => void;
    /** Callback opcional para manejar errores personalizados */
    onError?: (error: unknown) => void;
}

export function useItemDetail<T = any>({
    fetchUrl,
    urlQueryKey = 'a',
    onLoaded,
    onError,
}: UseItemDetailOptions<T>) {
    const { url } = usePage();

    // 1. Refs para configuraciones y control de peticiones en vuelo
    const configRef = useRef({ fetchUrl, onLoaded, onError });
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        configRef.current = { fetchUrl, onLoaded, onError };
    }, [fetchUrl, onLoaded, onError]);

    // 2. Inicialización y Sincronización con la URL (Inertia & Deep Linking)
    const [selectedId, setSelectedId] = useState<number | null>(() => {
        const searchPart = url.split('?')[1] || '';
        const params = new URLSearchParams(searchPart);
        const id = params.get(urlQueryKey);
        return id ? Number(id) : null;
    });

    // Sincronizar el estado si la URL cambia externamente (ej. por una navegación de Inertia)
    useEffect(() => {
        const searchPart = url.split('?')[1] || '';
        const params = new URLSearchParams(searchPart);
        const id = params.get(urlQueryKey);
        const numericId = id ? Number(id) : null;
        
        if (numericId !== selectedId) {
            setSelectedId(numericId);
        }
    }, [url, urlQueryKey]);

    // 3. Estados de detalle
    const [detailData, setDetailData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 4. Función central de carga de datos (con manejo de Race Conditions)
    const loadDetail = useCallback(async (idToLoad?: number, params?: Record<string, any>) => {
        const targetId = idToLoad || selectedId;
        if (!targetId) return;

        // Cancelar petición previa si existe (Evita Race Conditions)
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        try {
            const { fetchUrl, onLoaded } = configRef.current;
            const res = await axios.get(fetchUrl(targetId), {
                params,
                signal: abortControllerRef.current.signal
            });
            
            setDetailData(res.data);
            if (onLoaded) onLoaded(res.data);
        } catch (error) {
            // Si el error es por cancelación, no hacemos nada (es intencional)
            if (axios.isCancel(error)) return;

            const { onError } = configRef.current;
            if (onError) {
                onError(error);
            } else {
                toast.error('No se pudo cargar la información detallada.');
            }
            setDetailData(null);
        } finally {
            setIsLoading(false);
        }
    }, [selectedId]);

    // 5. Efecto de auto-carga y limpieza al unmount
    useEffect(() => {
        if (selectedId) {
            loadDetail(selectedId);
        } else {
            setDetailData(null);
        }

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [selectedId, loadDetail]);

    // 6. Listener para el botón atrás/adelante del navegador (Popstate)
    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const id = params.get(urlQueryKey);
            setSelectedId(id ? Number(id) : null);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [urlQueryKey]);

    // 7. Handlers de Interfaz
    /** 
     * @param id ID del item a seleccionar
     * @param initialData Datos opcionales para mostrar inmediatamente (Optimistic UI)
     */
    const handleSelect = useCallback((id: number, initialData?: Partial<T>) => {
        if (selectedId === id) return;
        
        // Si tenemos datos iniciales (ej. nombre del alumno desde la tabla), los ponemos ya
        setDetailData(initialData as T || null); 
        setSelectedId(id);
        
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set(urlQueryKey, id.toString());
        window.history.pushState({ id }, '', newUrl.toString());
    }, [selectedId, urlQueryKey]);

    const handleClose = useCallback(() => {
        if (selectedId === null) return;

        setSelectedId(null);
        setDetailData(null);
        
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete(urlQueryKey);
        window.history.pushState({}, '', newUrl.toString());
    }, [selectedId, urlQueryKey]);

    return {
        selectedId,
        detailData,
        isLoading,
        actions: {
            handleSelect,
            handleClose,
            reloadDetail: loadDetail,
            setDetailData,
            setSelectedId
        }
    };
}
