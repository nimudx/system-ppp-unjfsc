import { z } from 'zod';
import { academicSchema } from '@/modules/registration/pages/register/components/AcademicSelector/academic.schema';

export const massivePersonInitSchema = z
    .object({
        role_id: z.string().min(1, 'El rol es obligatorio'),
        file: z.instanceof(File).optional(), // 👈 clave
        rows: z.array(z.record(z.string(), z.string())).optional(), // 👈 aquí guardaremos el JSON
    })
    .extend(academicSchema.shape)
    .superRefine((data, ctx) => {
        // 🔥 VALIDAR FILE AQUÍ
        if (!data.file) {
            ctx.addIssue({
                path: ['file'],
                code: 'custom',
                message: 'Archivo requerido',
            });
        }

        const isSubadmin = data.role_id === '2';

        if (!isSubadmin) {
            if (data.faculty_id && !data.school_id) {
                ctx.addIssue({
                    path: ['school_id'],
                    code: 'custom',
                    message: 'Seleccione una escuela',
                });
            }

            if (data.school_id && !data.section_id) {
                ctx.addIssue({
                    path: ['section_id'],
                    code: 'custom',
                    message: 'Seleccione una sección',
                });
            }
        }
    });

export type MassivePersonInitValues = z.infer<typeof massivePersonInitSchema>;
