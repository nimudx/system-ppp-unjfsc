import { router } from '@inertiajs/react';
import {
    CheckCircle2,
    ExternalLink,
    FileText,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import teacher from '@/routes/academic/jobboard/teacher';
import ConfirmDeleteDialog from '@/shared/components/confirm-delete-dialog';
import EmptyState from '@/shared/components/empty-state';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { VacancyCandidateSummary } from '../types';
import { formatDate } from '../utils';
import CandidateStatusBadge from './candidate-status-badge';

export default function TeacherCandidateList({
    vacancyId,
    candidates,
    teacherAssignmentId,
    onReload,
}: {
    vacancyId: number;
    candidates: VacancyCandidateSummary[];
    teacherAssignmentId: number;
    onReload: () => void;
}) {
    const [candidateToWithdraw, setCandidateToWithdraw] =
        useState<VacancyCandidateSummary | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const confirmWithdraw = () => {
        if (!candidateToWithdraw) return;

        setProcessingId(candidateToWithdraw.id);
        router.delete(
            teacher.withdraw([vacancyId, candidateToWithdraw.id]).url,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCandidateToWithdraw(null);
                    onReload();
                },
                onFinish: () => setProcessingId(null),
            },
        );
    };

    if (candidates.length === 0) {
        return (
            <EmptyState
                title="Aún no hay candidatos propuestos"
                description="Selecciona estudiantes de tu sección para proponerlos."
            />
        );
    }

    return (
        <>
            <div className="space-y-3">
                {candidates.map((candidate) => {
                    const student = candidate.student;
                    const canWithdraw =
                        candidate.proposed_by_assignment_id ===
                            teacherAssignmentId &&
                        candidate.status === 'proposed';

                    return (
                        <div
                            key={candidate.id}
                            className="space-y-3 rounded-lg border p-3"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm font-semibold">
                                        {student?.name ?? 'Estudiante'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {student?.code
                                            ? `Código: ${student.code} · `
                                            : ''}
                                        {student?.dni
                                            ? `DNI: ${student.dni} · `
                                            : ''}
                                        {student?.email ?? 'Sin correo'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {[student?.school, student?.section]
                                            .filter(Boolean)
                                            .join(' · ') || 'Sin sección'}
                                        {student?.semester
                                            ? ` · ${student.semester}`
                                            : ''}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {student?.record_approved ? (
                                        <Badge
                                            variant="outline"
                                            className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        >
                                            <CheckCircle2 className="mr-1 size-3" />
                                            Récord aprobado
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
                                        >
                                            <XCircle className="mr-1 size-3" />
                                            Récord pendiente
                                        </Badge>
                                    )}
                                    <CandidateStatusBadge
                                        status={candidate.status}
                                        label={candidate.status_label}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>
                                    Propuesto por{' '}
                                    {candidate.proposed_by ??
                                        'docente titular'}
                                </span>
                                <span>{formatDate(candidate.created_at)}</span>
                                {student?.cv && (
                                    <a
                                        href={student.cv.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                    >
                                        <FileText className="size-3.5" />
                                        Ver CV
                                        <ExternalLink className="size-3" />
                                    </a>
                                )}
                            </div>

                            {candidate.note && (
                                <p className="rounded-md bg-muted/50 p-2 text-xs whitespace-pre-line text-muted-foreground">
                                    Nota: {candidate.note}
                                </p>
                            )}

                            {candidate.status_note && (
                                <p className="text-xs text-muted-foreground">
                                    Seguimiento del administrador:{' '}
                                    {candidate.status_note}
                                </p>
                            )}

                            {canWithdraw && (
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setCandidateToWithdraw(candidate)
                                        }
                                        disabled={
                                            processingId === candidate.id
                                        }
                                    >
                                        <Trash2 className="mr-1.5 size-3.5" />
                                        Retirar propuesta
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <ConfirmDeleteDialog
                open={candidateToWithdraw !== null}
                onOpenChange={(open) => {
                    if (!open) setCandidateToWithdraw(null);
                }}
                title="Retirar propuesta"
                description={
                    candidateToWithdraw?.student?.name
                        ? `Se retirará la propuesta de ${candidateToWithdraw.student.name}. Podrás volver a proponerlo mientras la vacante siga publicada.`
                        : 'Se retirará la propuesta del candidato seleccionado.'
                }
                confirmLabel="Retirar propuesta"
                processingLabel="Retirando..."
                processing={
                    candidateToWithdraw !== null &&
                    processingId === candidateToWithdraw.id
                }
                icon={Trash2}
                onConfirm={confirmWithdraw}
            />
        </>
    );
}
