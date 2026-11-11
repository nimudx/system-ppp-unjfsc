import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { SectionCard } from '@/shared/components/ui/section-card';
import type { VacancyDetail } from '../types';
import { formatDate } from '../utils';
import VacancyStatusBadge from './vacancy-status-badge';

export default function VacancyDetailInfo({
    vacancy,
    showContact = false,
}: {
    vacancy: VacancyDetail;
    showContact?: boolean;
}) {
    return (
        <div className="space-y-4">
            <SectionCard>
                <SectionCard.Header className="h-auto gap-2 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                            <h3 className="text-base font-semibold">
                                {vacancy.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {vacancy.company?.name ?? 'Empresa'}
                                {vacancy.area_name
                                    ? ` · ${vacancy.area_name}`
                                    : ''}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                    <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
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
                        {vacancy.location && (
                            <span className="flex items-center gap-2">
                                <MapPin className="size-4 shrink-0" />
                                {vacancy.location}
                            </span>
                        )}
                        <span className="flex items-center gap-2">
                            <Clock3 className="size-4 shrink-0" />
                            Publicada: {formatDate(vacancy.published_at)}
                        </span>
                    </div>

                    {vacancy.schools.length > 0 && (
                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Escuelas destino
                            </p>
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
                        </div>
                    )}

                    <div className="space-y-1">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Descripción
                        </p>
                        <p className="text-sm whitespace-pre-line text-muted-foreground">
                            {vacancy.description || 'Sin descripción.'}
                        </p>
                    </div>

                    {vacancy.requirements && (
                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Requisitos
                            </p>
                            <p className="text-sm whitespace-pre-line text-muted-foreground">
                                {vacancy.requirements}
                            </p>
                        </div>
                    )}

                    {vacancy.review_comment && (
                        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                            <p className="font-medium">Comentario de revisión</p>
                            <p className="mt-1 whitespace-pre-line text-muted-foreground">
                                {vacancy.review_comment}
                            </p>
                        </div>
                    )}
                </SectionCard.Body>
            </SectionCard>

            {showContact && vacancy.contact && (
                <SectionCard>
                    <SectionCard.Header
                        title="Datos de contacto"
                        description="Información de la empresa para la gestión manual de candidatos."
                    />
                    <SectionCard.Body className="grid gap-2 px-4 py-4 text-sm sm:grid-cols-2">
                        <p>
                            <span className="text-muted-foreground">RUC: </span>
                            {vacancy.contact.ruc || 'No registrado'}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Correo:{' '}
                            </span>
                            {vacancy.contact.email || 'No registrado'}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Teléfono:{' '}
                            </span>
                            {vacancy.contact.phone || 'No registrado'}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Dirección:{' '}
                            </span>
                            {vacancy.contact.address || 'No registrada'}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Representante:{' '}
                            </span>
                            {vacancy.contact.representative_name ||
                                'No registrado'}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Teléfono del representante:{' '}
                            </span>
                            {vacancy.contact.representative_phone ||
                                'No registrado'}
                        </p>
                    </SectionCard.Body>
                </SectionCard>
            )}
        </div>
    );
}
