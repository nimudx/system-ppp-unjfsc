import { Search, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
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

interface Person {
    names: string;
    surnames: string;
}

interface User {
    email: string;
    person: Person;
}

interface StudentAssignment {
    id: number;
    user: User;
}

interface StudentSelectorProps {
    students: StudentAssignment[];
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
    colorScheme?: 'primary' | 'amber' | 'red';
    maxHeight?: string;
    compact?: boolean;
    emptyMessage?: string;
}

export function StudentSelectorTable({
    students,
    selectedIds,
    onSelectionChange,
    colorScheme = 'primary',
    maxHeight = '350px',
    compact = false,
    emptyMessage = 'No hay estudiantes',
}: StudentSelectorProps) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = compact ? 6 : 8;

    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            const fullName =
                `${s.user?.person?.surnames ?? ''} ${s.user?.person?.names ?? ''}`.toLowerCase();
            const email = (s.user?.email ?? '').toLowerCase();
            const term = search.toLowerCase();
            return fullName.includes(term) || email.includes(term);
        });
    }, [students, search]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredStudents.slice(start, start + itemsPerPage);
    }, [filteredStudents, currentPage, itemsPerPage]);

    const toggleAll = (checked: boolean) => {
        if (checked) {
            const allIdsInSearch = filteredStudents.map((s) => s.id);
            onSelectionChange(
                Array.from(new Set([...selectedIds, ...allIdsInSearch])),
            );
        } else {
            const idsToRemove = filteredStudents.map((s) => s.id);
            onSelectionChange(
                selectedIds.filter((id) => !idsToRemove.includes(id)),
            );
        }
    };

    const toggleRow = (id: number, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedIds, id]);
        } else {
            onSelectionChange(selectedIds.filter((sid) => sid !== id));
        }
    };

    const isAllSelected =
        filteredStudents.length > 0 &&
        filteredStudents.every((s) => selectedIds.includes(s.id));

    const schemeStyles = {
        primary:
            'accent-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary',
        amber: 'accent-amber-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500',
        red: 'accent-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500',
    };

    const textStyles = {
        primary: 'text-primary',
        amber: 'text-amber-500',
        red: 'text-red-500',
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar alumnos..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-8 border-none bg-muted/30 pl-8 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-offset-0"
                    />
                </div>
                {selectedIds.length > 0 && (
                    <Badge
                        variant="secondary"
                        className={`h-5 text-[10px] font-bold ${textStyles[colorScheme]} border bg-background shadow-none`}
                    >
                        {selectedIds.length} seleccionados
                    </Badge>
                )}
            </div>

            <div
                className={`overflow-hidden rounded-md border bg-card`}
                style={{ maxHeight: maxHeight }}
            >
                <Table>
                    <TableHeader className="sticky top-0 z-10 box-border bg-muted/40">
                        <TableRow className="border-b hover:bg-transparent">
                            <TableHead className="h-8 w-10 px-3">
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={(v) => toggleAll(!!v)}
                                    className={`size-3.5 ${schemeStyles[colorScheme]}`}
                                />
                            </TableHead>
                            <TableHead className="h-8 px-0 text-[9px] font-bold text-muted-foreground uppercase">
                                Información del Estudiante
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedStudents.length > 0 ? (
                            paginatedStudents.map((student) => (
                                <TableRow
                                    key={student.id}
                                    className={`h-9 cursor-pointer border-b transition-colors last:border-0 ${selectedIds.includes(student.id) ? 'bg-muted/30' : 'hover:bg-muted/20'}`}
                                    onClick={() =>
                                        toggleRow(
                                            student.id,
                                            !selectedIds.includes(student.id),
                                        )
                                    }
                                >
                                    <TableCell
                                        className="w-10 px-3 py-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Checkbox
                                            checked={selectedIds.includes(
                                                student.id,
                                            )}
                                            onCheckedChange={(v) =>
                                                toggleRow(student.id, !!v)
                                            }
                                            className={`size-3.5 ${schemeStyles[colorScheme]}`}
                                        />
                                    </TableCell>
                                    <TableCell className="px-0 py-1.5 pr-4">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div
                                                className={`flex shrink-0 items-center justify-center rounded-full bg-muted p-1`}
                                            >
                                                <UserCircle className="size-3 text-muted-foreground" />
                                            </div>
                                            <div className="flex min-w-0 flex-col leading-tight">
                                                <span className="truncate text-[11px] font-semibold text-foreground uppercase">
                                                    {
                                                        student.user?.person
                                                            ?.surnames
                                                    }
                                                    ,{' '}
                                                    {
                                                        student.user?.person
                                                            ?.names
                                                    }
                                                </span>
                                                <span className="truncate text-[10px] text-muted-foreground uppercase opacity-70">
                                                    {student.user?.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={2}
                                    className="h-24 text-center"
                                >
                                    <p className="text-[10px] tracking-tight text-muted-foreground uppercase italic">
                                        {emptyMessage}
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="mt-2 flex items-center justify-between border-t pt-1">
                    <p className="text-[9px] font-medium tracking-tighter text-muted-foreground uppercase">
                        Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={currentPage === 1}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPage((p) => p - 1);
                            }}
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={currentPage === totalPages}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPage((p) => p + 1);
                            }}
                        >
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
