import { useState } from "react";
import { useConfigTable } from "@/shared/hooks/use-config-table";

export interface Assignment {
    id: number;
    role_id: number;
    approval_status: number;
    access_status: number;
    review_status: number;
    user: {
        email: string;
        person: {
            names: string;
            surnames: string;
        };
    };
    role: {
        name: string;
    };
    section?: {
        name: string;
        school?: {
            name: string;
            faculty: {
                name: string;
            };
        };
        faculty?: {
            name: string;
        };
    };
}

interface Props {
    initialData: any;
    roleId: number;
    isAdmin: boolean;
}

export function useUserManagement({ initialData, roleId, isAdmin }: Props) {
    const table = useConfigTable<Assignment>({
        endpoint: '/users/filter',
        initialData,
        isAdmin,
        pageSize: 15,
        extraParams: { target_role_id: roleId },
        onLocalSearch: (a, term) => {
            const fullName = `${a.user?.person?.surnames || ''} ${a.user?.person?.names || ''}`.toLowerCase();
            return fullName.includes(term) || (a.user?.email || '').toLowerCase().includes(term);
        }
    });

    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

    const openManageModal = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setIsManageModalOpen(true);
    };

    const openPendingModal = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setIsPendingModalOpen(true);
    };

    const reload = () => {
        if (isAdmin) {
            const currentPath = (table.data as any)?.path || '/users/filter';
            const params = {
                target_role_id: roleId,
                search: table.search.trim(),
                page: table.localPage,
                ...(table.activeFilters || {})
            };
            table.fetchData(currentPath, params);
        }
    };

    return {
        table,
        state: {
            selectedAssignment,
            isManageModalOpen,
            isPendingModalOpen
        },
        actions: {
            setSelectedAssignment,
            setIsManageModalOpen,
            setIsPendingModalOpen,
            openManageModal,
            openPendingModal,
            reload
        }
    };
}
