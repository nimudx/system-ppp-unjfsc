import { z } from "zod";

export const stepDetailsSchema = z.object({
    company: z.object({
        id: z.number().nullable().optional(),
        ruc: z.string().length(11, "El RUC debe tener 11 caracteres"),
        name: z.string().min(1, "El nombre de la empresa es obligatorio"),
        address: z.string().min(1, "La dirección es obligatoria"),
        phone: z.string().min(1, "El teléfono es obligatorio"),
        email: z.email("El correo electrónico no es válido"),
    }),
    placement: z.object({
        boss_name: z.string().min(1, "El nombre del jefe directo es obligatorio"),
        boss_position: z.string().min(1, "El cargo es obligatorio"),
        boss_phone: z.string().min(9, "El teléfono debe tener al menos 9 dígitos"),
        boss_email: z.email("El correo electrónico no es válido"),
        area_name: z.string().min(1, "El área es obligatoria"),
        position: z.string().min(1, "El cargo a ocupar es obligatorio"),
        description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
        start_date: z.string().min(1, "La fecha de inicio es obligatoria"),
        end_date: z.string().min(1, "La fecha de término es obligatoria"),
    }),
});

export const detailSchema = z.object({
    internship_type: z.enum(["desarrollo", "convalidacion"]),
    origin: z.string().optional(),
    ...stepDetailsSchema.shape,
    files: z.object({
        fut: z.any().optional(),
        carta_presentacion: z.any().optional(),
        carta_aceptacion: z.any().optional(),
    }).optional(),
}).refine((data) => {
    if (data.internship_type === 'desarrollo' && !data.origin) {
        return false;
    }
    return true;
}, {
    message: "Debe seleccionar el origen de las prácticas",
    path: ["origin"],
});