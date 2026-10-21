import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Building } from 'lucide-react';
import { useState } from 'react';
import type { Faculty } from '@/modules/academic/types';
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

import CreateFacultyModal from './partials/create-faculty-modal';
import DeleteFacultyModal from './partials/delete-faculty-modal';
import UpdateFacultyModal from './partials/update-faculty-modal';



interface Props {
    faculties: Faculty[];
}

export default function Faculties({ faculties }: Props) {
    const { role } = usePage().props as any;
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const {
        displayData: list,
        search,
        setSearch,
        localPage,
        setLocalPage,
        localTotalPages,
        handlePageChange
    } = useAcademicTable<Faculty>({
        endpoint: '',
        initialData: faculties,
        isAdmin: false,
        pageSize: 10,
        localSearchFn: (faculty, search) =>
            faculty.name.toLowerCase().includes(search) ||
            `#${faculty.id}`.includes(search)
    });

    const formatId = (id: number) => `#${id.toString().padStart(3, '0')}`;

    const handleEdit = (faculty: Faculty) => {
        setSelectedFaculty(faculty);
        setIsEditOpen(true);
    };

    const handleDelete = (faculty: Faculty) => {
        setSelectedFaculty(faculty);
        setIsDeleteOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Facultades" />
            <div className="flex h-full flex-1 flex-col gap-8 p-8">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <Heading
                        variant="small"
                        title="Facultades"
                        description="Gestiona las facultades de la universidad."
                    />
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="mt-4 text-sm font-semibold shadow-sm md:mt-0"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nueva Facultad
                    </Button>
                </div>

                <div className="flex items-center justify-start">
                    <AcademicSearch
                        role={role}
                        search={search}
                        setSearch={setSearch}
                        placeholder="Buscar facultad por nombre o ID..."
                    />
                </div>
                <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
                    <Table>
                        <TableHeader className="border-b bg-muted/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-20 pl-6 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    ID
                                </TableHead>
                                <TableHead className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Nombre de la Facultad
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
                                list.map((faculty) => (
                                    <TableRow
                                        key={faculty.id}
                                        className="group h-16 border-b transition-colors hover:bg-muted/30"
                                    >
                                        <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                                            {formatId(faculty.id)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-300 transition-colors group-hover:bg-blue-400 group-hover:text-white">
                                                    <Building className="h-5 w-5" />
                                                </div>
                                                <span className="text-sm font-medium text-foreground">
                                                    {faculty.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={
                                                    faculty.status === 1
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className={
                                                    faculty.status === 1
                                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                        : 'bg-muted text-muted-foreground'
                                                }
                                            >
                                                {faculty.status === 1
                                                    ? 'Activo'
                                                    : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEdit(faculty)
                                                    }
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(faculty)
                                                    }
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
                                        No hay facultades registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AcademicPagination
                    isAdmin={false}
                    total={faculties.length}
                    showing={list.length}
                    onPageChange={handlePageChange}
                    currentPage={localPage}
                    totalPages={localTotalPages}
                    onLocalPageChange={setLocalPage}
                />
            </div>

            <CreateFacultyModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
            />

            <UpdateFacultyModal
                faculty={selectedFaculty}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />

            <DeleteFacultyModal
                faculty={selectedFaculty}
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
            />
        </AppLayout>
    );
}
