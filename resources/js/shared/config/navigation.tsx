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
import { useValidation } from './hooks/use-validation';
import InternshipDetail from './partials/internship-detail';
import PlacementDetail from './partials/placement-detail';

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
    const { role } = usePage().props;
    const isAdmin = [1, 2].includes(Number(role));

    const { tableManager, state, actions } = useValidation({
        initialData: assignments,
        isAdmin,
    });

    const onStatusUpdateSuccess = () => {
        if (state.selectedId) actions.loadDetail(state.selectedId);
        // Sincronizar tabla localmente o vía backend
        const search = tableManager.search.trim();
        const params = search ? { search } : tableManager.activeFilters || {};
        tableManager.fetchData('/api/internship/validation/filter', params);
    };

    const breadcrumbs = [
        { title: 'Panel', href: '/dashboard' },
        { title: title, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Validación de Prácticas" />

            <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title={title}
                        description="El docente titular (coordinador académico) y los roles autorizados revisan la formalización y el seguimiento de prácticas."
                    />
                </div>

                <div className="relative flex flex-1 gap-6 overflow-hidden pr-1 pb-1">
                    {/* PANEL IZQUIERDO: Listado de Estudiantes */}
                    <aside
                        className={`flex shrink-0 flex-col transition-all duration-300 ease-in-out ${state.selectedId ? 'w-87.5 lg:w-95' : 'w-full'} `}
                    >
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
                                                    actions.handleSelect(
                                                        item.id,
                                                    )
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
                                                                        item
                                                                            .user
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
                                                            {item.section
                                                                ?.school
                                                                ?.faculty
                                                                ?.name || 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="hidden text-sm font-medium text-muted-foreground md:table-cell">
                                                            {item.section
                                                                ?.school
                                                                ?.name || 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="hidden font-bold lg:table-cell">
                                                            {item.section
                                                                ?.name || 'N/A'}
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
                                                colSpan={
                                                    state.selectedId ? 3 : 5
                                                }
                                                className="h-24 text-center text-xs text-muted-foreground italic"
                                            >
                                                No se encontraron resultados.
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
                                localTotal={
                                    tableManager.allLocalFiltered.length
                                }
                                onLocalPageChange={tableManager.setLocalPage}
                            />
                        </div>
                    </aside>

                    {/* PANEL DERECHO: Detalle de Validación */}
                    <main
                        className={`flex min-w-0 flex-1 flex-col transition-all duration-500 ease-in-out ${
                            state.selectedId
                                ? 'translate-x-0 opacity-100'
                                : 'pointer-events-none translate-x-12.5 opacity-0'
                        }`}
                    >
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
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}


import {
    Archive,
    BadgeCheck,
    BookMarked,
    BookOpen,
    Boxes,
    Briefcase,
    Building2,
    Folder,
    LayoutDashboard,
    NotebookPen,
    Settings,
    UserPlus2,
    UserRoundCog,
    FileText,
    Users,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { submission as dossierSubmissionIndex } from '@/routes/academic/dossiers';
import { teacher as teacherDossierIndex } from '@/routes/academic/dossiers';
import { supervisor as supervisorDossierIndex } from '@/routes/academic/dossiers';
import { student as studentDossierIndex } from '@/routes/academic/dossiers';
import { index as facultiesIndex } from '@/routes/academic/faculties';
import { internship as internshipIndex } from '@/routes/academic/groups';
import { student as studentIndex } from '@/routes/academic/groups';
import { supervision as groupSupervisionIndex } from '@/routes/academic/groups';
import { reportReview as reportReviewIndex } from '@/routes/academic/internship';
import { submission as internshipSubmissionIndex } from '@/routes/academic/internship';
import { validation as internshipValidationIndex } from '@/routes/academic/internship';
import { index as schoolsIndex } from '@/routes/academic/schools';
import { index as sectionsIndex } from '@/routes/academic/sections';
import { index as semestersIndex } from '@/routes/academic/semesters';
import { index as studentsIndex } from '@/routes/academic/students';
import { index as subadminsIndex } from '@/routes/academic/subadmins';
import { student as studentSupervisionIndex } from '@/routes/academic/supervision';
import { validation as supervisionValidationIndex } from '@/routes/academic/supervision';
import { submission as supervisionSubmissionIndex } from '@/routes/academic/supervision';
import { index as supervisorsIndex } from '@/routes/academic/supervisors';
import { index as teachersIndex } from '@/routes/academic/teachers';
import { index as registerIndex } from '@/routes/register';
import { index as resourceIndex } from '@/routes/resource';

export const ACADEMIC_NAV = [
    {
        title: 'Panel',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Validaciones',
        href: '#',
        icon: BadgeCheck,
        roles: [1, 2, 3],
        items: [
            {
                title: 'Documentación',
                href: dossierSubmissionIndex().url,
                roles: [3, 4, 5],
            },
            {
                title: 'Docente Titular',
                href: teacherDossierIndex().url,
                roles: [1, 2],
            },
            {
                title: 'Docente Supervisor',
                href: supervisorDossierIndex().url,
                roles: [1, 2, 3],
            },
            {
                title: 'Estudiante',
                href: studentDossierIndex().url,
                roles: [1, 2, 3],
            },
        ],
    },
    {
        title: 'Documentación',
        href: dossierSubmissionIndex().url,
        icon: BadgeCheck,
        roles: [4, 5],
    },
    {
        title: 'Grupos',
        href: '#',
        icon: Boxes,
        roles: [1, 2, 3],
        items: [
            {
                title: 'Por Práctica',
                href: internshipIndex().url,
                roles: [1, 2, 3],
            },
            {
                title: 'Por Estudiante',
                href: studentIndex().url,
                roles: [1, 2, 3],
            },
        ],
    },
    {
        title: 'Documentos de prácticas',
        href: '#',
        icon: Folder,
        roles: [4],
        items: [
            {
                title: 'Planes de prácticas',
                href: '/internship/practice-plans',
                icon: FileText,
                roles: [4],
            },
            {
                title: 'Informes de prácticas',
                href: '/internship/practice-reports',
                icon: FileText,
                roles: [4],
            },
        ],
    },
    {
        title: 'Seguimiento',
        href: '#',
        icon: BookMarked,
        roles: [1, 2, 3],
        items: [
            {
                title: 'Est. Prácticas',
                href: internshipValidationIndex().url,
                roles: [1, 2, 3],
            },
            {
                title: 'Eval. Prácticas',
                href: supervisionSubmissionIndex().url,
                roles: [1, 2, 3],
            },
            {
                title: 'Rev. Prácticas',
                href: supervisionValidationIndex().url,
                roles: [1, 2, 3],
            },
        ],
    },
    {
        title: 'Pasantía',
        href: internshipSubmissionIndex().url,
        icon: Folder,
        roles: [5],
    },
    {
        title: 'Rev. Prácticas',
        href: studentSupervisionIndex().url,
        icon: NotebookPen,
        roles: [5],
    },
    {
        title: 'Rev. informe',
        href: reportReviewIndex().url,
        icon: FileText,
        roles: [5],
    },
    {
        title: 'Registrar empresa',
        href: '/estudiante/registro-empresa',
        icon: Building2,
        roles: [5],
    },
    {
        title: 'Estudiantes',
        href: groupSupervisionIndex().url,
        icon: Users,
        roles: [4],
    },
    {
        title: 'Evaluación',
        href: supervisionSubmissionIndex().url,
        icon: NotebookPen,
        roles: [4],
    },
    {
        title: 'Usuarios',
        href: '#',
        icon: UserRoundCog,
        roles: [1, 2, 3],
        items: [
            {
                title: 'Nuevo Usuario',
                href: registerIndex().url,
                icon: UserPlus2,
                roles: [1, 2, 3],
            },
            {
                title: 'L. de Subadmins',
                href: subadminsIndex().url,
                roles: [1],
            },
            {
                title: 'L. de Docentes Titulares',
                href: teachersIndex().url,
                roles: [1, 2],
            },
            {
                title: 'L. de Docentes Supervisores',
                href: supervisorsIndex().url,
                roles: [1, 2, 3],
            },
            {
                title: 'L. de Estudiantes',
                href: studentsIndex().url,
                roles: [1, 2, 3],
            },
        ],
    },
    {
        title: 'Empresas',
        href: '/empresas',
        icon: Building2,
        roles: [3],
    },
    {
        title: 'Academico',
        href: '#',
        icon: Folder,
        roles: [1, 2],
        items: [
            {
                title: 'Semestres',
                href: semestersIndex().url,
                roles: [1, 2, 3],
            },
            {
                title: 'Facultades',
                href: facultiesIndex().url,
                roles: [1, 2, 4],
            },
            {
                title: 'Escuelas',
                href: schoolsIndex().url,
                roles: [1, 2],
            },
            {
                title: 'Secciones',
                href: sectionsIndex().url,
                roles: [1, 2],
            },
        ],
    },
];

export const COMPANY_NAV = [
    {
        title: 'Panel',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Perfil empresarial',
        href: '/settings/profile',
        icon: Building2,
    },
];

export const ADMIN_NAV = [
    {
        title: 'Panel',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Usuarios',
        href: '#',
        icon: Briefcase,
    },
];

export const ACADEMIC_SETTINGS_NAV = [
    {
        title: 'Internship',
        href: '/settings/internship',
        icon: Settings,
    },
    {
        title: 'Document',
        href: '/settings/document',
        icon: FileText,
        roles: [1, 2],
    },
];

export const FOOTER_NAV = [
    {
        title: 'Recursos Administrativos',
        href: resourceIndex().url,
        icon: Archive,
        userTypes: [1],
    },
    {
        title: 'Recursos',
        href: resourceIndex().url,
        icon: Archive,
        userTypes: [2],
    },
    {
        title: 'Recursos Empresariales',
        href: resourceIndex().url,
        icon: Archive,
        userTypes: [3],
    },
    {
        title: 'Configuración',
        href: '/settings/internship',
        icon: Settings,
        userTypes: [2],
        roles: [1, 2, 3],
    },
    {
        title: 'Repositorio',
        href: 'https://github.com/martii-n/system-ppp-unjfsc',
        icon: Folder,
        userTypes: [1, 2],
        roles: [1, 2],
    },
    {
        title: 'Documentación',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
        userTypes: [1, 2],
        roles: [1, 2],
    },
];
