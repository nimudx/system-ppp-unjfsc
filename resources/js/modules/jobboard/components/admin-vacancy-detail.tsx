import { router } from '@inertiajs/react';
import { BellRing, CheckCircle2, Send, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import admin from '@/routes/academic/jobboard/admin';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { SectionCard } from '@/shared/components/ui/section-card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import type {
    AdminVacancyDetail,
    SchoolOption,
    SelectOption,
    VacancyCloseReason,
} from '../types';
import AdminCandidateRow from './admin-candidate-row';
import CloseVacancyDialog from './close-vacancy-dialog';
import SchoolSelector from './school-selector';
import VacancyDetailInfo from './vacancy-detail-info';

const DECISIONS: SelectOption[] = [
    { value: 'approve', label: 'Aprobar y publicar' },
    { value: 'observe', label: 'Observar' },
    { value: 'reject', label: 'Rechazar' },
];

export default function AdminVacancyDetail({
    vacancy,
    statuses,
    schools,
    onClose,
    onReload,
}: {
    vacancy: AdminVacancyDetail;
    statuses: SelectOption[];
    schools: SchoolOption[];
    onClose: () => void;
    onReload: () => void;
}) {
    const [processing, setProcessing] = useState(false);
    const [closeOpen, setCloseOpen] = useState(false);
    const [decision, setDecision] = useState('approve');
    const [comment, setComment] = useState('');
    const [notifyTeachers, setNotifyTeachers] = useState(true);
    const [schoolIds, setSchoolIds] = useState<number[]>(
        vacancy.schools.map((school) => school.id),
    );
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [schoolError, setSchoolError] = useState<string | null>(null);

    const submitReview = () => {
        if (decision !== 'approve' && !comment.trim()) {
            setReviewError(
                'El comentario es obligatorio al observar o rechazar.',
            );

            return;
        }

        if (decision === 'approve' && schoolIds.length === 0) {
            setSchoolError('Confirma al menos una escuela destino.');

            return;
        }

        setReviewError(null);
        setSchoolError(null);
        setProcessing(true);

        router.patch(
            admin.review(vacancy.id).url,
            {
                decision,
                comment: comment.trim() || null,
                notify_teachers: notifyTeachers,
                ...(decision === 'approve'
                    ? { school_ids: schoolIds }
                    : {}),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setComment('');
                    setDecision('approve');
                    onReload();
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const notify = () => {
        setProcessing(true);
        router.post(
            admin.notifyTeachers(vacancy.id).url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const closeVacancy = (reason: VacancyCloseReason) => {
        setProcessing(true);
        router.post(
            admin.close(vacancy.id).url,
            { reason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCloseOpen(false);
                    onReload();
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                    Detalle de la vacante
                </p>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Cerrar detalle"
                >
                    <X className="size-4" />
                </Button>
            </div>

            {vacancy.reviewed_by && (
                <p className="text-xs text-muted-foreground">
                    Revisada por {vacancy.reviewed_by}
                </p>
            )}

            <VacancyDetailInfo vacancy={vacancy} showContact />

            {vacancy.status === 'pending_review' && (
                <SectionCard>
                    <SectionCard.Header
                        title="Revisión de la vacante"
                        description="Aprueba para publicarla o devuélvela con una observación."
                    />
                    <SectionCard.Body className="space-y-3 px-4 py-4">
                        <div className="space-y-1">
                            <Label htmlFor="review-decision">Decisión</Label>
                            <Select
                                value={decision}
                                onValueChange={setDecision}
                            >
                                <SelectTrigger id="review-decision">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DECISIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="review-comment">
                                Comentario
                                {decision !== 'approve' ? ' (obligatorio)' : ''}
                            </Label>
                            <Textarea
                                id="review-comment"
                                value={comment}
                                onChange={(event) =>
                                    setComment(event.target.value)
                                }
                                rows={3}
                                placeholder="Observaciones para la empresa"
                            />
                            {reviewError && (
                                <p className="text-xs font-medium text-destructive">
                                    {reviewError}
                                </p>
                            )}
                        </div>

                        {decision === 'approve' && (
                            <SchoolSelector
                                schools={schools}
                                selectedIds={schoolIds}
                                onChange={(ids) => {
                                    setSchoolIds(ids);
                                    setSchoolError(null);
                                }}
                                error={schoolError ?? undefined}
                            />
                        )}

                        {decision === 'approve' && (
                            <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Checkbox
                                    checked={notifyTeachers}
                                    onCheckedChange={(checked) =>
                                        setNotifyTeachers(checked === true)
                                    }
                                />
                                Notificar a los docentes titulares
                            </label>
                        )}

                        <div className="flex justify-end">
                            <Button
                                type="button"
                                size="sm"
                                onClick={submitReview}
                                disabled={processing}
                            >
                                {decision === 'approve' ? (
                                    <CheckCircle2 className="mr-1.5 size-4" />
                                ) : decision === 'reject' ? (
                                    <XCircle className="mr-1.5 size-4" />
                                ) : (
                                    <Send className="mr-1.5 size-4" />
                                )}
                                {processing
                                    ? 'Registrando...'
                                    : 'Registrar revisión'}
                            </Button>
                        </div>
                    </SectionCard.Body>
                </SectionCard>
            )}

            {vacancy.status === 'published' && (
                <div className="flex flex-wrap justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={notify}
                        disabled={processing}
                    >
                        <BellRing className="mr-1.5 size-4" />
                        Reavisar a docentes
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCloseOpen(true)}
                        disabled={processing}
                    >
                        <XCircle className="mr-1.5 size-4" />
                        Cerrar vacante
                    </Button>
                </div>
            )}

            <SectionCard>
                <SectionCard.Header
                    title={`Candidatos propuestos (${vacancy.candidates.length})`}
                    description="La empresa no ve esta información. El contacto y seguimiento son manuales."
                />
                <SectionCard.Body className="space-y-3 px-4 py-4">
                    {vacancy.candidates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Aún no hay candidatos propuestos por los docentes
                            titulares.
                        </p>
                    ) : (
                        vacancy.candidates.map((candidate) => (
                            <AdminCandidateRow
                                key={candidate.id}
                                vacancyId={vacancy.id}
                                candidate={candidate}
                                statuses={statuses}
                                onUpdated={onReload}
                            />
                        ))
                    )}
                </SectionCard.Body>
            </SectionCard>

            <CloseVacancyDialog
                vacancy={vacancy}
                open={closeOpen}
                onOpenChange={setCloseOpen}
                onConfirm={closeVacancy}
                processing={processing}
            />
        </div>
    );
}
