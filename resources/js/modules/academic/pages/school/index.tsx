import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import type { School, Faculty } from '@/modules/academic/types';
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

import CreateSchoolModal from './partials/create-school-modal';
import DeleteSchoolModal from './partials/delete-school-modal';
import UpdateSchoolModal from './partials/update-school-modal';

interface Props {
    schools: School[];
    faculties: Faculty[];
}

export default function Schools({ schools, faculties }: Props) {
    const { role } = usePage().props as any;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
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
    } = useAcademicTable<School>({
        endpoint: '',
        initialData: schools,
        isAdmin: false,
        pageSize: 10,
        localSearchFn: (school, search) =>
            school.name.toLowerCase().includes(search) ||
            (school.faculty?.name || '').toLowerCase().includes(search)
    });

    const formatId = (id: number) => `#${id.toString().padStart(3, '0')}`;

    const handleEdit = (school: School) => {
        setSelectedSchool(school);
        setIsEditOpen(true);
    };

    const handleDelete = (school: School) => {
        setSelectedSchool(school);
        setIsDeleteOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Escuelas" />
            <div className="flex h-full flex-1 flex-col gap-8 p-8">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <Heading
                        variant="small"
                        title="Escuelas Profesionales"
                        description="Gestiona las escuelas profesionales de cada facultad."
                    />
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="mt-4 text-sm font-semibold shadow-sm md:mt-0"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nueva Escuela
                    </Button>
                </div>

                <div className="flex items-center justify-start">
                    <AcademicSearch
                        role={role}
                        search={search}
                        setSearch={setSearch}
                        placeholder='Busca una escuela'
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
                                    Facultad
                                </TableHead>
                                <TableHead className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Escuela Profesional
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
                                list.map((school) => (
                                    <TableRow
                                        key={school.id}
                                        className="group h-16 border-b transition-colors hover:bg-muted/30"
                                    >
                                        <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                                            {formatId(school.id)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-medium text-muted-foreground italic">
                                                {school.faculty?.name || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-300 transition-colors group-hover:bg-blue-400 group-hover:text-white">
                                                    <GraduationCap className="h-5 w-5" />
                                                </div>
                                                <span className="text-sm font-medium text-foreground">
                                                    {school.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={
                                                    school.status === 1
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className={
                                                    school.status === 1
                                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                        : 'bg-muted text-muted-foreground'
                                                }
                                            >
                                                {school.status === 1
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
                                                        handleEdit(school)
                                                    }
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(school)
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
                                        colSpan={5}
                                        className="h-24 text-center text-muted-foreground italic"
                                    >
                                        No hay escuelas registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AcademicPagination
                    isAdmin={false}
                    total={schools.length}
                    showing={list.length}
                    onPageChange={handlePageChange}
                    currentPage={localPage}
                    totalPages={localTotalPages}
                    onLocalPageChange={setLocalPage}
                />
            </div>

            <CreateSchoolModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                faculties={faculties}
            />
            <UpdateSchoolModal
                school={selectedSchool}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                faculties={faculties}
            />
            <DeleteSchoolModal
                school={selectedSchool}
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
            />
        </AppLayout>
    );
}
