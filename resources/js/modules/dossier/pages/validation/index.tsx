import { Head, usePage } from '@inertiajs/react';
import { AcademicFilter } from '@/shared/components/academic/academic-filter';
import AcademicPagination from '@/shared/components/academic/academic-pagination';
import AcademicSearch from '@/shared/components/academic/academic-search';
import Heading from '@/shared/components/heading';
import AppLayout from '@/shared/layouts/app-layout';
import { type Faculty } from '@/shared/types';
import DossierDetailPanel from '../../components/dossier-detail-panel';
import DossierTable from '../../components/dossier-table';
import { useDossierValidation } from '../../hooks/use-dossier-validation';

interface Props {
    title: string;
    faculties: Faculty[];
    assignments: any;
    dossier: any;
    requirements: any;
    target_role_id: number;
}

export default function DossierValidationIndex({ ...props }: Props) {
    const {
        title,
        faculties,
        assignments: initialAssignments,
        target_role_id,
    } = props;

    const { role } = usePage().props as any;
    const isAdmin = [1, 2].includes(Number(role));

    const { tableManager, state, actions } = useDossierValidation({
        initialData: initialAssignments,
        target_role_id,
        isAdmin,
    });

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: title, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Validación" />

            <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title={title}
                        description="Gestione y valide los archivos requeridos para su expediente."
                    />
                </div>

                <div className="relative flex flex-1 gap-6 overflow-hidden pr-1 pb-1">
                    {/* PANEL IZQUIERDO: Maestros o Lista Seleccionada */}
                    <aside
                        className={`flex shrink-0 flex-col transition-all duration-300 ease-in-out ${state.selectedId ? 'w-87.5 lg:w-100' : 'w-full'} `}
                    >
                        {/* Buscador Superior, si no es Admin, el academic search que este en el panel derecho */}
                        <div
                            className={`flex flex-wrap items-center ${isAdmin ? 'justify-between' : 'justify-end'} gap-2`}
                        >
                            {isAdmin && (
                                <AcademicFilter
                                    key={tableManager.filterClearKey}
                                    faculties={faculties}
                                    onFilter={tableManager.handleFilter}
                                    isLoading={tableManager.isSearching}
                                    initialValues={tableManager.activeFilters as any}
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
                        {/* Listado / Tabla */}
                        <div className="relative mt-6 rounded-md border bg-card">
                            {/* Overlay de carga: no destruye la tabla, solo la opaca */}
                            {tableManager.isSearching && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60 backdrop-blur-[1px]">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        Cargando...
                                    </div>
                                </div>
                            )}
                            <DossierTable
                                data={tableManager.displayData}
                                isLoading={tableManager.isSearching}
                                selectedId={state.selectedId}
                                onSelect={actions.handleSelect}
                                search={tableManager.search}
                            />

                            <AcademicPagination
                                isAdmin={isAdmin}
                                isLoading={tableManager.isSearching}
                                // Props para Admin (API)
                                links={(tableManager.data as any)?.links}
                                total={(tableManager.data as any)?.total}
                                showing={
                                    (tableManager.data as any)?.data?.length
                                }
                                onPageChange={tableManager.handlePageChange}
                                // Props para Docente (Local)
                                currentPage={tableManager.localPage}
                                totalPages={tableManager.localTotalPages}
                                localShowing={tableManager.displayData.length}
                                localTotal={
                                    tableManager.allLocalFiltered.length
                                }
                                onLocalPageChange={(p) => {
                                    tableManager.setLocalPage(p);
                                }}
                            />
                        </div>
                    </aside>
                    {/* PANEL DERECHO: Detalle de Gestión */}
                    <main
                        className={`flex min-w-0 flex-1 flex-col transition-all duration-500 ease-in-out ${state.selectedId
                                ? 'translate-x-0 opacity-100'
                                : 'pointer-events-none translate-x-12.5 opacity-0'
                            }`}
                    >
                        <DossierDetailPanel
                            selectedItem={state.selectedItem}
                            detail={state.itemDetail}
                            selectedType={state.selectedType}
                            setSelectedType={actions.setSelectedType}
                            previewEnabled={state.previewEnabled}
                            setPreviewEnabled={actions.setPreviewEnabled}
                            handleCloseSelected={actions.handleCloseSelected}
                            handleSaveValidation={actions.handleSaveValidation}
                            isSavingValidation={state.isSavingValidation}
                        />
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}
