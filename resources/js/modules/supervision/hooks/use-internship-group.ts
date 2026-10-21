import { useState, useCallback } from 'react';
import type { TableData } from '@/shared/hooks/use-config-table';
import { useConfigTable } from '@/shared/hooks/use-config-table';

// --- DEFINICIÓN DE TIPOS ---
export interface Person {
    names: string;
    surnames: string;
}

export interface User {
    email: string;
    person: Person;
}

export interface Assignment {
    id: number;
    user: User;
}

export interface InternshipGroup {
    id: number;
    name: string;
    module?: {
        id: number;
        name: string;
    } | null;
    teacher: Assignment;
    supervisor: Assignment;
    section: {
        id: number;
        name: string;
        school: {
            name: string;
            faculty: {
                name: string;
            };
        };
    };
    students_count?: number;
}

interface UseInternshipGroupProps {
    initialData: TableData<InternshipGroup>;
    isAdmin: boolean;
}

export function useInternshipGroup({ initialData, isAdmin }: UseInternshipGroupProps) {
    // --- 1. Gestión de Modales ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<InternshipGroup | null>(null);

    // --- 2. Lógica de Tabla (Hook Genérico) ---
    const tableManager = useConfigTable<InternshipGroup>({
        endpoint: '/api/groups/internship/filter',
        initialData,
        isAdmin,
        pageSize: 15,
        onLocalSearch: (g, term) => {
            return (
                g.name.toLowerCase().includes(term) ||
                g.section?.school?.name?.toLowerCase().includes(term) ||
                (g.module?.name ?? '').toLowerCase().includes(term)
            );
        },
    });

    // --- 3. Acciones de UI ---
    const openCreate = useCallback(() => setIsCreateModalOpen(true), []);
    
    const openEdit = useCallback((group: InternshipGroup) => {
        setSelectedGroup(group);
        setIsEditModalOpen(true);
    }, []);

    const openDelete = useCallback((group: InternshipGroup) => {
        setSelectedGroup(group);
        setIsDeleteModalOpen(true);
    }, []);

    // Función para refrescar los datos tras una acción exitosa (Create/Update/Delete)
    const refreshData = useCallback(() => {
        const params = (
            tableManager.search.trim() 
                ? { search: tableManager.search.trim() } 
                : tableManager.activeFilters || {}
        ) as Record<string, unknown>;
        
        tableManager.fetchData(undefined, params);
        
        // Cerrar modales
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
    }, [tableManager]);

    return {
        // Todo lo relacionado con la tabla
        tableManager,
        
        // Estado y acciones de los modales
        modals: {
            create: { isOpen: isCreateModalOpen, setOpen: setIsCreateModalOpen, open: openCreate },
            edit: { isOpen: isEditModalOpen, setOpen: setIsEditModalOpen, open: openEdit },
            delete: { isOpen: isDeleteModalOpen, setOpen: setIsDeleteModalOpen, open: openDelete },
            selectedGroup,
        },
        
        // Acciones globales
        actions: {
            refreshData,
        }
    };
}