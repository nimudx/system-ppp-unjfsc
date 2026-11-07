import { useState } from 'react';
import type { UserAssignment } from '@/modules/identity/types';
import type { TableData } from '@/shared/hooks/use-config-table';
import { useConfigTable } from '@/shared/hooks/use-config-table';

interface Props {
    initialData: TableData<UserAssignment>;
    roleId: number;
    isAdmin: boolean;
}

export function useUserManagement({ initialData, roleId, isAdmin }: Props) {
    const table = useConfigTable<UserAssignment>({
        endpoint: '/users/filter',
        initialData,
        isAdmin,
        pageSize: 15,
        extraParams: { target_role_id: roleId },
        onLocalSearch: (a, term) => {
            const fullName =
                `${a.user?.person?.surnames || ''} ${a.user?.person?.names || ''}`.toLowerCase();
            return (
                fullName.includes(term) ||
                (a.user?.email || '').toLowerCase().includes(term)
            );
        },
    });

    const [selectedAssignment, setSelectedAssignment] =
        useState<UserAssignment | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

    const openManageModal = (assignment: UserAssignment) => {
        setSelectedAssignment(assignment);
        setIsManageModalOpen(true);
    };

    const openPendingModal = (assignment: UserAssignment) => {
        setSelectedAssignment(assignment);
        setIsPendingModalOpen(true);
    };

    const reload = () => {
        if (isAdmin) {
            const currentPath = table.pagination?.path || '/users/filter';
            const params = {
                target_role_id: roleId,
                search: table.search.trim(),
                page: table.localPage,
                ...(table.activeFilters || {}),
            };
            table.fetchData(currentPath, params);
        }
    };

    return {
        table,
        state: {
            selectedAssignment,
            isManageModalOpen,
            isPendingModalOpen,
        },
        actions: {
            setSelectedAssignment,
            setIsManageModalOpen,
            setIsPendingModalOpen,
            openManageModal,
            openPendingModal,
            reload,
        },
    };
}
