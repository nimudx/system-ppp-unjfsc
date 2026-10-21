import { z } from "zod";

export const personSchema = z.object({
    names: z.string().min(1, "Nombres es requerido"),
    surnames: z.string().min(1, "Apellidos es requerido"),
    dni: z.string().min(1, "DNI es requerido"),
    gender: z.string().min(1, "Género es requerido"),
});

export type PersonValues = z.infer<typeof personSchema>;