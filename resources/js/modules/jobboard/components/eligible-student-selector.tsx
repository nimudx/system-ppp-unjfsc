import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Search,
    UserCircle,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import EmptyState from '@/shared/components/empty-state';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import type { EligibleStudent } from '../types';
import CvPreviewDialog from './cv-preview-dialog';

const ITEMS_PER_PAGE = 5;

/**
 * Selector de estudiantes elegibles para proponer a una vacante.
 * Basado en el patrón visual de StudentSelectorTable, pero con el payload
 * plano de JobBoard (récord, CV y marca de propuesta previa).
 */
export default function EligibleStudentSelector({
    students,
    selectedIds,
    onChange,
}: {
    students: EligibleStudent[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
}) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [preview, setPreview] = useState<EligibleStudent | null>(null);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return students;

        return students.filter((student) =>
            [
                student.name,
                student.email,
                student.dni,
                student.code,
                student.school,
                student.section,
            ]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(term)),
        );
    }, [students, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const page = Math.min(currentPage, totalPages);
    const pageStudents = filtered.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE,
    );

    const selectable = filtered.filter((student) => !student.already_proposed);
    const allSelected =
        selectable.length > 0 &&
        selectable.every((student) =>
            selectedIds.includes(student.assignment_id),
        );

    const toggleAll = (checked: boolean) => {
        if (checked) {
            onChange([
                ...new Set([
                    ...selectedIds,
                    ...selectable.map((student) => student.assignment_id),
                ]),
            ]);
        } else {
            const ids = selectable.map((student) => student.assignment_id);
            onChange(selectedIds.filter((id) => !ids.includes(id)));
        }
    };

    const toggleRow = (student: EligibleStudent) => {
        if (student.already_proposed) return;

        onChange(
            selectedIds.includes(student.assignment_id)
                ? selectedIds.filter((id) => id !== student.assignment_id)
                : [...selectedIds, student.assignment_id],
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, DNI, código o correo..."
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-9 pl-8 text-xs"
                    />
                </div>
                {selectedIds.length > 0 && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {selectedIds.length} seleccionado
                        {selectedIds.length === 1 ? '' : 's'}
                    </Badge>
                )}
            </div>

            <div className="max-h-87.5 overflow-auto rounded-md border">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted/40">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-9 px-3">
                                <Checkbox
                                    checked={allSelected}
                                    disabled={selectable.length === 0}
                                    onCheckedChange={(checked) =>
                                        toggleAll(checked === true)
                                    }
                                    aria-label="Seleccionar todos los elegibles"
                                />
                            </TableHead>
                            <TableHead className="text-[10px] font-semibold uppercase">
                                Estudiante
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-semibold uppercase">
                                Récord
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-semibold uppercase">
                                CV
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-semibold uppercase">
                                Propuesta
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageStudents.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center"
                                >
                                    <EmptyState
                                        title={
                                            students.length === 0
                                                ? 'No hay estudiantes elegibles en tu sección y semestre.'
                                                : 'No hay estudiantes que coincidan con la búsqueda.'
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            pageStudents.map((student) => {
                                const selected = selectedIds.includes(
                                    student.assignment_id,
                                );

                                return (
                                    <TableRow
                                        key={student.assignment_id}
                                        onClick={() => toggleRow(student)}
                                        className={`transition-colors ${
                                            student.already_proposed
                                                ? 'opacity-60'
                                                : 'cursor-pointer hover:bg-muted/20'
                                        } ${selected ? 'bg-muted/30' : ''}`}
                                    >
                                        <TableCell
                                            className="px-3"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            <Checkbox
                                                checked={selected}
                                                disabled={
                                                    student.already_proposed
                                                }
                                                onCheckedChange={() =>
                                                    toggleRow(student)
                                                }
                                                aria-label={`Seleccionar a ${student.name ?? 'estudiante'}`}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                                                    <UserCircle className="size-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex min-w-0 flex-col leading-tight">
                                                    <span className="truncate text-[11px] font-semibold uppercase">
                                                        {student.name ??
                                                            'Estudiante'}
                                                    </span>
                                                    <span className="truncate text-[10px] text-muted-foreground">
                                                        {student.code
                                                            ? `Código: ${student.code} · `
                                                            : ''}
                                                        {student.dni
                                                            ? `DNI: ${student.dni}`
                                                            : student.email}
                                                    </span>
                                                    <span className="truncate text-[10px] text-muted-foreground opacity-80">
                                                        {student.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {student.record_approved ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-500/20 bg-emerald-500/10 text-[9px] text-emerald-600 dark:text-emerald-400"
                                                >
                                                    <CheckCircle2 className="mr-1 size-3" />
                                                    Aprobado
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="border-red-500/20 bg-red-500/10 text-[9px] text-red-600 dark:text-red-400"
                                                >
                                                    <XCircle className="mr-1 size-3" />
                                                    Pendiente
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell
                                            className="text-center"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            {student.cv ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-[10px]"
                                                    onClick={() =>
                                                        setPreview(student)
                                                    }
                                                >
                                                    <FileText className="mr-1 size-3.5" />
                                                    Ver CV
                                                </Button>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">
                                                    Sin CV
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {student.already_proposed ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[9px]"
                                                >
                                                    Ya propuesto
                                                </Badge>
                                            ) : selected ? (
                                                <Badge className="text-[9px]">
                                                    Seleccionado
                                                </Badge>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">
                        Página {page} de {totalPages} · {filtered.length}{' '}
                        estudiante
                        {filtered.length === 1 ? '' : 's'}
                    </p>
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            disabled={page === 1}
                            onClick={() => setCurrentPage((value) => value - 1)}
                        >
                            <ChevronLeft className="size-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            disabled={page === totalPages}
                            onClick={() => setCurrentPage((value) => value + 1)}
                        >
                            <ChevronRight className="size-3.5" />
                        </Button>
                    </div>
                </div>
            )}

            <CvPreviewDialog
                cv={preview?.cv ?? null}
                open={preview !== null}
                onOpenChange={(open) => {
                    if (!open) setPreview(null);
                }}
            />
        </div>
    );
}
