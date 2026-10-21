import { Head, usePage } from '@inertiajs/react';
import { MoreHorizontal, Plus, Users, Pencil, Trash2 } from 'lucide-react';
import type { Faculty } from '@/modules/academic';
import { AcademicFilter } from '@/shared/components/data-table/academic-filter';
import AcademicPagination from '@/shared/components/data-table/academic-pagination';
import AcademicSearch from '@/shared/components/data-table/academic-search';
import Heading from '@/shared/components/heading';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import type { TableData } from '@/shared/hooks/use-config-table';
import AppLayout from '@/shared/layouts/app-layout';
import { type BreadcrumbItem } from '@/shared/types';

import type { InternshipGroup } from '../../../hooks/use-internship-group';
import { useInternshipGroup } from '../../../hooks/use-internship-group';
import CreateGroupModal from './partials/create-group-modal';
import DeleteGroupModal from './partials/delete-group-modal';
import EditGroupModal from './partials/edit-group-modal';

interface Props {
    groups: TableData<InternshipGroup>;
    faculties: Faculty[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Grupos', href: '#' },
    { title: 'Por Práctica', href: '#' },
];

export default function InternshipGroupsIndex({
    groups = [],
    faculties,
}: Props) {
    const { role } = usePage().props;
    const isAdmin = [1, 2].includes(Number(role));

    // --- USAMOS EL NUEVO HOOK ESPECÍFICO ---
    const { tableManager, modals, actions } = useInternshipGroup({
        initialData: groups,
        isAdmin,
    });

    const {
        displayData,
        isSearching,
        search,
        setSearch,
        filterClearKey,
        handleFilter,
        handleBackendSearch,
        localPage,
        setLocalPage,
        localTotalPages,
        handlePageChange,
        allLocalFiltered,
        data: backendData,
    } = tableManager;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grupos por Práctica" />

            <div className="flex flex-col gap-4 p-4 lg:p-6">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <Heading
                        variant="small"
                        title="Grupos por Práctica"
                        description="Gestión de grupos de prácticas pre-profesionales por sección académica."
                    />
                    <Button onClick={modals.create.open}>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Grupo
                    </Button>
                </div>

                {/* Filtros y Buscador */}
                <div className="relative z-20 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    {isAdmin && (
                        <AcademicFilter
                            key={filterClearKey}
                            faculties={faculties}
                            onFilter={handleFilter}
                            isLoading={isSearching}
                            initialValues={tableManager.activeFilters}
                        />
                    )}
                    <AcademicSearch
                        isAdmin={isAdmin}
                        search={search}
                        setSearch={setSearch}
                        onSearch={handleBackendSearch}
                        isLoading={isSearching}
                    />
                </div>

                <div className="relative overflow-hidden rounded-md border">
                    {isSearching && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60 backdrop-blur-[1px]">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Cargando...
                            </div>
                        </div>
                    )}
                    <Table className="w-full table-fixed">
                        <colgroup>
                            <col className="w-[3%]" />
                            <col className="w-[18%]" />
                            <col className="w-[10%]" />
                            <col className="w-[7%]" />
                            <col className="w-[20%]" />
                            <col className="w-[20%]" />
                            <col className="w-[17%]" />
                            <col className="w-[5%]" />
                        </colgroup>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Facultad / Escuela</TableHead>
                                <TableHead>Módulo</TableHead>
                                <TableHead>Sección</TableHead>
                                <TableHead>Docente Titular</TableHead>
                                <TableHead>Supervisor</TableHead>
                                <TableHead>Nombre del Grupo</TableHead>
                                <TableHead className="pr-6 text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayData.length > 0 ? (
                                displayData.map((group, index) => (
                                    <TableRow
                                        key={group.id}
                                        className="group transition-colors hover:bg-muted/30"
                                    >
                                        <TableCell className="font-medium text-muted-foreground">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span
                                                    className="truncate text-sm font-medium"
                                                    title={
                                                        group.section.school
                                                            .faculty.name
                                                    }
                                                >
                                                    {
                                                        group.section.school
                                                            .faculty.name
                                                    }
                                                </span>
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {group.section.school.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold tracking-tight text-blue-600 uppercase">
                                                {group.module?.name ??
                                                    'Módulo 1'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">
                                                {group.section.name}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">
                                                    {
                                                        group.teacher?.user
                                                            ?.person?.surnames
                                                    }{' '}
                                                    {
                                                        group.teacher?.user
                                                            ?.person?.names
                                                    }
                                                </span>
                                                <span
                                                    className="max-w-[150px] truncate text-[10px] text-muted-foreground"
                                                    title={
                                                        group.teacher?.user
                                                            ?.email
                                                    }
                                                >
                                                    {group.teacher?.user?.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">
                                                    {
                                                        group.supervisor?.user
                                                            ?.person?.surnames
                                                    }{' '}
                                                    {
                                                        group.supervisor?.user
                                                            ?.person?.names
                                                    }
                                                </span>
                                                <span
                                                    className="max-w-[150px] truncate text-[10px] text-muted-foreground"
                                                    title={
                                                        group.supervisor?.user
                                                            ?.email
                                                    }
                                                >
                                                    {
                                                        group.supervisor?.user
                                                            ?.email
                                                    }
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                <span className="truncate text-xs font-semibold uppercase">
                                                    {group.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-[160px]"
                                                >
                                                    <DropdownMenuLabel>
                                                        Gestión
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() =>
                                                            modals.edit.open(
                                                                group as InternshipGroup,
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                                                        Editar Grupo
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-destructive focus:text-destructive"
                                                        onClick={() =>
                                                            modals.delete.open(
                                                                group as InternshipGroup,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-24 text-center text-muted-foreground italic"
                                    >
                                        No hay grupos registrados o no coinciden
                                        con la búsqueda.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AcademicPagination
                    isAdmin={isAdmin}
                    isLoading={isSearching}
                    links={
                        (Array.isArray(backendData) ? undefined : backendData)
                            ?.links
                    }
                    total={
                        (Array.isArray(backendData) ? undefined : backendData)
                            ?.total
                    }
                    showing={
                        (Array.isArray(backendData) ? undefined : backendData)
                            ?.data?.length
                    }
                    onPageChange={handlePageChange}
                    currentPage={localPage}
                    totalPages={localTotalPages}
                    localShowing={displayData.length}
                    localTotal={allLocalFiltered.length}
                    onLocalPageChange={setLocalPage}
                />
            </div>

            {/* Modales utilizando el estado del Hook */}
            <CreateGroupModal
                open={modals.create.isOpen}
                onOpenChange={modals.create.setOpen}
                faculties={faculties}
                onSuccess={actions.refreshData}
            />

            <DeleteGroupModal
                open={modals.delete.isOpen}
                onOpenChange={modals.delete.setOpen}
                group={modals.selectedGroup}
                onSuccess={actions.refreshData}
            />

            <EditGroupModal
                open={modals.edit.isOpen}
                onOpenChange={modals.edit.setOpen}
                group={modals.selectedGroup}
                onSuccess={actions.refreshData}
            />
        </AppLayout>
    );
}
