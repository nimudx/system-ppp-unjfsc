import { Head, usePage } from '@inertiajs/react';
import { GraduationCap, LayoutGrid, Plus } from 'lucide-react';
import { useState } from 'react';
import type { School } from '@/modules/academic/types';
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
import ManageSectionsModal from './partials/manage-sections-modal';

interface Props {
    schools: School[];
}

export default function Sections({ schools }: Props) {
    const { role } = usePage().props as any;
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
    const [isManageOpen, setIsManageOpen] = useState(false);

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

    const selectedSchool = schools.find(s => s.id === selectedSchoolId) || null;

    const formatId = (id: number) => `#${id.toString().padStart(3, '0')}`;

    const handleManage = (school: School) => {
        setSelectedSchoolId(school.id);
        setIsManageOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Secciones" />
            <div className="flex h-full flex-1 flex-col gap-8 p-8">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <Heading
                        variant="small"
                        title="Gestión de Secciones"
                        description="Configura las secciones disponibles para cada escuela en este semestre."
                    />
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
                                <TableHead className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Facultad
                                </TableHead>
                                <TableHead className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Escuela Profesional
                                </TableHead>
                                <TableHead className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Secciones Activas
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
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(school.sections && school.sections.length > 0) ? (
                                                    school.sections.map((section) => (
                                                        <Badge
                                                            key={section.id}
                                                            variant="default"
                                                            className="bg-primary/10 text-primary hover:bg-primary/20"
                                                        >
                                                            {section.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        Sin secciones
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleManage(school)}
                                                className="h-8 gap-1.5 text-xs font-semibold"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Gestionar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center text-muted-foreground italic"
                                    >
                                        No hay escuelas configuradas.
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

            <ManageSectionsModal
                school={selectedSchool}
                open={isManageOpen}
                onOpenChange={setIsManageOpen}
            />
        </AppLayout>
    );
}
