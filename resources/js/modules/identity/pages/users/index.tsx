import { Head, Link, usePage } from '@inertiajs/react';
import { MoreHorizontal, UserCog, Settings2, Clock } from 'lucide-react';
import type { Faculty } from '@/modules/academic';

import { AcademicFilter } from '@/shared/components/data-table/academic-filter';
import AcademicPagination from '@/shared/components/data-table/academic-pagination';
import AcademicSearch from '@/shared/components/data-table/academic-search';
import Heading from '@/shared/components/heading';
import { Badge } from '@/shared/components/ui/badge';
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
import type { Assignment } from './hooks/use-user-management';

import { useUserManagement } from './hooks/use-user-management';
import ManageAssignmentModal from './partials/manage-assignment-modal';
import PendingRequestModal from './partials/pending-request-modal';

interface Props {
    assignments: TableData<Assignment>;
    faculties: Faculty[];
    roleId: number;
    title: string;
}

export default function UserManagementIndex({
    assignments: initialAssignments,
    faculties,
    roleId,
    title,
}: Props) {
    const { role } = usePage().props;
    const isAdmin = [1, 2].includes(Number(role));

    const { table, state, actions } = useUserManagement({
        initialData: initialAssignments,
        roleId,
        isAdmin,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Usuarios',
            href: '#',
        },
        {
            title: title,
            href: '#',
        },
    ];

    const isSubadmin = roleId === 2;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="flex flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title={title}
                        description={`Gestión de usuarios con rol de ${title.toLowerCase()} registrados en el semestre actual.`}
                    />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                    {isAdmin && (
                        <AcademicFilter
                            key={table.filterClearKey}
                            faculties={faculties}
                            onFilter={table.handleFilter}
                            isLoading={table.isSearching}
                            initialValues={table.activeFilters}
                        />
                    )}
                    <AcademicSearch
                        isAdmin={isAdmin}
                        search={table.search}
                        setSearch={table.setSearch}
                        onSearch={
                            isAdmin ? table.handleBackendSearch : undefined
                        }
                        isLoading={table.isSearching}
                        placeholder={
                            isAdmin
                                ? 'Buscar por email o nombre...'
                                : 'Filtrar en esta lista...'
                        }
                    />
                </div>

                <div className="overflow-hidden rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Correo electrónico</TableHead>
                                <TableHead>Apellidos y Nombres</TableHead>
                                {isSubadmin && <TableHead>Facultad</TableHead>}
                                {!isSubadmin && (
                                    <>
                                        <TableHead>
                                            Facultad / Escuela
                                        </TableHead>
                                        <TableHead>Sección</TableHead>
                                    </>
                                )}
                                <TableHead>Estado</TableHead>
                                <TableHead>Acceso</TableHead>
                                <TableHead>Solicitud</TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="transition-opacity duration-300">
                            {table.isSearching ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={isSubadmin ? 5 : 7}
                                        className="h-24 animate-pulse text-center text-sm text-muted-foreground italic opacity-50"
                                    >
                                        Cargando usuarios...
                                    </TableCell>
                                </TableRow>
                            ) : table.displayData.length > 0 ? (
                                table.displayData.map((assignment, index) => {
                                    const user = assignment.user;
                                    const person = user.person;
                                    const section = assignment.section;

                                    const isReview =
                                        assignment.review_status === 1;

                                    // Determinar facultad, escuela y sección según el tipo de registro
                                    const facultyName =
                                        section?.school?.faculty?.name ||
                                        section?.faculty?.name ||
                                        'N/A';
                                    const schoolName =
                                        section?.school?.name || 'N/A';
                                    const sectionName = section?.name || 'N/A';

                                    return (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="font-medium text-muted-foreground">
                                                {(table.localPage - 1) * 15 +
                                                    index +
                                                    1}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {user.email}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {person.surnames} {person.names}
                                            </TableCell>
                                            {isSubadmin && (
                                                <TableCell>
                                                    {facultyName}
                                                </TableCell>
                                            )}
                                            {!isSubadmin && (
                                                <>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-muted-foreground">
                                                                {facultyName}
                                                            </span>
                                                            <span>
                                                                {schoolName}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {sectionName}
                                                    </TableCell>
                                                </>
                                            )}
                                            <TableCell>
                                                {assignment.approval_status ===
                                                1 ? (
                                                    <Badge variant="default">
                                                        Validado
                                                    </Badge>
                                                ) : assignment.approval_status ===
                                                  2 ? (
                                                    <Badge variant="outline">
                                                        Pendiente
                                                    </Badge>
                                                ) : assignment.approval_status ===
                                                  0 ? (
                                                    <Badge variant="secondary">
                                                        Rechazado
                                                    </Badge>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {assignment.access_status ===
                                                1 ? (
                                                    <Badge variant="default">
                                                        Completo
                                                    </Badge>
                                                ) : assignment.access_status ===
                                                  2 ? (
                                                    <Badge variant="secondary">
                                                        Limitado
                                                    </Badge>
                                                ) : assignment.access_status ===
                                                  3 ? (
                                                    <Badge variant="outline">
                                                        Solo lectura
                                                    </Badge>
                                                ) : assignment.access_status ===
                                                  0 ? (
                                                    <Badge variant="destructive">
                                                        Bloqueado
                                                    </Badge>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {assignment.review_status ===
                                                0 ? (
                                                    <Badge variant="secondary">
                                                        Ninguno
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="default">
                                                        Pendiente
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Abrir menú
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-[160px]"
                                                    >
                                                        <DropdownMenuLabel>
                                                            Acciones
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href="#"
                                                                className="flex cursor-pointer items-center"
                                                            >
                                                                <UserCog className="mr-2 h-4 w-4 text-blue-500" />
                                                                Editar Perfil
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {!isReview && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    actions.openManageModal(
                                                                        assignment,
                                                                    )
                                                                }
                                                                className="flex cursor-pointer items-center"
                                                            >
                                                                <Settings2 className="mr-2 h-4 w-4 text-orange-500" />
                                                                Gestionar Asig.
                                                            </DropdownMenuItem>
                                                        )}
                                                        {isReview && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    actions.openPendingModal(
                                                                        assignment,
                                                                    )
                                                                }
                                                                className="flex cursor-pointer items-center"
                                                            >
                                                                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                                                Solicitud
                                                                Pendiente
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={isSubadmin ? 5 : 7}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No hay usuarios registrados con este
                                        rol.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AcademicPagination
                    isAdmin={isAdmin}
                    isLoading={table.isSearching}
                    links={table.pagination?.links}
                    total={
                        isAdmin
                            ? table.pagination?.total || 0
                            : Array.isArray(initialAssignments)
                              ? initialAssignments.length
                              : (initialAssignments.total ?? 0)
                    }
                    showing={table.displayData.length}
                    onPageChange={table.handlePageChange}
                    currentPage={table.localPage}
                    totalPages={table.localTotalPages}
                    onLocalPageChange={table.setLocalPage}
                />
            </div>

            <ManageAssignmentModal
                assignment={state.selectedAssignment}
                open={state.isManageModalOpen}
                onOpenChange={actions.setIsManageModalOpen}
                onSuccess={actions.reload}
            />
            <PendingRequestModal
                assignment={state.selectedAssignment}
                open={state.isPendingModalOpen}
                onOpenChange={actions.setIsPendingModalOpen}
                onSuccess={actions.reload}
            />
        </AppLayout>
    );
}
