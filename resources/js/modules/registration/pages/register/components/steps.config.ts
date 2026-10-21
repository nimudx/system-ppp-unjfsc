export interface StepItem {
    id: number;
    label: string;
}

export const getRegistrationSteps = (
    entityType: 'persona' | 'empresa',
    mode: 'individual' | 'masivo'
): StepItem[] => {
    if (entityType === 'empresa') {
        return [
            { id: 1, label: 'Formulario' },
            { id: 2, label: 'Resumen' },
        ];
    }

    if (mode === 'individual') {
        return [
            { id: 1, label: 'Configuración' },
            { id: 2, label: 'Detalles' },
            { id: 3, label: 'Resumen' },
        ];
    }

    // Persona Masivo
    return [
        { id: 1, label: 'Configuración' },
        { id: 2, label: 'Resumen' },
        { id: 3, label: 'Reporte' }
    ];
};
