import { useForm } from '@inertiajs/react';

import { SubmissionPanel } from '@/modules/documents';
import type { DocumentFile } from '@/modules/documents';
import supervision from '@/routes/academic/supervision';

interface AnnexRequirement {
    code: string;
    title: string;
    status: number;
    latest?: DocumentFile | null;
    grade?: number;
    supervision_id: number;
    history?: DocumentFile[];
}

interface SubmitFormProps {
    annex: AnnexRequirement;
    assignmentId: number;
    moduleId: number;
    tempFile: File | null;
    isEditing: boolean;
    onSetEditing: (v: boolean) => void;
    onRemoveTemp: () => void;
    onSuccess: (message: string) => void;
}

function SubmitFormContent({
    annex,
    assignmentId,
    moduleId,
    tempFile,
    isEditing,
    onSetEditing,
    onRemoveTemp,
    onSuccess,
}: SubmitFormProps) {
    const { data, setData, post, processing, reset, errors, transform } =
        useForm({
            grade: annex.grade != null ? String(annex.grade) : '',
            comment: '',
            file: null as File | null,
            code: annex.code,
            module_id: moduleId,
        });

    // Sincronizar estados

    const handleSubmit = () => {
        transform((current) => ({
            ...current,
            file: tempFile,
            code: annex.code,
            module_id: moduleId,
        }));
        post(supervision.store.url(assignmentId), {
            forceFormData: true,
            onSuccess: (page) => {
                onSuccess(
                    (page.props.flash as { message?: string } | undefined)
                        ?.message ?? 'Anexo enviado correctamente.',
                );
                reset();
            },
        });
    };

    return (
        <SubmissionPanel
            currentRequirement={annex}
            tempFile={tempFile}
            isEditing={isEditing}
            onSetEditing={onSetEditing}
            onRemoveTemp={onRemoveTemp}
            uploading={processing}
            onSubmit={handleSubmit}
        >
            {/* INYECTANDO LA NOTA Y EL COMENTARIO COMO CHILDREN AL SUBMISSION FORM */}
            <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                        Nota (0 – 20){' '}
                        {annex.status === 5 && (
                            <span className="text-red-500">(Bloqueado)</span>
                        )}
                    </label>
                    <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.5}
                        value={data.grade}
                        onChange={(e) => setData('grade', e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-shadow placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        placeholder="Ej: 16.5"
                        readOnly={annex.status === 5}
                    />
                    {errors.grade && (
                        <p className="text-[10px] font-bold text-destructive">
                            {errors.grade}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                        Comentario (Opcional)
                    </label>
                    <textarea
                        value={data.comment}
                        onChange={(e) => setData('comment', e.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-md border border-input bg-background p-3 text-sm shadow-sm transition-shadow placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        placeholder="Observaciones o comentarios sobre este anexo..."
                    />
                    {errors.comment && (
                        <p className="text-[10px] font-bold text-destructive">
                            {errors.comment}
                        </p>
                    )}
                </div>
            </div>
        </SubmissionPanel>
    );
}

export default function SubmitForm(props: SubmitFormProps) {
    return (
        <SubmitFormContent
            key={[
                props.assignmentId,
                props.moduleId,
                props.annex.code,
                props.annex.grade,
                props.annex.status,
            ].join(':')}
            {...props}
        />
    );
}
