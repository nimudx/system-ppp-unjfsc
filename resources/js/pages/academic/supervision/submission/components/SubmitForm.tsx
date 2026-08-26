import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import supervision from "@/routes/academic/supervision";
import { SubmissionPanel } from "@/components/academic/submission-panel";

interface AnnexRequirement {
    code: string;
    title: string;
    status: number;
    latest: any;
    grade?: number;
    supervision_id: number;
    history?: any[];
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

export default function SubmitForm({
    annex,
    assignmentId,
    moduleId,
    tempFile,
    isEditing,
    onSetEditing,
    onRemoveTemp,
    onSuccess,
}: SubmitFormProps) {
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        grade: annex.grade != null ? String(annex.grade) : "",
        comment: "",
        file: null as File | null,
        code: annex.code,
        module_id: moduleId,
    });

    // Sincronizar estados
    useEffect(() => {
        setData({
            ...data,
            grade: annex.grade != null ? String(annex.grade) : "",
            comment: "",
            file: tempFile,
            code: annex.code,
            module_id: moduleId,
        });
        clearErrors();
    }, [annex.code, annex.grade, tempFile, moduleId]);

    const handleSubmit = () => {
        post(supervision.store.url(assignmentId), {
            forceFormData: true,
            onSuccess: (page: any) => {
                onSuccess(page.props.flash?.message ?? "Anexo enviado correctamente.");
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
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest block">
                        Nota (0 – 20) {annex.status === 5 && <span className="text-red-500">(Bloqueado)</span>}
                    </label>
                    <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.5}
                        value={data.grade}
                        onChange={(e) => setData("grade", e.target.value)}
                        className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background shadow-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-shadow"
                        placeholder="Ej: 16.5"
                        readOnly={annex.status === 5}
                    />
                    {errors.grade && <p className="text-[10px] text-destructive font-bold">{errors.grade}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest block">
                        Comentario (Opcional)
                    </label>
                    <textarea
                        value={data.comment}
                        onChange={(e) => setData("comment", e.target.value)}
                        rows={3}
                        className="w-full p-3 text-sm rounded-md border border-input bg-background shadow-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none transition-shadow"
                        placeholder="Observaciones o comentarios sobre este anexo..."
                    />
                    {errors.comment && <p className="text-[10px] text-destructive font-bold">{errors.comment}</p>}
                </div>
            </div>
        </SubmissionPanel>
    );
}
