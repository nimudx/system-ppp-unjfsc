import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface UseAcademicTableOptions<T = any> {
    endpoint: string;
    initialData: any;
    isAdmin: boolean;
    pageSize?: number;
    responseKey?: string;
    localSearchFn?: (item: T, search: string) => boolean;
    extraParams?: object; // optional statically assigned params like target_role_id
}

export function useAcademicTable<T = any>({
    endpoint,
    initialData,
    isAdmin,
    pageSize = 15,
    responseKey = 'data', // By default fallback to raw data if we can't find it dynamically
    localSearchFn = () => true,
    extraParams = {}
}: UseAcademicTableOptions<T>) {

    // ── ESTADOS GLOBALES ──────────────────────────────────────────────────
    const [data, setData] = useState<any>(initialData);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [activeFilters, setActiveFilters] = useState<any>(null);
    const [filterClearKey, setFilterClearKey] = useState(0);
    const [localPage, setLocalPage] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const [lastFetchConf, setLastFetchConf] = useState({ url: endpoint, params: extraParams });

    const [bodyVisible, setBodyVisible] = useState(true);
    const prevIsSearching = useRef(false);

    const isLocalPagination = Array.isArray(data);

    // ── CICLOS DE VIDA ───────────────────────────────────────────────────
    useEffect(() => {
        if (isAdmin) {
            if (isSearching) setBodyVisible(false);
            else if (prevIsSearching.current) requestAnimationFrame(() => setBodyVisible(true));
            prevIsSearching.current = isSearching;
        }
    }, [isSearching, isAdmin]);

    useEffect(() => {
        if (!isAdmin) {
            setData(initialData);
            setLocalPage(1);
        }
    }, [initialData, isAdmin]);

    const allCurrentData: T[] = isLocalPagination ? data : (data?.data || []);
    const selectedItem = allCurrentData.find((a: any) => a.id === selectedId);

    useEffect(() => {
        if (selectedId !== null && !allCurrentData.find((a: any) => a.id === selectedId)) {
            setSelectedId(null);
        }
    }, [data, selectedId]);

    // ── ACCIONES API ─────────────────────────────────────────────────────
    const fetchData = async (url: string = endpoint, params: any = {}, preserveSelection: boolean = false) => {
        try {
            setIsSearching(true);
            const mergedParams = { ...extraParams, ...params };
            const res = await axios.get(url, { params: mergedParams });
            setData(res.data[responseKey] ?? res.data); // e.g. res.data.assignments

            // Si no estamos refrescando silenciosamente, deseleccionamos
            if (!preserveSelection) {
                setSelectedId(null);
            }

            setLastFetchConf({ url, params: mergedParams });
        } catch (error) {
            console.log(error);
            toast.error("Error al obtener los datos. waaa");
        } finally {
            setIsSearching(false);
        }
    };

    const refreshCurrentData = async () => {
        // En docente, Inertia.reload() o el hook useForm ya envían initialData fresco.
        // Solo recargamos en background si es Admin (paginador backend).
        if (isAdmin) {
            await fetchData(lastFetchConf.url, lastFetchConf.params, true);
        }
    };

    const resetTable = () => {
        setData(isAdmin ? { data: [] } : initialData);
        setActiveFilters(null);
        setSelectedId(null);
    };

    const handleFilter = (values: any) => {
        const isEmpty = !values.faculty_id && !values.school_id && !values.section_id;
        if (isEmpty) { resetTable(); return; }
        setActiveFilters(values);
        setSearch("");
        fetchData(endpoint, values);
    };

    const handleBackendSearch = () => {
        if (!search.trim()) {
            resetTable();
            setFilterClearKey(k => k + 1);
            return;
        }
        setFilterClearKey(k => k + 1);
        setActiveFilters(null);
        fetchData(endpoint, { search: search.trim() });
    };

    const handlePageChange = (url: string | null) => {
        if (!url) return;
        const params = search.trim() ? { search: search.trim() } : activeFilters || {};
        fetchData(url, params);
    };

    // ── COMPUTACIONES PARA PAGINACIÓN Y RENDER ────────────────────────────
    const allLocalFiltered = isLocalPagination
        ? (data as T[]).filter((a: T) => {
            if (!search.trim()) return true;
            return localSearchFn(a, search.toLowerCase());
        })
        : [];

    const localTotalPages = isLocalPagination ? Math.ceil(allLocalFiltered.length / pageSize) : 1;

    const displayData: T[] = isAdmin
        ? (data?.data || [])
        : allLocalFiltered.slice((localPage - 1) * pageSize, localPage * pageSize);

    return {
        data, displayData, allLocalFiltered,
        selectedId, selectedItem, setSelectedId,
        isSearching, bodyVisible,
        search, setSearch, activeFilters, filterClearKey, handleFilter, handleBackendSearch,
        localPage, setLocalPage, localTotalPages, handlePageChange,
        setData, resetTable, refreshCurrentData
    };
}