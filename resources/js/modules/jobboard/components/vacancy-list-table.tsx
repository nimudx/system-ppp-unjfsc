import { ChevronRight, Users } from 'lucide-react';
import EmptyState from '@/shared/components/empty-state';
import { Badge } from '@/shared/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import type { VacancySummary } from '../types';
import { formatDate } from '../utils';
import VacancyStatusBadge from './vacancy-status-badge';

export default function VacancyListTable({
    vacancies,
    selectedId,
    onSelect,
}: {
    vacancies: VacancySummary[];
    selectedId: number | null;
    onSelect: (id: number) => void;
}) {
    return (
        <div className="overflow-hidden rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Vacante</TableHead>
                        {!selectedId && (
                            <TableHead className="hidden md:table-cell">
                                Empresa
                            </TableHead>
                        )}
                        <TableHead className="text-center">Estado</TableHead>
                        {!selectedId && (
                            <TableHead className="hidden text-center lg:table-cell">
                                Límite
                            </TableHead>
                        )}
                        <TableHead className="w-8" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vacancies.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <EmptyState title="No se encontraron vacantes." />
                            </TableCell>
                        </TableRow>
                    ) : (
                        vacancies.map((vacancy) => (
                            <TableRow
                                key={vacancy.id}
                                onClick={() => onSelect(vacancy.id)}
                                className={`group cursor-pointer transition-colors ${
                                    selectedId === vacancy.id
                                        ? 'border-l-4 border-l-primary bg-primary/5'
                                        : ''
                                }`}
                            >
                                <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="max-w-52 truncate text-sm font-semibold">
                                                {vacancy.title}
                                            </span>
                                            {vacancy.is_new && (
                                                <Badge className="h-4 bg-primary px-1.5 text-[9px] font-bold text-primary-foreground uppercase">
                                                    Nuevo
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="truncate text-[11px] text-muted-foreground">
                                            {vacancy.area_name ||
                                                'Área no especificada'}
                                            {vacancy.location
                                                ? ` · ${vacancy.location}`
                                                : ''}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <Users className="size-3" />
                                            {vacancy.candidates_count}{' '}
                                            {vacancy.candidates_count === 1
                                                ? 'candidato'
                                                : 'candidatos'}
                                            <span className="mx-1 opacity-40">
                                                ·
                                            </span>
                                            {vacancy.type_label}
                                            <span className="mx-1 opacity-40">
                                                ·
                                            </span>
                                            {vacancy.modality_label}
                                        </span>
                                    </div>
                                </TableCell>

                                {!selectedId && (
                                    <TableCell className="hidden max-w-36 truncate text-xs text-muted-foreground md:table-cell">
                                        {vacancy.company?.name || 'N/A'}
                                    </TableCell>
                                )}

                                <TableCell className="text-center">
                                    <VacancyStatusBadge
                                        status={vacancy.status}
                                        label={vacancy.status_label}
                                        className="text-[10px]"
                                    />
                                </TableCell>

                                {!selectedId && (
                                    <TableCell className="hidden text-center text-xs text-muted-foreground lg:table-cell">
                                        {formatDate(vacancy.deadline_at)}
                                    </TableCell>
                                )}

                                <TableCell className="text-right">
                                    <ChevronRight
                                        className={`size-4 text-muted-foreground transition-transform ${
                                            selectedId === vacancy.id
                                                ? 'rotate-180 text-primary'
                                                : ''
                                        }`}
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
