import { Head } from '@inertiajs/react';
import { User, ChevronRight, Building2, Loader2 } from 'lucide-react';
import type { Faculty } from '@/modules/academic';
import { DetailHeader } from '@/modules/documents';

import type { InternshipAssignment } from '@/modules/internship/types';
import { dashboard } from '@/routes';
import { filter as validationFilter } from '@/routes/academic/internship/api/validation';
import { AcademicFilter } from '@/shared/components/data-table/academic-filter';
import AcademicPagination from '@/shared/components/data-table/academic-pagination';
import AcademicSearch from '@/shared/components/data-table/academic-search';
import EmptyState from '@/shared/components/empty-state';
import { Badge } from '@/shared/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import type { TableData } from '@/shared/hooks/use-config-table';
import { useRole } from '@/shared/hooks/use-role';
import AppLayout from '@/shared/layouts/app-layout';
import MasterDetailLayout from '@/shared/layouts/master-detail-layout';
import InternshipDetail from '../../components/validation/internship-detail';
import PlacementDetail from '../../components/validation/placement-detail';
import { useValidation } from '../../hooks/use-validation';

interface Props {
    assignments: TableData<InternshipAssignment>;
    faculties?: Faculty[];
    title: string;
}

export default function InternshipValidationIndex({
    assignments = [],
    faculties = [],
    title,
}: Props) {
    const { isAdmin } = useRole();

    const { tableManager, state, actions } = useValidation({
        initialData: assignments,
        isAdmin,
    });

    const onStatusUpdateSuccess = () => {
        if (state.selectedId) actions.loadDetail(state.selectedId);
        // Sincronizar tabla localmente o vía backend
        const search = tableManager.search.trim();
        const params = search ? { search } : tableManager.activeFilters || {};
        tableManager.fetchData(validationFilter.url(), params);
    };

    const breadcrumbs = [
        { title: 'Panel', href: dashboard().url },
        { title: title, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Validación de Prácticas" />

            <MasterDetailLayout
                title={title}
                description="El docente titular (coordinador académico) y los roles autorizados revisan la formalización y el seguimiento de prácticas."
                hasSelection={Boolean(state.selectedId)}
                masterWidthClassName="w-87.5 lg:w-95"
                toolbar={
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        {isAdmin && (
                            <AcademicFilter
                                key={tableManager.filterClearKey}
                                faculties={faculties}
                                onFilter={tableManager.handleFilter}
                                isLoading={tableManager.isSearching}
                                initialValues={tableManager.activeFilters}
                            />
                        )}
                        <AcademicSearch
                            isAdmin={isAdmin}
                            search={tableManager.search}
                            setSearch={tableManager.setSearch}
                            onSearch={tableManager.handleBackendSearch}
                            isLoading={tableManager.isSearching}
                        />
                    </div>
                }
                master={
                    <div className="relative mt-6 overflow-hidden rounded-md border bg-card">
                        {tableManager.isSearching && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60 backdrop-blur-[1px]">
                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                    <Loader2 className="size-4 animate-spin text-primary" />
                                    Cargando listado...
                                </div>
                            </div>
                        )}
                        <Table>
                            <colgroup>
                                <col className="w-[20%]" />
                                {!state.selectedId && (
                                    <>
                                        <col className="w-[25%]" />
                                        <col className="w-[24%]" />
                                        <col className="w-[10%]" />
                                    </>
                                )}
                                <col className="w-[8%]" />
                                <col className="w-[2%]" />
                            </colgroup>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre / Usuario</TableHead>
                                    {!state.selectedId && (
                                        <>
                                            <TableHead className="hidden md:table-cell">
                                                Facultad
                                            </TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Escuela
                                            </TableHead>
                                            <TableHead className="hidden lg:table-cell">
                                                Sección
                                            </TableHead>
                                        </>
                                    )}
                                    <TableHead className="text-center">
                                        Estado
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableManager.displayData.length > 0 ? (
                                    tableManager.displayData.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            onClick={() =>
                                                actions.handleSelect(item.id)
                                            }
                                            className={`group cursor-pointer transition-colors ${state.selectedId === item.id ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                                                        <User className="size-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="max-w-37.5 truncate text-xs font-bold uppercase lg:max-w-none">
                                                            {
                                                                item.user
                                                                    ?.person
                                                                    ?.surnames
                                                            }{' '}
                                                            {
                                                                item.user
                                                                    ?.person
                                                                    ?.names
                                                            }
                                                        </span>
                                                        {!state.selectedId ? (
                                                            <span className="truncate text-[10px] text-muted-foreground">
                                                                {
                                                                    item.user
                                                                        ?.email
                                                                }
                                                            </span>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                <span className="truncate text-[10px] text-muted-foreground">
                                                                    {
                                                                        item
                                                                            .section
                                                                            ?.school
                                                                            ?.name
                                                                    }
                                                                </span>
                                                                <span className="truncate text-[10px] text-muted-foreground">
                                                                    -{' '}
                                                                    {
                                                                        item
                                                                            .section
                                                                            ?.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Columnas que desaparecen en modo split */}
                                            {!state.selectedId && (
                                                <>
                                                    <TableCell className="hidden text-sm font-medium text-muted-foreground md:table-cell">
                                                        {item.section?.school
                                                            ?.faculty?.name ||
                                                            'N/A'}
                                                    </TableCell>
                                                    <TableCell className="hidden text-sm font-medium text-muted-foreground md:table-cell">
                                                        {item.section?.school
                                                            ?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="hidden font-bold lg:table-cell">
                                                        {item.section?.name ||
                                                            'N/A'}
                                                    </TableCell>
                                                </>
                                            )}

                                            <TableCell className="text-center">
                                                {!item.placement ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-none bg-slate-100 text-[9px] font-bold text-slate-500"
                                                    >
                                                        NO INICIADO
                                                    </Badge>
                                                ) : item.placement
                                                      ?.approval_status ===
                                                  1 ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-none bg-green-500 text-[9px] font-bold text-white"
                                                    >
                                                        PROCESO
                                                    </Badge>
                                                ) : item.placement
                                                      ?.approval_status ===
                                                  3 ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-none bg-red-500 text-[9px] font-bold text-white"
                                                    >
                                                        OBSERVADO
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-none bg-amber-500 text-[9px] font-bold text-white uppercase"
                                                    >
                                                        Formalización
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <ChevronRight
                                                    className={`size-4 text-muted-foreground transition-transform ${state.selectedId === item.id ? 'rotate-180 text-primary' : ''}`}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={state.selectedId ? 3 : 5}
                                            className="h-24 text-center"
                                        >
                                            <EmptyState title="No se encontraron resultados." />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <AcademicPagination
                            isAdmin={isAdmin}
                            isLoading={tableManager.isSearching}
                            links={tableManager.pagination?.links}
                            total={tableManager.pagination?.total}
                            showing={tableManager.pagination?.data?.length}
                            onPageChange={tableManager.handlePageChange}
                            currentPage={tableManager.localPage}
                            totalPages={tableManager.localTotalPages}
                            localShowing={tableManager.displayData.length}
                            localTotal={tableManager.allLocalFiltered.length}
                            onLocalPageChange={tableManager.setLocalPage}
                        />
                    </div>
                }
                detail={
                    <>
                        {state.selectedId && state.selectedItem ? (
                            <div className="flex flex-1 flex-col overflow-hidden">
                                {/* Header del detalle: Usamos data local (selectedAssignment) para inmediatez */}
                                <DetailHeader
                                    selectedItem={state.selectedItem}
                                    handleCloseSelected={actions.handleClose}
                                />

                                {/* Contenido dinámico según FASE */}
                                <div className="relative flex-1 overflow-hidden">
                                    {/* 1. Si el estudiante aún no ha iniciado nada (no tiene placement) */}
                                    {!state.selectedItem.placement ? (
                                        <div className="flex h-full flex-col items-center justify-center space-y-4 bg-slate-50/20 p-8 text-center">
                                            <div className="flex size-24 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-white text-slate-400 shadow-inner">
                                                <Building2 className="size-10" />
                                            </div>
                                            <div className="max-w-xs space-y-2">
                                                <h3 className="text-sm font-black tracking-tighter text-slate-900 uppercase">
                                                    Sin proceso iniciado
                                                </h3>
                                                <p className="text-xs leading-relaxed font-medium text-muted-foreground">
                                                    Este estudiante aún no ha
                                                    registrado su intención de
                                                    prácticas ni ha iniciado la
                                                    formalización de su puesto.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* 2. Cargando detalles remotos (requerimientos, etc) */}
                                            {state.isLoadingDetail && (
                                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Loader2 className="size-8 animate-spin text-primary" />
                                                        <span className="animate-pulse text-[10px] font-black tracking-widest text-primary/70 uppercase italic">
                                                            Cargando
                                                            expediente...
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {state.detailData &&
                                                (state.detailData.phase ===
                                                'placement' ? (
                                                    <PlacementDetail
                                                        detailData={
                                                            state.detailData
                                                        }
                                                        loadDetail={
                                                            actions.loadDetail
                                                        }
                                                        onStatusUpdateSuccess={
                                                            onStatusUpdateSuccess
                                                        }
                                                    />
                                                ) : (
                                                    <InternshipDetail
                                                        detailData={
                                                            state.detailData
                                                        }
                                                        loadDetail={
                                                            actions.loadDetail
                                                        }
                                                        onStatusUpdateSuccess={
                                                            onStatusUpdateSuccess
                                                        }
                                                    />
                                                ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed bg-slate-50/50 text-muted-foreground">
                                <div className="mb-4 flex size-20 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-white shadow-inner">
                                    <User className="size-10 text-slate-200" />
                                </div>
                                <p className="text-sm font-bold tracking-widest uppercase opacity-60">
                                    Seleccione un estudiante
                                </p>
                            </div>
                        )}
                    </>
                }
            />
        </AppLayout>
    );
}
