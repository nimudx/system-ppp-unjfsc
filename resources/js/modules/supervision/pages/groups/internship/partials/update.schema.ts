import { z } from "zod";

export const updateGroupSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").max(255, "Máximo 255 caracteres"),
    supervisor_id: z.string().optional().nullable(),
});

export type UpdateGroupValues = z.infer<typeof updateGroupSchema>;
