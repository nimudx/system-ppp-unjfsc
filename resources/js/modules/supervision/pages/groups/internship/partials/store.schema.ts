import { z } from "zod";

export const storeGroupSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    teacher_assignment_id: z.string().min(1, "El docente titular es requerido"),
    supervisor_assignment_id: z.string().min(1, "El docente supervisor es requerido"),
    section_id: z.string().min(1, "La sección es requerida"),
    faculty_id: z.string().min(1, "La facultad es requerida"),
    school_id: z.string().min(1, "La escuela es requerida"),
    student_ids: z.array(z.number()).optional(),
});

export type StoreGroupValues = z.infer<typeof storeGroupSchema>;