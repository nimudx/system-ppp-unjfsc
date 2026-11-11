import { useForm } from '@inertiajs/react';
import { CheckCircle2, ExternalLink, FileText, XCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import admin from '@/routes/academic/jobboard/admin';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import type {
    CandidateStatus,
    SelectOption,
    VacancyCandidateSummary,
} from '../types';
import { formatDate } from '../utils';
import CandidateStatusBadge from './candidate-status-badge';

export default function AdminCandidateRow({
    vacancyId,
    candidate,
    statuses,
    onUpdated,
}: {
    vacancyId: number;
    candidate: VacancyCandidateSummary;
    statuses: SelectOption[];
    onUpdated: () => void;
}) {
    const options = statuses.filter((option) => option.value !== 'proposed');
    const student = candidate.student;

    const { data, setData, patch, processing, errors, reset } = useForm({
        status: '',
        status_note: candidate.status_note ?? '',
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!data.status) return;

        patch(admin.candidates.update([vacancyId, candidate.id]).url, {
            preserveScroll: true,
            onSuccess: () => {
                reset('status');
                onUpdated();
            },
        });
    };

    return (
        <div className="space-y-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-semibold">
                        {student?.name ?? 'Estudiante'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {student?.code ? `Código: ${student.code} · ` : ''}
                        {student?.dni ? `DNI: ${student.dni} · ` : ''}
                        {student?.email ?? 'Sin correo'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {[student?.school, student?.section]
                            .filter(Boolean)
                            .join(' · ') || 'Sin sección'}
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
                    Propuesto por {candidate.proposed_by ?? 'docente titular'}
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
                    Nota del docente: {candidate.note}
                </p>
            )}

            <form
                onSubmit={handleSubmit}
                className="grid gap-2 sm:grid-cols-[minmax(0,10rem)_1fr_auto] sm:items-end"
            >
                <div className="space-y-1">
                    <label
                        htmlFor={`candidate-status-${candidate.id}`}
                        className="text-xs font-medium text-muted-foreground"
                    >
                        Nuevo estado
                    </label>
                    <Select
                        value={data.status || undefined}
                        onValueChange={(value) =>
                            setData('status', value as CandidateStatus)
                        }
                    >
                        <SelectTrigger
                            id={`candidate-status-${candidate.id}`}
                            className="h-9"
                        >
                            <SelectValue placeholder="Cambiar estado" />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
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
                    <label
                        htmlFor={`candidate-note-${candidate.id}`}
                        className="text-xs font-medium text-muted-foreground"
                    >
                        Nota de gestión
                    </label>
                    <Input
                        id={`candidate-note-${candidate.id}`}
                        value={data.status_note}
                        onChange={(event) =>
                            setData('status_note', event.target.value)
                        }
                        placeholder="Detalle del contacto o resultado"
                        className="h-9"
                    />
                </div>

                <Button
                    type="submit"
                    size="sm"
                    disabled={processing || !data.status}
                >
                    {processing ? 'Guardando...' : 'Actualizar'}
                </Button>
            </form>

            {(errors.status || errors.status_note) && (
                <p className="text-xs font-medium text-destructive">
                    {errors.status ?? errors.status_note}
                </p>
            )}

            {candidate.status_note && (
                <p className="text-xs text-muted-foreground">
                    Última nota de gestión: {candidate.status_note}
                </p>
            )}
        </div>
    );
}
