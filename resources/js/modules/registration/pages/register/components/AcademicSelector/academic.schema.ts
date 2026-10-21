import { z } from "zod";

export const academicSchema = z.object({
    faculty_id: z.string().min(1, "Seleccione una facultad"),
    school_id: z.string().optional(),
    section_id: z.string().optional(),
});

export type AcademicValues = z.infer<typeof academicSchema>;