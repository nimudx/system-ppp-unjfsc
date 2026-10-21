import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Pencil, Calendar, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { Semester } from '@/modules/academic/types';
import AcademicPagination from '@/shared/components/data-table/academic-pagination';
import AcademicSearch from '@/shared/components/data-table/academic-search';
import Heading from '@/shared/components/heading';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import { useAcademicTable } from '@/shared/hooks/use-academic-table';
import AppLayout from '@/shared/layouts/app-layout';

import BackSemesterModal from './partials/back-semester-modal';
import CloseSemesterModal from './partials/close-semester-modal';
import UpdateSemesterModal from './partials/update-semester-modal';

interface Props {
    semesters: Semester[];
}

export default function Semesters({ semesters }: Props) {
    const { role } = usePage().props as any;
    const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
        null,
    );
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCloseOpen, setIsCloseOpen] = useState(false);
    const [isBackOpen, setIsBackOpen] = useState(false);

    const {
        displayData: list,
        search,
        setSearch,
        localPage,
        setLocalPage,
        localTotalPages,
        handlePageChange
    } = useAcademicTable<Semester>({
        endpoint: '',
        initialData: semesters,
        isAdmin: false,
        pageSize: 10,
        localSearchFn: (semester, search) => 
            semester.code.toLowerCase().includes(search) || 
            semester.cycle.toLowerCase().includes(search)
    });

    const formatId = (id: number) => `#${id.toString().padStart(3, '0')}`;

    const handleEdit = (semester: Semester) => {
        setSelectedSemester(semester);
        setIsEditOpen(true);
    };

    const handleBack = (semester: Semester) => {
        setSelectedSemester(semester);
        setIsBackOpen(true);
    };

    const handleClose = (semester: Semester) => {
        setSelectedSemester(semester);
        setIsCloseOpen(true);
    };

    const activeSemester = semesters.find((s: Semester) => s.status === 1);

    return (
        <AppLayout>
            <Head title="Semesters" />
            <div className="flex h-full flex-1 flex-col gap-8 p-8">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <Heading
                        variant="small"
                        title="Semestres"
                        description="Gestiona los periodos académicos y su vigencia."
                    />
                    {activeSemester && (
                        <Button
                            onClick={() => handleClose(activeSemester)}
                            className="mt-4 text-sm font-semibold shadow-sm md:mt-0"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Finalizar Semestre
                        </Button>
                    )}
                </div>

                <div className="flex items-center justify-start">
                    <AcademicSearch
                        role={role}
                        search={search}
                        setSearch={setSearch}
                    />
                </div>
                <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
                    <Table>
                        <TableHeader className="border-b bg-muted/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-20 pl-6 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    ID
                                </TableHead>
                                <TableHead className="w-32 pl-6 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Código
                                </TableHead>
                                <TableHead className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Ciclo Académico
                                </TableHead>
                                <TableHead className="text-center text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Estado
                                </TableHead>
                                <TableHead className="pr-6 text-right text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list.length > 0 ? (
                                list.map((semester) => (
                                    <TableRow
                                        key={semester.id}
                                        className="group h-16 border-b transition-colors hover:bg-muted/30"
                                    >
                                        <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                                            {formatId(semester.id)}
                                        </TableCell>
                                        <TableCell className="pl-6 font-mono text-sm font-bold tracking-tighter text-foreground">
                                            {semester.code}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                                <span className="text-sm font-medium text-foreground italic">
                                                    {semester.cycle}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={
                                                    semester.status === 1
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className={
                                                    semester.status === 1
                                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                        : 'bg-muted text-muted-foreground'
                                                }
                                            >
                                                {semester.status === 1
                                                    ? 'Activo'
                                                    : 'Finalizado'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEdit(semester)
                                                    }
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                {semester.status === 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleBack(semester)
                                                        }
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-24 text-center text-muted-foreground italic"
                                    >
                                        No hay semestres registrados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AcademicPagination
                    isAdmin={false}
                    total={semesters.length}
                    showing={list.length}
                    onPageChange={handlePageChange}
                    currentPage={localPage}
                    totalPages={localTotalPages}
                    onLocalPageChange={setLocalPage}
                />
            </div>

            <UpdateSemesterModal
                semester={selectedSemester}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />

            <CloseSemesterModal
                semester={selectedSemester}
                open={isCloseOpen}
                onOpenChange={setIsCloseOpen}
            />

            <BackSemesterModal
                semester={selectedSemester}
                open={isBackOpen}
                onOpenChange={setIsBackOpen}
            />
        </AppLayout>
    );
}
