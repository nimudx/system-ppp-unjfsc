import { useState } from 'react';
import { useConfigTable } from './use-config-table';
import type { TableData } from './use-config-table';

interface UseAcademicTableOptions<T> {
    endpoint: string;
    initialData: TableData<T>;
    isAdmin: boolean;
    pageSize?: number;
    localSearchFn?: (item: T, search: string) => boolean;
    extraParams?: Record<string, unknown>;
}

export function useAcademicTable<T extends { id: number }>({
    endpoint,
    initialData,
    isAdmin,
    pageSize = 15,
    localSearchFn = () => true,
    extraParams,
}: UseAcademicTableOptions<T>) {
    const table = useConfigTable<T>({
        endpoint,
        initialData,
        isAdmin,
        pageSize,
        extraParams,
        onLocalSearch: localSearchFn,
    });
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selectedItem = table.displayData.find(
        (item) => item.id === selectedId,
    );
    const resetTable = () => {
        table.setData(isAdmin ? { data: [] } : initialData);
        setSelectedId(null);
    };
    const refreshCurrentData = async () => {
        if (isAdmin)
            await table.fetchData(table.pagination?.path || endpoint, {
                ...table.activeFilters,
                search: table.search,
            });
    };
    return {
        ...table,
        selectedId: selectedItem?.id ?? null,
        selectedItem,
        setSelectedId,
        bodyVisible: !table.isSearching,
        resetTable,
        refreshCurrentData,
    };
}
