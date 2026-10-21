import { Head, usePage } from '@inertiajs/react';
import { X, Users, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Faculty } from '@/modules/academic';
import type {
    InternshipGroup,
    Assignment,
} from '@/modules/supervision/hooks/use-internship-group';

import { AcademicFilter } from '@/shared/components/data-table/academic-filter';
import AcademicPagination from '@/shared/components/data-table/academic-pagination';
import AcademicSearch from '@/shared/components/data-table/academic-search';
import Heading from '@/shared/components/heading';
import { Button } from '@/shared/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import { useConfigTable } from '@/shared/hooks/use-config-table';
import AppLayout from '@/shared/layouts/app-layout';
import StudentManagementTabs from './partials/student-management-tabs';

interface Props {
    groups: InternshipGroup[];
    students: Assignment[];
    faculties?: Faculty[];
}

export default function StudentGroupIndex({
    groups = [],
    faculties = [],
}: Props) {
    const { role } = usePage().props;
    const isAdmin = [1, 2].includes(Number(role));

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const {
        data: localGroups,
        displayData,
        allLocalFiltered,
        isSearching,
        search,
        setSearch,
        activeFilters,
        filterClearKey,
        handleFilter,
        handleBackendSearch,
        localPage,
        setLocalPage,
        localTotalPages,
        handlePageChange,
    } = useConfigTable({
        endpoint: '/api/groups/internship/filter',
        initialData: groups,
        isAdmin,
        pageSize: 15,
        onLocalSearch: (a, term) => {
            return (
                a.name.toLowerCase().includes(term) ||
                a.section?.school?.name?.toLowerCase().includes(term) ||
                (a.module?.name ?? '').toLowerCase().includes(term)
            );
        },
    });

    const selectedItem = displayData.find((item) => item.id === selectedId);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Grupos por Estudiante', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grupos por Estudiante" />

            <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title="Gestión de Grupos Estudiante"
                        description="Administre la asignación, movimiento y retiro de estudiantes por grupo."
                    />
                </div>

                <div className="relative flex flex-1 gap-6 overflow-hidden pr-1 pb-1">
                    {/* PANEL IZQUIERDO: Listado de Grupos */}
                    <aside
                        className={`flex shrink-0 flex-col transition-all duration-300 ease-in-out ${selectedId ? 'w-[350px] lg:w-[400px]' : 'w-full'} `}
                    >
                        {/* Filtro + Buscador */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            {isAdmin && (
                                <AcademicFilter
                                    key={filterClearKey}
                                    faculties={faculties}
                                    onFilter={handleFilter}
                                    isLoading={isSearching}
                                    initialValues={activeFilters}
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

                        <div className="relative mt-6 overflow-hidden rounded-md border bg-card">
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
                                    <col className="w-[20%]" />
                                    {!selectedId && <col className="w-[10%]" />}
                                    {!selectedId && <col className="w-[20%]" />}
                                    {!selectedId && <col className="w-[20%]" />}
                                    {!selectedId && <col className="w-[10%]" />}
                                    <col className="w-[5%]" />
                                </colgroup>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Grupo / Info</TableHead>
                                        {!selectedId && (
                                            <>
                                                <TableHead>Módulo</TableHead>
                                                <TableHead>Facultad</TableHead>
                                                <TableHead>Escuela</TableHead>
                                                <TableHead>Sección</TableHead>
                                            </>
                                        )}
                                        <TableHead className="pr-4 text-center">
                                            Acciones
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayData.length > 0 ? (
                                        displayData.map((group) => (
                                            <TableRow
                                                key={group.id}
                                                onClick={() =>
                                                    setSelectedId(group.id)
                                                }
                                                className={`group cursor-pointer transition-colors ${selectedId === group.id ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10">
                                                            <Users className="size-4 text-indigo-500" />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="truncate text-sm font-bold">
                                                                {group.name}
                                                            </span>
                                                            {selectedId ? (
                                                                <span className="truncate text-[10px] text-muted-foreground">
                                                                    {
                                                                        group
                                                                            .section
                                                                            .school
                                                                            .name
                                                                    }{' '}
                                                                    -{' '}
                                                                    {
                                                                        group
                                                                            .section
                                                                            .name
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="truncate text-[10px] text-muted-foreground italic">
                                                                    {group
                                                                        .supervisor
                                                                        ?.user
                                                                        ?.person
                                                                        ? `${group.supervisor.user.person.surnames} ${group.supervisor.user.person.names}`
                                                                        : 'Sin supervisor'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {!selectedId && (
                                                    <>
                                                        <TableCell>
                                                            <div className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold tracking-tight text-blue-600 uppercase">
                                                                {group.module
                                                                    ?.name ??
                                                                    'Módulo 1'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {
                                                                group.section
                                                                    .school
                                                                    .faculty
                                                                    .name
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {
                                                                group.section
                                                                    .school.name
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-xs font-bold">
                                                            {group.section.name}
                                                        </TableCell>
                                                    </>
                                                )}

                                                <TableCell className="pr-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {!selectedId && (
                                                            <span className="text-[10px] font-bold tracking-tighter text-primary uppercase opacity-0 transition-opacity group-hover:opacity-100">
                                                                Administrar
                                                            </span>
                                                        )}
                                                        <ChevronRight
                                                            className={`size-4 text-muted-foreground transition-transform ${selectedId === group.id ? 'rotate-180 text-primary' : ''}`}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={selectedId ? 2 : 6}
                                                className="h-24 text-center text-muted-foreground italic"
                                            >
                                                {isAdmin &&
                                                displayData.length === 0 &&
                                                !search &&
                                                !activeFilters
                                                    ? 'Usa el filtro o buscador para cargar grupos.'
                                                    : 'No se encontraron resultados'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <AcademicPagination
                                isAdmin={isAdmin}
                                isLoading={isSearching}
                                links={
                                    (Array.isArray(localGroups)
                                        ? undefined
                                        : localGroups
                                    )?.links
                                }
                                total={
                                    (Array.isArray(localGroups)
                                        ? undefined
                                        : localGroups
                                    )?.total
                                }
                                showing={
                                    (Array.isArray(localGroups)
                                        ? undefined
                                        : localGroups
                                    )?.data?.length
                                }
                                onPageChange={handlePageChange}
                                currentPage={localPage}
                                totalPages={localTotalPages}
                                localShowing={displayData.length}
                                localTotal={allLocalFiltered.length}
                                onLocalPageChange={setLocalPage}
                            />
                        </div>
                    </aside>

                    {/* PANEL DERECHO: Gestión de Estudiantes */}
                    <main
                        className={`flex min-w-0 flex-1 flex-col transition-all duration-500 ease-in-out ${selectedId ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-[50px] opacity-0'} `}
                    >
                        {selectedItem ? (
                            <div className="flex flex-1 flex-col">
                                <div className="mb-6 flex items-center justify-between rounded-lg border p-3">
                                    <div className="mr-4 flex items-center gap-2 overflow-hidden">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                            <Users className="size-5 text-primary" />
                                        </div>
                                        <div className="flex min-w-0 flex-col">
                                            <h2 className="truncate text-sm leading-tight font-bold tracking-tight">
                                                {selectedItem?.name}
                                            </h2>
                                            <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                                <span>
                                                    {
                                                        selectedItem?.section
                                                            .school.name
                                                    }
                                                </span>
                                                <ChevronRight className="size-3" />
                                                <span className="font-bold text-primary">
                                                    {selectedItem?.section.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-muted"
                                        onClick={() => setSelectedId(null)}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <StudentManagementTabs
                                        group={selectedItem}
                                        allGroups={
                                            Array.isArray(localGroups)
                                                ? localGroups
                                                : (localGroups.data ?? [])
                                        }
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 text-muted-foreground">
                                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-dashed border-muted-foreground/30 bg-muted/50 ring-8 ring-muted/20">
                                    <Users className="size-8 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">
                                    Gestión de Alumnos
                                </h3>
                                <p className="mt-1 max-w-[250px] text-center text-xs text-muted-foreground">
                                    Selecciona un grupo del listado para
                                    administrar sus alumnos, moverlos o
                                    retirarlos.
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}
