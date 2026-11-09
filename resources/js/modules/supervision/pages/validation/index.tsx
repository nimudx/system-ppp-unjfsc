import { Head } from '@inertiajs/react';

import { Info, ShieldCheck, User, X } from 'lucide-react';

import type { Faculty } from '@/modules/academic';
import {
    DOCUMENT_STATUS_BADGE as statusConfig,
    ValidationPanel,
} from '@/modules/documents';
import type { GroupOption } from '@/modules/supervision/components/group-selector';
import { GroupSelector } from '@/modules/supervision/components/group-selector';
import { ModuleSelector } from '@/modules/supervision/components/module-selector';
import type { StudentSupervision } from '@/modules/supervision/types';
import { submission as supervisionSubmission } from '@/routes/academic/supervision';
import { AcademicFilter } from '@/shared/components/data-table/academic-filter';

import AcademicSearch from '@/shared/components/data-table/academic-search';
import { Button } from '@/shared/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import type { TableData } from '@/shared/hooks/use-config-table';
import { useRole } from '@/shared/hooks/use-role';

import AppLayout from '@/shared/layouts/app-layout';
import MasterDetailLayout from '@/shared/layouts/master-detail-layout';
import { type BreadcrumbItem } from '@/shared/types';

import SupervisionDetailPanel from '../../components/supervision-detail-panel';
import SupervisionTable from '../../components/supervision-table';
import { useSupervision } from '../../hooks/use-supervision';

interface Props {
    faculties: Faculty[];
    groups: GroupOption[];
    students: TableData<StudentSupervision>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Supervisión de prácticas', href: supervisionSubmission.url() },
];

export default function ValidationIndex({
    faculties,
    groups,
    students,
}: Props) {
    const { isAdmin } = useRole();

    const { tableManager, state, actions } = useSupervision({
        initialData: students,
        groups,
        isAdmin,
    });

    const {
        selectedId,
        selectedItem,
        selectedGroup,
        selectedModuleId,
        availableGroups,
        annexes,
        selectedAnnexIdx,
        isAnnexesLoading,
        isSearchingByCode,
        codeSearch,
        isFilteringGroups,
    } = state;

    const {
        handleSelect,
        handleCloseSelected,
        handleGroupSelect,
        handleFilter,
        handleCodeSearch,
        setCodeSearch,
        handleModuleSelect,
        setSelectedAnnexIdx,
    } = actions;

    const { isSearching, search, setSearch, filterClearKey, activeFilters } =
        tableManager;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supervisión" />
            <MasterDetailLayout
                title="Validación de Supervisión"
                description="Revisión de anexos y notas enviadas por los supervisores de práctica."
                headerAction={
                    <div className="flex items-center gap-2 rounded-xl border border-green-500 bg-green-500/60 p-2 px-3">
                        <ShieldCheck className="size-4" />
                        <span className="text-[10px] font-bold tracking-widest uppercase">
                            Módulo de Control
                        </span>
                    </div>
                }
                hasSelection={Boolean(selectedId)}
                headerClassName="items-center"
                masterWidthClassName="w-85 lg:w-95"
                detailClassName="gap-4 overflow-hidden"
                toolbar={
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {isAdmin && (
                                <AcademicFilter
                                    key={filterClearKey}
                                    faculties={faculties}
                                    onFilter={handleFilter}
                                    isLoading={isSearching}
                                    initialValues={activeFilters}
                                />
                            )}
                            <GroupSelector
                                groups={availableGroups}
                                selectedGroup={selectedGroup}
                                onSelect={handleGroupSelect}
                                isLoading={isFilteringGroups}
                                disabled={
                                    availableGroups.length === 0 &&
                                    !isFilteringGroups
                                }
                            />
                            {selectedGroup && (
                                <ModuleSelector
                                    groupModuleId={selectedGroup.module_id}
                                    selectedModuleId={selectedModuleId}
                                    onSelect={handleModuleSelect}
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {isAdmin ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none"
                                        placeholder="Buscar por código..."
                                        value={codeSearch}
                                        onChange={(e) =>
                                            setCodeSearch(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' &&
                                            handleCodeSearch()
                                        }
                                        disabled={isSearchingByCode}
                                    />
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="h-9 px-3"
                                        onClick={handleCodeSearch}
                                        disabled={
                                            isSearchingByCode ||
                                            !codeSearch.trim()
                                        }
                                    >
                                        {isSearchingByCode ? '...' : 'Buscar'}
                                    </Button>
                                    {codeSearch && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-muted-foreground"
                                            onClick={() => {
                                                setCodeSearch('');
                                            }}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <AcademicSearch
                                    isAdmin={isAdmin}
                                    search={search}
                                    setSearch={setSearch}
                                    isLoading={isSearching}
                                />
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="size-4 shrink-0 cursor-help text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">
                                        {isAdmin
                                            ? 'Busca por código de usuario del estudiante'
                                            : 'Filtro → Grupo → Módulo → Estudiante'}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                }
                master={
                    <SupervisionTable
                        tableManager={tableManager}
                        isAdmin={isAdmin}
                        selectedId={selectedId}
                        selectedModuleId={selectedModuleId}
                        selectedGroup={selectedGroup}
                        statusConfig={statusConfig}
                        onSelect={handleSelect}
                    />
                }
                detail={
                    <>
                        {selectedId && selectedItem ? (
                            <SupervisionDetailPanel
                                selectedItem={selectedItem}
                                selectedModuleId={selectedModuleId!}
                                annexes={annexes}
                                selectedIdx={selectedAnnexIdx}
                                onSelectIdx={setSelectedAnnexIdx}
                                isLoading={isAnnexesLoading}
                                onClose={handleCloseSelected}
                                renderActionForm={(annex) => (
                                    <ValidationPanel
                                        status={annex.status}
                                        history={annex.history}
                                        showFileInfo={
                                            annex.latest
                                                ? {
                                                      name: annex.title,
                                                      grade: annex.grade,
                                                  }
                                                : undefined
                                        }
                                        extendForm={true}
                                        onSuccess={(data) =>
                                            actions.validateAnnex(data, annex)
                                        }
                                    />
                                )}
                            />
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 text-muted-foreground">
                                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-dashed border-muted-foreground/30 bg-muted/50 ring-8 ring-muted/20">
                                    <User className="size-8 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">
                                    Expediente Alumno
                                </h3>
                                <p className="mt-1 max-w-[250px] text-center text-xs text-muted-foreground">
                                    Selecciona un estudiante del listado para
                                    revisar sus anexos y validar su progreso.
                                </p>
                            </div>
                        )}
                    </>
                }
            />
        </AppLayout>
    );
}
