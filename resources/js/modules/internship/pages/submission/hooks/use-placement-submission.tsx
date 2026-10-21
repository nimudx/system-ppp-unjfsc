import internship from '@/routes/academic/internship';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// El contexto activo puede ser 'empresa' o el índice de un requerimiento (número)
export type PlacementContext = 'empresa' | number;

interface UsePlacementSubmissionProps {
    placement: any | null;
    requirements: any[];
}

export function usePlacementSubmission({ placement, requirements }: UsePlacementSubmissionProps) {
    const hasPlacement = !!placement;

    // ── Selección de Tipo ──────────────────────────────────────────────────
    const [type, setType] = useState<string>(placement?.internship_type || 'development');
    const [origin, setOrigin] = useState<string>(placement?.origin_type || 'direct');

    // ── Contexto del Panel Central ─────────────────────────────────────────
    const [activeContext, setActiveContext] = useState<PlacementContext>('empresa');

    // ── Estado de Documento ────────────────────────────────────────────────
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [previewEnabled, setPreviewEnabled] = useState(false);

    // Sincronizar estado cuando cambian las props (Inertia re-render)
    useEffect(() => {
        if (placement) {
            setType(placement.internship_type || 'development');
            setOrigin(placement.origin_type || 'direct');
        }
    }, [placement]);

    // ── Helpers ────────────────────────────────────────────────────────────
    const handleSelectType = (newType: string) => {
        setType(newType);
        if (newType === 'validation') setOrigin('direct');
    };

    const handleSelectContext = (ctx: PlacementContext) => {
        setActiveContext(ctx);
        // Limpiar estados de archivo al cambiar de tab
        setIsEditing(false);
        setTempFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const removeTempFile = () => {
        setTempFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setIsEditing(false);
    };

    // Callback para visulizar local antes de subir
    const onUploadTempFile = (file: File) => {
        setTempFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    // El requerimiento activo (cuando el contexto es un número)
    const activeRequirement = typeof activeContext === 'number'
        ? requirements[activeContext] ?? null
        : null;

    // Lógica para decidir si mostrar UploadZone o Preview
    const canUploadDocument = activeRequirement
        ? (!activeRequirement?.latest || isEditing) && !tempFile
        : false;

    const [loading, setLoading] = useState(false);

    const handleSaveDocument = () => {
        if (!placement) {
            toast.error('Primero debe registrar la empresa y jefe inmediato.');
            return;
        }

        if (!tempFile) {
            toast.error('Selecciona un archivo antes de enviar.');
            return;
        }

        setLoading(true);

        router.post(internship.placements.documents.store.url(placement.id), {
            code: activeRequirement?.code,
            file: tempFile,
        }, {
            onSuccess: () => {
                setIsEditing(false);
                setTempFile(null);
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                }
            },
            onError: (errors: any) => {
                const firstError = Object.values(errors)[0] as string;
                toast.error(firstError || 'Error al subir el archivo');
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    return {
        handleSaveDocument,
        // Estado Tipo/Origen
        type,
        origin,
        setType: handleSelectType,
        setOrigin,
        hasPlacement,

        // Estado del Panel Central
        activeContext,
        activeRequirement,
        setActiveContext: handleSelectContext,
        removeTempFile,
        loading,

        // Archivos y Previsualización
        tempFile,
        setTempFile,
        previewUrl,
        isEditing,
        setIsEditing,
        canUploadDocument,
        onUploadTempFile,
        previewEnabled,
        setPreviewEnabled,
    };
}
