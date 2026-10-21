import { Head } from '@inertiajs/react';
import {
    Users,
    X,
    ChevronRight,
    Building2,
    User,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    Loader2,
} from 'lucide-react';
import { useState } from 'react';
import type { Faculty } from '@/modules/academic';
import type { InternshipGroup } from '@/modules/supervision/hooks/use-internship-group';
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
import AppLayout from '@/shared/layouts/app-layout';
import type { BreadcrumbItem } from '@/shared/types';
import { useGroupSupervision } from './hooks/use-group-supervision';

interface Props {
    groups: InternshipGroup[];
    faculties?: Faculty[];
}

export default function GroupSupervisionIndex({ groups = [] }: Props) {
    const title = 'Seguimiento de Prácticas';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Prácticas Pre-Profesionales', href: '/internship' },
        { title: 'Supervisión', href: '#' },
    ];

    const {
        selectedGroupId,
        selectedGroup,
        students,
        isLoadingStudents,
        selectedStudentId,
        selectedStudent,
        setSelectedStudentId,
        handleSelectGroup,
    } = useGroupSupervision({ initialGroups: groups });

    // Estado local para buscar alumnos dentro del grupo cargado
    const [studentSearch, setStudentSearch] = useState('');

    // Filtrar estudiantes localmente según la búsqueda
    const filteredStudents = students.filter((student) => {
        if (!studentSearch.trim()) return true;
        const term = studentSearch.toLowerCase();
        return (
            student.user?.person?.names?.toLowerCase().includes(term) ||
            student.user?.person?.surnames?.toLowerCase().includes(term) ||
            student.user?.email?.toLowerCase().includes(term)
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Cabecera */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <Heading
                        variant="small"
                        title="Listado de Estudiantes a Supervisar"
                        description="Selecciona un grupo para listar sus estudiantes y consultar su información de prácticas."
                    />
                </div>

                {/* SELECTOR DE GRUPOS (Premium Buttons) */}
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                        Mis Grupos Asignados:
                    </span>
                    {groups.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {groups.map((group) => {
                                const isSelected = selectedGroupId === group.id;
                                return (
                                    <button
                                        key={group.id}
                                        onClick={() =>
                                            handleSelectGroup(group.id)
                                        }
                                        className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all ${
                                            isSelected
                                                ? 'border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20'
                                                : 'border-input bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                        }`}
                                    >
                                        <Users className="size-4 shrink-0" />
                                        <span>{group.name}</span>
                                        <Badge
                                            variant="secondary"
                                            className={`ml-1 px-1.5 py-0 text-[10px] ${
                                                isSelected
                                                    ? 'bg-primary-foreground/20 font-bold text-primary-foreground'
                                                    : 'bg-muted font-medium text-muted-foreground'
                                            }`}
                                        >
                                            {group.section?.name || 'S/S'}
                                        </Badge>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                            No tienes grupos de supervisión asignados para esta
                            sección.
                        </div>
                    )}
                </div>

                {/* CONTENIDO PRINCIPAL: Dos Columnas Desplazables */}
                {selectedGroupId ? (
                    <div className="relative flex flex-1 gap-6 overflow-hidden pr-1 pb-1">
                        {/* COLUMNA IZQUIERDA: Tabla de estudiantes del grupo */}
                        <aside
                            className={`flex shrink-0 flex-col transition-all duration-300 ease-in-out ${
                                selectedStudentId
                                    ? 'w-[360px] lg:w-[420px]'
                                    : 'w-full'
                            }`}
                        >
                            {/* Buscador de Alumnos */}
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Buscar estudiante por nombre o correo..."
                                        value={studentSearch}
                                        onChange={(e) =>
                                            setStudentSearch(e.target.value)
                                        }
                                        className="h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                    />
                                    {studentSearch && (
                                        <button
                                            onClick={() => setStudentSearch('')}
                                            className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Tabla / Lista */}
                            <div className="relative mt-4 overflow-hidden rounded-md border bg-card">
                                {isLoadingStudents && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60 backdrop-blur-[1px]">
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                            <Loader2 className="size-4 animate-spin text-primary" />
                                            Cargando estudiantes...
                                        </div>
                                    </div>
                                )}

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs font-bold tracking-wider uppercase">
                                                Estudiante
                                            </TableHead>
                                            {!selectedStudentId && (
                                                <TableHead className="text-xs font-bold tracking-wider uppercase">
                                                    Empresa / Puesto
                                                </TableHead>
                                            )}
                                            <TableHead className="w-[25%] text-center text-xs font-bold tracking-wider uppercase">
                                                Estado
                                            </TableHead>
                                            <TableHead className="w-[5%]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => {
                                                const isSelected =
                                                    selectedStudentId ===
                                                    student.id;
                                                return (
                                                    <TableRow
                                                        key={student.id}
                                                        onClick={() =>
                                                            setSelectedStudentId(
                                                                student.id,
                                                            )
                                                        }
                                                        className={`group cursor-pointer transition-colors ${
                                                            isSelected
                                                                ? 'border-l-4 border-l-primary bg-primary/5'
                                                                : ''
                                                        }`}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                                                    <User className="size-4 text-muted-foreground" />
                                                                </div>
                                                                <div className="flex flex-col overflow-hidden">
                                                                    <span className="truncate text-xs font-bold uppercase">
                                                                        {
                                                                            student
                                                                                .user
                                                                                ?.person
                                                                                ?.surnames
                                                                        }{' '}
                                                                        {
                                                                            student
                                                                                .user
                                                                                ?.person
                                                                                ?.names
                                                                        }
                                                                    </span>
                                                                    <span className="truncate text-[10px] text-muted-foreground">
                                                                        {
                                                                            student
                                                                                .user
                                                                                ?.email
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        {!selectedStudentId && (
                                                            <TableCell>
                                                                {student.placement ? (
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-semibold text-foreground">
                                                                            {
                                                                                student
                                                                                    .placement
                                                                                    .company_name
                                                                            }
                                                                        </span>
                                                                        <span className="text-[10px] text-muted-foreground">
                                                                            {
                                                                                student
                                                                                    .placement
                                                                                    .position
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground italic">
                                                                        ---
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                        )}

                                                        <TableCell className="text-center">
                                                            {student.placement ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-none bg-green-500/10 text-[9px] font-black tracking-wider text-green-600 uppercase"
                                                                >
                                                                    CON PRÁCTICA
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-none bg-slate-100 text-[9px] font-black tracking-wider text-slate-500 uppercase"
                                                                >
                                                                    NO INICIADO
                                                                </Badge>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <ChevronRight
                                                                className={`size-4 text-muted-foreground transition-transform ${
                                                                    isSelected
                                                                        ? 'rotate-180 text-primary'
                                                                        : 'group-hover:translate-x-0.5'
                                                                }`}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={
                                                        selectedStudentId
                                                            ? 3
                                                            : 4
                                                    }
                                                    className="h-24 text-center text-xs text-muted-foreground italic"
                                                >
                                                    {students.length === 0
                                                        ? 'Este grupo no contiene estudiantes asignados.'
                                                        : 'No se encontraron estudiantes para la búsqueda.'}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </aside>

                        {/* COLUMNA DERECHA: Detalle Informativo */}
                        <main
                            className={`flex min-w-0 flex-1 flex-col transition-all duration-500 ease-in-out ${
                                selectedStudentId
                                    ? 'translate-x-0 opacity-100'
                                    : 'pointer-events-none translate-x-12.5 opacity-0'
                            }`}
                        >
                            {selectedStudent ? (
                                <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-card">
                                    {/* Cabecera del Panel de Detalle */}
                                    <div className="flex items-center justify-between border-b bg-muted/10 px-6 py-4">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                <User className="size-5 text-primary" />
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <h3 className="truncate text-xs font-black tracking-tight text-foreground uppercase">
                                                    {
                                                        selectedStudent.user
                                                            ?.person?.surnames
                                                    }{' '}
                                                    {
                                                        selectedStudent.user
                                                            ?.person?.names
                                                    }
                                                </h3>
                                                <p className="truncate text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                                                    {selectedGroup?.section
                                                        ?.school?.name ||
                                                        'Escuela'}{' '}
                                                    •{' '}
                                                    {selectedGroup?.section
                                                        ?.name || 'Sección'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 rounded-full hover:bg-muted"
                                            onClick={() =>
                                                setSelectedStudentId(null)
                                            }
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>

                                    {/* Contenido del Panel */}
                                    <div className="flex-1 space-y-6 overflow-y-auto p-6">
                                        {!selectedStudent.placement ? (
                                            /* CASO SIN PRÁCTICA */
                                            <div className="flex h-full flex-col items-center justify-center space-y-4 py-12 text-center">
                                                <div className="flex size-20 items-center justify-center rounded-full border border-dashed bg-muted/15">
                                                    <Building2 className="size-9 text-muted-foreground" />
                                                </div>
                                                <div className="max-w-xs space-y-2">
                                                    <h3 className="text-sm font-bold tracking-tight text-foreground uppercase">
                                                        Aún no tiene práctica
                                                    </h3>
                                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                                        Este estudiante aún no
                                                        ha registrado un
                                                        convenio ni formalizado
                                                        su puesto de prácticas.
                                                        No es posible realizar
                                                        la supervisión todavía.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            /* CASO CON PRÁCTICA (FICHA DETALLADA COMPACTA) */
                                            <div className="space-y-6">
                                                {/* Sección 1: Información de la Empresa */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 border-b pb-1">
                                                        <Building2 className="size-4 text-primary" />
                                                        <span className="text-[11px] font-black tracking-wider text-foreground uppercase">
                                                            Institución /
                                                            Empresa
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/10 p-4 text-xs md:grid-cols-2">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                                Razón Social:
                                                            </p>
                                                            <p className="font-bold text-foreground">
                                                                {
                                                                    selectedStudent
                                                                        .placement
                                                                        .company_name
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                                Área de Trabajo:
                                                            </p>
                                                            <p className="font-medium text-foreground">
                                                                {
                                                                    selectedStudent
                                                                        .placement
                                                                        .area_name
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sección 2: Jefe Directo */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 border-b pb-1">
                                                        <User className="size-4 text-primary" />
                                                        <span className="text-[11px] font-black tracking-wider text-foreground uppercase">
                                                            Supervisor del
                                                            Centro de Prácticas
                                                            (Jefe)
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/10 p-4 text-xs md:grid-cols-2">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                                Nombre:
                                                            </p>
                                                            <p className="font-bold text-foreground">
                                                                {
                                                                    selectedStudent
                                                                        .placement
                                                                        .boss_name
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                                Cargo:
                                                            </p>
                                                            <p className="font-medium text-foreground">
                                                                {
                                                                    selectedStudent
                                                                        .placement
                                                                        .boss_position
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="flex items-start gap-1 space-y-1">
                                                            <Mail className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                                    Correo
                                                                    Electrónico:
                                                                </p>
                                                                <p className="font-medium text-foreground">
                                                                    {
                                                                        selectedStudent
                                                                            .placement
                                                                            .boss_email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-1 space-y-1">
                                                            <Phone className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                                    Teléfono /
                                                                    Celular:
                                                                </p>
                                                                <p className="font-medium text-foreground">
                                                                    {
                                                                        selectedStudent
                                                                            .placement
                                                                            .boss_phone
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sección 3: Puesto de Prácticas */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 border-b pb-1">
                                                        <Briefcase className="size-4 text-primary" />
                                                        <span className="text-[11px] font-black tracking-wider text-foreground uppercase">
                                                            Detalles de las
                                                            Prácticas
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/10 p-4 text-xs md:grid-cols-2">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                                Puesto Asignado:
                                                            </p>
                                                            <p className="font-bold text-foreground">
                                                                {
                                                                    selectedStudent
                                                                        .placement
                                                                        .position
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                                Tipo de
                                                                Práctica:
                                                            </p>
                                                            <p className="font-medium text-foreground uppercase">
                                                                {
                                                                    selectedStudent
                                                                        .placement
                                                                        .internship_type
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="flex items-start gap-1 space-y-1">
                                                            <Calendar className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                                    Fecha de
                                                                    Inicio:
                                                                </p>
                                                                <p className="font-medium text-foreground">
                                                                    {
                                                                        selectedStudent
                                                                            .placement
                                                                            .start_date
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-1 space-y-1">
                                                            <Calendar className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                                    Fecha de
                                                                    Finalización:
                                                                </p>
                                                                <p className="font-medium text-foreground">
                                                                    {
                                                                        selectedStudent
                                                                            .placement
                                                                            .end_date
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50/50 text-muted-foreground">
                                    <div className="mb-4 flex size-20 items-center justify-center rounded-full border border-dashed bg-white">
                                        <User className="size-8 text-slate-300" />
                                    </div>
                                    <p className="text-xs font-bold tracking-widest uppercase opacity-70">
                                        Seleccione un estudiante
                                    </p>
                                </div>
                            )}
                        </main>
                    </div>
                ) : (
                    /* PANTALLA DE BIENVENIDA (SIN SELECCIÓN DE GRUPO) */
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 p-12 text-muted-foreground">
                        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/40">
                            <Users className="size-7 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-sm font-bold tracking-wide text-foreground uppercase">
                            Panel de Supervisión de Prácticas
                        </h3>
                        <p className="mt-1 max-w-[320px] text-center text-xs leading-relaxed text-muted-foreground">
                            Selecciona uno de los botones de grupo de la parte
                            superior para listar los estudiantes bajo tu
                            supervisión.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
