import { z } from "zod";

export const csvRowSchema = z.object({
    email: z.email("Email inválido"),
    dni: z.string().min(8, "DNI inválido").max(8, "DNI inválido").regex(/^[0-9]+$/, "DNI inválido"),
    apellidos: z.string().min(1, "Apellidos requeridos"),
    nombres: z.string().min(1, "Nombres requeridos").regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/, "Nombres inválidos"),
});