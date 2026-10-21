import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import type { DocumentRequirement } from '@/modules/documents/types';

import type { InternshipStep } from '@/modules/internship/types';

interface UseInternshipSubmissionProps {
    initialData: {
        steps: InternshipStep[];
        currentStep: number;
        requirements: DocumentRequirement[];
    };
    internshipId?: number;
}

export function useInternshipSubmission({
    initialData,
    internshipId,
}: UseInternshipSubmissionProps) {
    const [viewStep, setViewStep] = useState(initialData.currentStep);
    const [selectedReqIndex, setSelectedReqIndexState] = useState(0);
    const [activeTab, setActiveTab] = useState<'estado' | 'historial'>(
        'estado',
    );
    const [isEditing, setIsEditing] = useState(false);
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const requirements = initialData.requirements || [];
    const currentRequirement = requirements[selectedReqIndex] || null;

    const [previousStep, setPreviousStep] = useState(initialData.currentStep);
    if (previousStep !== initialData.currentStep) {
        setPreviousStep(initialData.currentStep);
        setViewStep(initialData.currentStep);
        setSelectedReqIndexState(0);
        setIsEditing(false);
        setTempFile(null);
        setPreviewUrl(null);
    }

    useEffect(
        () => () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        },
        [previewUrl],
    );

    const setSelectedReqIndex = (index: number) => {
        if (index === selectedReqIndex) return;
        removeTempFile();
        setSelectedReqIndexState(index);
    };

    const handleStepClick = (id: number) => {
        if (id <= initialData.currentStep && id !== viewStep) {
            router.get(
                `/internship?step=${id}`,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['data'],
                    onSuccess: () => {
                        setViewStep(id);
                        setSelectedReqIndex(0);
                    },
                },
            );
        }
    };

    const onFileUpload = (file: File) => {
        setTempFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const removeTempFile = () => {
        setTempFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setIsEditing(false);
    };

    const submitDocument = () => {
        if (!tempFile || !internshipId || !currentRequirement) return;

        const formData = new FormData();
        formData.append('file', tempFile);
        formData.append('code', currentRequirement.code);
        formData.append('target_id', String(internshipId));

        router.post(`/internship/documents/${internshipId}`, formData, {
            onBefore: () => setUploading(true),
            onFinish: () => setUploading(false),
            onSuccess: () => {
                removeTempFile();
                toast.success('Documento enviado correctamente.');
            },
            onError: () => {
                toast.error('Error al subir el documento.');
            },
        });
    };

    return {
        viewStep,
        selectedReqIndex,
        setSelectedReqIndex,
        activeTab,
        setActiveTab,
        isEditing,
        setIsEditing,
        tempFile,
        previewUrl,
        uploading,
        currentRequirement,
        requirements,
        handleStepClick,
        onFileUpload,
        removeTempFile,
        submitDocument,
        isViewingPastStep: viewStep !== initialData.currentStep,
    };
}
