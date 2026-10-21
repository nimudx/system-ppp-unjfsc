import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, UserCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";

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
    colorScheme?: "primary" | "amber" | "red";
    maxHeight?: string;
    compact?: boolean;
    emptyMessage?: string;
}

export function StudentSelectorTable({
    students,
    selectedIds,
    onSelectionChange,
    colorScheme = "primary",
    maxHeight = "350px",
    compact = false,
    emptyMessage = "No hay estudiantes"
}: StudentSelectorProps) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = compact ? 6 : 8;

    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            const fullName = `${s.user?.person?.surnames ?? ''} ${s.user?.person?.names ?? ''}`.toLowerCase();
            const email = (s.user?.email ?? '').toLowerCase();
            const term = search.toLowerCase();
            return fullName.includes(term) || email.includes(term);
        });
    }, [students, search]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredStudents.slice(start, start + itemsPerPage);
    }, [filteredStudents, currentPage]);

    const toggleAll = (checked: boolean) => {
        if (checked) {
            const allIdsInSearch = filteredStudents.map(s => s.id);
            onSelectionChange(Array.from(new Set([...selectedIds, ...allIdsInSearch])));
        } else {
            const idsToRemove = filteredStudents.map(s => s.id);
            onSelectionChange(selectedIds.filter(id => !idsToRemove.includes(id)));
        }
    };

    const toggleRow = (id: number, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedIds, id]);
        } else {
            onSelectionChange(selectedIds.filter((sid) => sid !== id));
        }
    };

    const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.includes(s.id));

    const schemeStyles = {
        primary: "accent-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        amber: "accent-amber-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500",
        red: "accent-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500",
    };

    const textStyles = {
        primary: "text-primary",
        amber: "text-amber-500",
        red: "text-red-500",
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Buscar alumnos..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-8 h-8 text-xs bg-muted/30 focus-visible:ring-offset-0 focus-visible:ring-1 border-none shadow-none"
                    />
                </div>
                {selectedIds.length > 0 && (
                    <Badge variant="secondary" className={`text-[10px] h-5 font-bold ${textStyles[colorScheme]} bg-background border shadow-none`}>
                        {selectedIds.length} seleccionados
                    </Badge>
                )}
            </div>

            <div className={`rounded-md border bg-card overflow-hidden`} style={{ maxHeight: maxHeight }}>
                <Table>
                    <TableHeader className="bg-muted/40 sticky top-0 z-10 box-border">
                        <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-10 h-8 px-3">
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={(v) => toggleAll(!!v)}
                                    className={`size-3.5 ${schemeStyles[colorScheme]}`}
                                />
                            </TableHead>
                            <TableHead className="h-8 text-[9px] uppercase font-bold text-muted-foreground px-0">Información del Estudiante</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedStudents.length > 0 ? (
                            paginatedStudents.map((student) => (
                                <TableRow
                                    key={student.id}
                                    className={`h-9 cursor-pointer transition-colors border-b last:border-0 ${selectedIds.includes(student.id) ? 'bg-muted/30' : 'hover:bg-muted/20'}`}
                                    onClick={() => toggleRow(student.id, !selectedIds.includes(student.id))}
                                >
                                    <TableCell className="w-10 px-3 py-0" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedIds.includes(student.id)}
                                            onCheckedChange={(v) => toggleRow(student.id, !!v)}
                                            className={`size-3.5 ${schemeStyles[colorScheme]}`}
                                        />
                                    </TableCell>
                                    <TableCell className="px-0 py-1.5 pr-4">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`shrink-0 p-1 rounded-full bg-muted flex items-center justify-center`}>
                                                <UserCircle className="size-3 text-muted-foreground" />
                                            </div>
                                            <div className="flex flex-col min-w-0 leading-tight">
                                                <span className="text-[11px] font-semibold text-foreground uppercase truncate">
                                                    {student.user?.person?.surnames}, {student.user?.person?.names}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground truncate uppercase opacity-70">
                                                    {student.user?.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                    <p className="text-[10px] text-muted-foreground uppercase italic tracking-tight">{emptyMessage}</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1 border-t mt-2">
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-tighter">
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
                                setCurrentPage(p => p - 1);
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
                                setCurrentPage(p => p + 1);
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
