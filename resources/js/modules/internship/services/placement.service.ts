import { store as storePlacement } from '@/routes/company-validation/placement';
import { workflowApi } from '@/shared/lib/workflow-api';

export type PlacementSaveResponse = {
    internship_id: number;
    can_upload_documents: boolean;
};

/**
 * Guarda el jefe inmediato y los datos de práctica del estudiante.
 * El endpoint es el mismo que usa el flujo de validación de empresa.
 */
export const placementService = {
    save: (data: object) =>
        workflowApi<PlacementSaveResponse>(storePlacement().url, 'POST', data),
};
