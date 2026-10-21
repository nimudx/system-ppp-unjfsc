import type {
    InternshipDetailData,
    InternshipAssignment,
} from '@/modules/internship/types';
import type { TableData } from '@/shared/hooks/use-config-table';
import { useConfigTable } from '@/shared/hooks/use-config-table';
import { useItemDetail } from '@/shared/hooks/use-item-detail';

interface Props {
    initialData: TableData<InternshipAssignment>;
    isAdmin: boolean;
}

export function useValidation({ initialData, isAdmin }: Props) {
    // 1. Manejo de Tabla (Estandarizado)
    const tableManager = useConfigTable<InternshipAssignment>({
        endpoint: '/api/internship/validation/filter',
        initialData,
        isAdmin,
        pageSize: 10,
        onLocalSearch: (a, term: string) => {
            const fullName =
                `${a.user?.person?.names} ${a.user?.person?.surnames}`.toLowerCase();
            const email = (a.user?.email || '').toLowerCase();
            return fullName.includes(term) || email.includes(term);
        },
    });

    // 2. Manejo de Detalle mediante el nuevo Motor (useItemDetail)
    const {
        selectedId,
        detailData,
        isLoading: isLoadingDetail,
        actions: detailActions,
    } = useItemDetail<InternshipDetailData>({
        fetchUrl: (id) => `/api/internship/validation/${id}`,
    });

    const selectedItem = tableManager.displayData.find(
        (item) => item.id === selectedId,
    );

    /**
     * 3. Adaptador para carga de detalles.
     * Mantenemos la firma original con el parámetro 'step' para compatibilidad
     * con los componentes InternshipDetail y PlacementDetail.
     */
    const loadDetail = (id?: number, step?: number) => {
        detailActions.reloadDetail(id, step ? { step } : undefined);
    };

    return {
        tableManager,
        state: {
            selectedId,
            selectedItem,
            detailData,
            isLoadingDetail,
        },
        actions: {
            // Mapeamos las acciones del motor a la interfaz esperada por los componentes
            handleSelect: detailActions.handleSelect,
            handleClose: detailActions.handleClose,
            loadDetail,
            setDetailData: detailActions.setDetailData,
        },
    };
}
