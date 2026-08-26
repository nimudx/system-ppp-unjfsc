import { Head, usePage } from '@inertiajs/react';
import { ChevronRight, Info, ShieldCheck, User, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { AcademicFilter } from '@/components/academic/academic-filter';
import AcademicSearch from '@/components/academic/academic-search';
import { GroupSelector } from '@/components/academic/group-selector';
import { ModuleSelector } from '@/components/academic/module-selector';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import { useSupervision } from '../hooks/use-supervision';
import SupervisionDetailPanel from '../components/supervision-detail-panel';
import SupervisionTable from '../components/supervision-table';
import SubmitForm from './components/SubmitForm';
import { Tooltip, TooltipTrigger } from '@radix-ui/react-tooltip';
import { TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface Props {
    faculties: any[];
    groups: any[];
    students: any;
}

const statusConfig: Record<number, { label: string; className: string }> = {
    0: {
        label: 'Sin iniciar',
        className: 'bg-muted/60 text-muted-foreground border-transparent',
    },
    1: {
        label: 'Aprobado',
        className: 'bg-green-500/10 text-green-700 border-green-200',
    },
    2: {
        label: 'Pendiente',
        className: 'bg-amber-500/10 text-amber-700 border-amber-200',
    },
    3: {
        label: 'Observado',
        className: 'bg-red-500/10 text-red-700 border-red-200',
    },
};

const breadcrumbs = [
    { title: 'Supervisión de prácticas', href: '/supervision/submission' },
];

export default function SubmissionShow({ faculties, groups, students }: Props) {
    const { role } = usePage().props as any;
    const isAdmin = [1, 2].includes(Number(role));

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
        currentAnnex,
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

    const {
        isSearching,
        search,
        setSearch,
        filterClearKey,
        activeFilters,
        fetchData,
    } = tableManager;

    // --- ESTADOS ESPECÍFICOS DE SUMISIÓN (Para el SubmitForm) ---
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Limpiar estados temporales al cambiar de alumno o anexo
    useEffect(() => {
        setTempFile(null);
        setIsEditing(false);
    }, [selectedId, selectedAnnexIdx]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sumisión de Supervisión" />
            <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Sumisión de Supervisión"
                        description="Registro de evaluación y envío de anexos por parte del supervisor."
                    />
                    <div className="flex items-center gap-2 rounded-xl border border-blue-500 bg-blue-500/10 p-2 px-3 text-blue-700">
                        <ShieldCheck className="size-4" />
                        <span className="text-[10px] font-extrabold tracking-widest uppercase">
                            Módulo de Envío
                        </span>
                    </div>
                </div>

                <div className="relative flex flex-1 gap-6 overflow-hidden pr-1 pb-1">
                    <aside
                        className={`flex shrink-0 flex-col gap-4 transition-all duration-300 ease-in-out ${selectedId ? 'w-85 lg:w-95' : 'w-full'}`}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                {isAdmin && (
                                    <AcademicFilter
                                        key={filterClearKey}
                                        faculties={faculties}
                                        onFilter={handleFilter}
                                        isLoading={isSearching}
                                        initialValues={activeFilters as any}
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
                                            {isSearchingByCode
                                                ? '...'
                                                : 'Buscar'}
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

                        <SupervisionTable
                            tableManager={tableManager}
                            isAdmin={isAdmin}
                            selectedId={selectedId}
                            selectedModuleId={selectedModuleId}
                            selectedGroup={selectedGroup}
                            statusConfig={statusConfig}
                            onSelect={handleSelect}
                        />
                    </aside>

                    <main
                        className={`flex min-w-0 flex-1 flex-col gap-4 overflow-hidden transition-all duration-500 ease-in-out ${selectedId ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-10 opacity-0'}`}
                    >
                        {selectedId && selectedItem ? (
                            <SupervisionDetailPanel
                                selectedItem={selectedItem}
                                selectedModuleId={selectedModuleId!}
                                annexes={annexes}
                                selectedIdx={selectedAnnexIdx}
                                onSelectIdx={setSelectedAnnexIdx}
                                isLoading={isAnnexesLoading}
                                onClose={handleCloseSelected}
                                actionTitle="Envío"
                                // Lógica de subida (solo para Sumisión): se habilita si no hay archivo subido aún o si activamos edición
                                canUpload={
                                    !!currentAnnex &&
                                    !tempFile &&
                                    (!currentAnnex.latest ||
                                        (isEditing &&
                                            currentAnnex.status !== 1))
                                }
                                onUpload={(file) => setTempFile(file)}
                                tempFile={tempFile}
                                renderActionForm={(annex) => (
                                    <SubmitForm
                                        annex={annex}
                                        assignmentId={selectedId}
                                        moduleId={selectedModuleId!}
                                        tempFile={tempFile}
                                        isEditing={isEditing}
                                        onSetEditing={setIsEditing}
                                        onRemoveTemp={() => setTempFile(null)}
                                        onSuccess={() => {
                                            setTempFile(null);
                                            setIsEditing(false);
                                            actions.reloadAnnexes();
                                        }}
                                    />
                                )}
                            />
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 text-muted-foreground">
                                <User className="mb-4 size-8 text-muted-foreground/30" />
                                <h3 className="text-sm font-bold text-foreground">
                                    Gestión de Envío
                                </h3>
                                <p className="mt-1 max-w-[250px] text-center text-xs text-muted-foreground">
                                    Selecciona un estudiante para realizar el
                                    envío de sus evaluaciones y anexos.
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}
