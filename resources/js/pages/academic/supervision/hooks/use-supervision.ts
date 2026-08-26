import { GroupOption } from "@/components/academic/group-selector";
import { TableData, useConfigTable } from "@/hooks/use-config-table";
import { useItemDetail } from "@/hooks/use-item-detail";
import supervision from "@/routes/academic/supervision";
import { StudentSupervision } from "@/types";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
    initialData: any;
    groups: GroupOption[];
    isAdmin: boolean;
}

interface CodeSearchResponse {
    students: {
        data: StudentSupervision[];
        links: any[];
        total: number;
    };
}

export function useSupervision({ initialData, groups, isAdmin }: Props) {
    const { url } = usePage();
    const moduleFromUrl = new URLSearchParams(url.split('?')[1] || '').get('m');

    // --- 1. Estado del Módulo ('m') — manejado manualmente ---
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(
        moduleFromUrl ? Number(moduleFromUrl) : null
    );

    // --- 2. Motor de Detalle: gestiona 'a', fetch de anexos y reloadDetail ---
    const {
        selectedId,
        detailData,
        isLoading: isAnnexesLoading,
        actions: detailActions,
    } = useItemDetail<{ annexes: any[] }>({
        fetchUrl: (id) => supervision.api.annexes.url(id, { query: { module_id: selectedModuleId } }),
        onError: () => toast.error('No se pudieron cargar los anexos.'),
    });

    const annexes = detailData?.annexes ?? [];
    const [selectedAnnexIdx, setSelectedAnnexIdx] = useState(0);
    const currentAnnex = annexes[selectedAnnexIdx] ?? null;

    // Resetear índice al cambiar de estudiante
    useEffect(() => { setSelectedAnnexIdx(0); }, [selectedId]);

    // --- 3. Estados de Grupos y Filtros ---
    const [availableGroups, setAvailableGroups] = useState<GroupOption[]>(groups);
    const [selectedGroup, setSelectedGroup] = useState<GroupOption | null>(null);
    const [isSearchingByCode, setIsSearchingByCode] = useState(false);
    const [codeSearch, setCodeSearch] = useState('');
    const [isFilteringGroups, setIsFilteringGroups] = useState(false);
    const hasAutoSelected = useRef(false);

    // --- 4. Motor de la Tabla ---
    // useMemo para evitar bucle infinito por referencia de objeto
    const tableExtraParams = useMemo(() => ({ module_id: selectedModuleId }), [selectedModuleId]);

    const tableManager = useConfigTable<StudentSupervision>({
        endpoint: selectedGroup && selectedModuleId
            ? `/supervision/api/groups/${selectedGroup.id}/students/filter`
            : '',
        initialData: initialData as unknown as TableData<StudentSupervision>,
        isAdmin,
        pageSize: 10,
        extraParams: tableExtraParams,
        onLocalSearch: (a, term) => {
            const fullName = `${a.user?.person?.surnames || ''} ${a.user?.person?.names || ''}`.toLowerCase();
            const email = (a.user?.email || '').toLowerCase();
            return fullName.includes(term) || email.includes(term);
        },
    });

    const { fetchData, setData: setAssignments, displayData, setSearch, handleFilter: handleAcademicFilter } = tableManager;

    // Item seleccionado (memoizado para evitar recalcular en cada render)
    const selectedItem = useMemo(() =>
        displayData.find((item) =>
            item.id === selectedId &&
            (item.search_module === selectedModuleId || !item.search_module)
        ),
    [displayData, selectedId, selectedModuleId]);

    // --- 5. Efectos de Sincronización ---

    // Autoselección desde URL (notificaciones con ?a=X)
    useEffect(() => {
        if (selectedId && displayData.length > 0 && !hasAutoSelected.current) {
            hasAutoSelected.current = true;
        }
    }, [displayData, selectedId]);

    useEffect(() => { setAvailableGroups(groups); }, [groups]);

    useEffect(() => {
        if (selectedGroup && selectedModuleId) {
            fetchData(
                `/supervision/api/groups/${selectedGroup.id}/students/filter`,
                { module_id: selectedModuleId }
            );
        }
    }, [selectedGroup, selectedModuleId]);

    // --- 6. Acciones de Negocio (lógica fuera de la UI) ---

    /**
     * Seleccionar estudiante: sincroniza 'a' (motor) y 'm' (manual) en la URL.
     */
    const handleSelect = useCallback((id: number, moduleOverride?: number) => {
        const moduleId = moduleOverride ?? selectedModuleId;

        detailActions.handleSelect(id); // Actualiza 'a' en URL + dispara fetch

        if (moduleId) {
            setSelectedModuleId(moduleId);
            // replaceState para añadir 'm' sin crear otra entrada en el historial
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('m', moduleId.toString());
            window.history.replaceState({}, '', newUrl.toString());
        }
    }, [detailActions, selectedModuleId]);

    /**
     * Cerrar panel: elimina 'a' y 'm' de la URL en un solo movimiento.
     */
    const handleCloseSelected = useCallback(() => {
        detailActions.setSelectedId(null); // Limpia estado y detailData

        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('a');
        newUrl.searchParams.delete('m');
        window.history.pushState({}, '', newUrl.toString());
    }, [detailActions]);

    /**
     * Validar anexo: lógica de negocio centralizada.
     * Después de guardar, refresca los anexos automáticamente.
     */
    const validateAnnex = useCallback((data: { status: number; comment: string }, annex: any) => {
        if (!annex.evaluation_id) return;

        router.patch(
            supervision.update.url({ evaluation: annex.evaluation_id }),
            {
                approval_status: data.status,
                observation_type: data.status,
                comment: data.comment,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    detailActions.reloadDetail(); // Refresca panel sin perder selección
                    toast.success('Validación registrada correctamente.');
                },
            }
        );
    }, [detailActions]);

    // Filtrado Académico
    const handleFilter = async (values: Record<string, unknown>) => {
        handleAcademicFilter(values);

        if (!values.faculty_id) {
            setAvailableGroups([]);
            setSelectedGroup(null);
            setSelectedModuleId(null);
            setAssignments({ data: [] });
            return;
        }

        setIsFilteringGroups(true);
        setSelectedGroup(null);
        setSelectedModuleId(null);
        setAssignments({ data: [] });
        detailActions.setSelectedId(null);

        try {
            const res = await axios.get(supervision.api.groups.url(), { params: values });
            setAvailableGroups(res.data.groups ?? []);
        } catch {
            toast.error('No se pudieron cargar los grupos.');
            setAvailableGroups([]);
        } finally {
            setIsFilteringGroups(false);
        }
    };

    // Selección de Grupo
    const handleGroupSelect = (group: GroupOption | null) => {
        setSelectedGroup(group);
        detailActions.setSelectedId(null);
        setAssignments({ data: [] });

        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('a');
        newUrl.searchParams.delete('m');
        window.history.pushState({}, '', newUrl.toString());

        if (!group) {
            setSelectedModuleId(null);
            return;
        }
        setSelectedModuleId(group.module_id);
    };

    // Búsqueda Global por Código (Admin)
    const handleCodeSearch = async () => {
        if (!codeSearch.trim()) return;
        setAvailableGroups([]);
        setSelectedGroup(null);
        setSelectedModuleId(null);
        setIsSearchingByCode(true);

        try {
            const res = await axios.get<CodeSearchResponse>(
                supervision.api.students_search.url(),
                { params: { code: codeSearch.trim() } }
            );
            setAssignments(res.data.students);
            detailActions.setSelectedId(null);
        } catch {
            toast.error('No se encontró al estudiante.');
            setAssignments({ data: [] });
        } finally {
            setIsSearchingByCode(false);
        }
    };

    const handleModuleSelect = (moduleId: number) => {
        setSelectedModuleId(moduleId);
        detailActions.setSelectedId(null);
    };

    return {
        tableManager,
        state: {
            selectedId,
            selectedItem,
            selectedGroup,
            selectedModuleId,
            availableGroups,
            annexes,
            currentAnnex,
            selectedAnnexIdx,
            isAnnexesLoading,
            isSearchingByCode,
            codeSearch,
            isFilteringGroups,
        },
        actions: {
            handleSelect,
            handleCloseSelected,
            handleGroupSelect,
            handleFilter,
            handleCodeSearch,
            setCodeSearch,
            handleModuleSelect,
            setSelectedAnnexIdx,
            validateAnnex,                          // Para validation/index.tsx
            reloadAnnexes: detailActions.reloadDetail, // Para submission/index.tsx
        },
    };
}
