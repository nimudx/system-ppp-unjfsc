import { useConfigTable } from "@/shared/hooks/use-config-table";
import dossiers from "@/routes/academic/dossiers";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";
import { useItemDetail } from "@/shared/hooks/use-item-detail";

interface Props {
    initialData: any;
    target_role_id: number;
    isAdmin: boolean;
}

export function useDossierValidation(
    { initialData, target_role_id, isAdmin }: Props
) {
    // 1. Manejo de la tabla (Sigue igual)
    const tableManager = useConfigTable({
        endpoint: '/api/dossiers/filter',
        initialData,
        isAdmin,
        pageSize: 10,
        extraParams: {
            target_role_id,
        },
        onLocalSearch: (item: any, term: string) => {
            const fullName = `${item.user?.person?.surnames} ${item.user?.person?.names}`.toLowerCase();
            const email = (item.user?.email || '').toLowerCase();
            return fullName.includes(term) || email.includes(term);
        },
    });

    // 2. Manejo del Detalle mediante el nuevo Motor (useItemDetail)
    const { 
        selectedId, 
        detailData: itemDetail, 
        isLoading: isLoadingDetail,
        actions: detailActions 
    } = useItemDetail({
        fetchUrl: (id) => dossiers.api.validations.url(id),
    });

    const selectedItem = tableManager.displayData.find((item) =>
        item.id === selectedId
    );

    // 3. Estados locales específicos del flujo de Dossier
    const [previewEnabled, setPreviewEnabled] = useState(false);
    const [isSavingValidation, setIsSavingValidation] = useState(false);
    const [selectedType, setSelectedType] = useState(0);

    const handleSaveValidation = (status: number, message: string) => {
        const currentReq = itemDetail?.requirements?.[selectedType];
        if (!currentReq?.latest) {
            toast.error('No hay documento adjunto para evaluar.');
            return;
        }

        const payload = {
            approval_status: status,
            comment: message,
        };

        setIsSavingValidation(true);
        const patchUrl = dossiers.document.status.url(currentReq.latest.id);

        router.patch(patchUrl, payload, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // Refrescar el panel de detalles de forma estandarizada
                detailActions.reloadDetail();

                // Refrescar tabla si es Admin para recuperar últimos estados
                if (isAdmin) {
                    const currentPath = (tableManager.data as any)?.path || '/api/dossiers/filter';
                    const params = {
                        target_role_id,
                        search: tableManager.search.trim(),
                        page: tableManager.localPage,
                        ...(tableManager.activeFilters || {})
                    };
                    tableManager.fetchData(currentPath, params);
                }
            },
            onError: (errors: any) => {
                console.log(errors);
                toast.error('Ocurrió un error al guardar la validación.');
            },
            onFinish: () => {
                setIsSavingValidation(false);
            }
        });
    };

    return {
        tableManager,
        state: {
            selectedId,
            selectedItem,
            itemDetail,
            isLoadingDetail,
            previewEnabled,
            isSavingValidation,
            selectedType
        },
        actions: {
            // Mapeamos las acciones del motor a los nombres esperados por el componente
            handleSelect: detailActions.handleSelect,
            handleCloseSelected: detailActions.handleClose,
            handleSaveValidation,
            setPreviewEnabled,
            setSelectedType,
        }
    };
}