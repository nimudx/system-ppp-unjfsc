import { Link } from '@inertiajs/react';
import {
    AlertCircle,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    Pencil,
    Send,
    Users,
    XCircle,
} from 'lucide-react';
import jobboard from '@/routes/company/jobboard';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import { cn } from '@/shared/lib/utils';
import type { VacancyDetail } from '../types';
import { formatDate } from '../utils';
import VacancyStatusBadge from './vacancy-status-badge';

export default function CompanyVacancyCard({
    vacancy,
    highlighted = false,
    processing = false,
    onSubmit,
    onClose,
}: {
    vacancy: VacancyDetail;
    highlighted?: boolean;
    processing?: boolean;
    onSubmit: (vacancy: VacancyDetail) => void;
    onClose: (vacancy: VacancyDetail) => void;
}) {
    const canEdit =
        vacancy.status === 'draft' || vacancy.status === 'observed';
    const canSubmit = canEdit;
    const canClose = vacancy.status === 'published';
    const showReview =
        (vacancy.status === 'observed' || vacancy.status === 'rejected') &&
        vacancy.review_comment;

    return (
        <SectionCard
            id={`vacancy-${vacancy.id}`}
            className={cn(
                'scroll-mt-24 transition-shadow',
                highlighted && 'ring-2 ring-primary/60',
            )}
        >
            <SectionCard.Header className="h-auto gap-2 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground">
                            {vacancy.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {vacancy.area_name || 'Área no especificada'}
                            {vacancy.location ? ` · ${vacancy.location}` : ''}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <VacancyStatusBadge
                            status={vacancy.status}
                            label={vacancy.status_label}
                        />
                        <Badge variant="secondary">
                            {vacancy.type_label}
                        </Badge>
                        <Badge variant="outline">
                            {vacancy.modality_label}
                        </Badge>
                    </div>
                </div>
            </SectionCard.Header>

            <SectionCard.Body className="space-y-4 px-4 py-4">
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                    <span className="flex items-center gap-2">
                        <Users className="size-4 shrink-0" />
                        {vacancy.positions_count}{' '}
                        {vacancy.positions_count === 1
                            ? 'posición'
                            : 'posiciones'}
                    </span>
                    <span className="flex items-center gap-2">
                        <CalendarDays className="size-4 shrink-0" />
                        Límite: {formatDate(vacancy.deadline_at)}
                    </span>
                    <span className="flex items-center gap-2">
                        <Clock3 className="size-4 shrink-0" />
                        Actualizada: {formatDate(vacancy.updated_at)}
                    </span>
                </div>

                {vacancy.schools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {vacancy.schools.map((school) => (
                            <Badge
                                key={school.id}
                                variant="outline"
                                className="font-normal"
                            >
                                {school.name}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                        Descripción
                    </p>
                    <p className="text-sm whitespace-pre-line text-muted-foreground">
                        {vacancy.description || 'Sin descripción registrada.'}
                    </p>
                </div>

                {vacancy.requirements && (
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                            Requisitos
                        </p>
                        <p className="text-sm whitespace-pre-line text-muted-foreground">
                            {vacancy.requirements}
                        </p>
                    </div>
                )}

                {showReview && (
                    <div
                        role="status"
                        className={cn(
                            'flex items-start gap-2 rounded-lg border p-3 text-sm',
                            vacancy.status === 'rejected'
                                ? 'border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-300'
                                : 'border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300',
                        )}
                    >
                        {vacancy.status === 'rejected' ? (
                            <XCircle className="mt-0.5 size-4 shrink-0" />
                        ) : (
                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        )}
                        <div>
                            <p className="font-medium">
                                {vacancy.status === 'rejected'
                                    ? 'Vacante rechazada'
                                    : 'Vacante observada'}
                            </p>
                            <p className="mt-0.5 whitespace-pre-line">
                                {vacancy.review_comment}
                            </p>
                        </div>
                    </div>
                )}

                {vacancy.status === 'pending_review' && (
                    <p className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
                        <Clock3 className="size-4 shrink-0" />
                        La vacante está siendo revisada por administración.
                    </p>
                )}

                {vacancy.status === 'published' && (
                    <p className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="size-4 shrink-0" />
                        Publicada el {formatDate(vacancy.published_at)}. Los
                        docentes titulares de las escuelas destino ya pueden
                        proponer candidatos.
                    </p>
                )}

                {vacancy.status === 'closed' && (
                    <p className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                        <BriefcaseBusiness className="size-4 shrink-0" />
                        Cerrada el {formatDate(vacancy.closed_at)}
                        {vacancy.closed_reason_label
                            ? ` · ${vacancy.closed_reason_label}`
                            : ''}
                    </p>
                )}
            </SectionCard.Body>

            <SectionCard.Footer className="flex flex-wrap justify-end gap-2">
                {canEdit && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={jobboard.edit(vacancy.id).url}>
                            <Pencil className="mr-1.5 size-4" />
                            Editar
                        </Link>
                    </Button>
                )}

                {canSubmit && (
                    <Button
                        size="sm"
                        onClick={() => onSubmit(vacancy)}
                        disabled={processing}
                    >
                        <Send className="mr-1.5 size-4" />
                        {processing ? 'Enviando...' : 'Enviar a revisión'}
                    </Button>
                )}

                {canClose && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onClose(vacancy)}
                        disabled={processing}
                    >
                        <XCircle className="mr-1.5 size-4" />
                        Cerrar vacante
                    </Button>
                )}

                {vacancy.location && (
                    <span className="mr-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {vacancy.location}
                    </span>
                )}
            </SectionCard.Footer>
        </SectionCard>
    );
}
