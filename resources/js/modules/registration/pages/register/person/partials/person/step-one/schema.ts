import { z } from 'zod';
import { academicSchema } from '@/modules/registration/pages/register/components/AcademicSelector/academic.schema';

export const personInitSchema = z
    .object({
        role_id: z.string().min(1, 'El rol es obligatorio'),
        email: z.email('Email inválido'),
    })
    .extend(academicSchema.shape)
    .superRefine((data, ctx) => {
        const isSubadmin = data.role_id === '2';

        if (!isSubadmin) {
            // Solo exigir escuela si ya hay una facultad seleccionada
            if (data.faculty_id && !data.school_id) {
                ctx.addIssue({
                    path: ['school_id'],
                    code: 'custom',
                    message: 'Seleccione una escuela',
                });
            }
            // Solo exigir sección si ya hay una escuela seleccionada
            if (data.school_id && !data.section_id) {
                ctx.addIssue({
                    path: ['section_id'],
                    code: 'custom',
                    message: 'Seleccione una sección',
                });
            }
        }
    });

export type PersonInitValues = z.infer<typeof personInitSchema>;
