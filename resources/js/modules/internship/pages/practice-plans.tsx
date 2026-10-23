import { Head } from '@inertiajs/react';
import {
    ClipboardList,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Eye,
    CalendarDays,
    Building2,
    GraduationCap,
    ClipboardCheck,
    BookOpen,
    UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import Heading from '@/shared/components/heading';
import AppLayout from '@/shared/layouts/app-layout';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import type { BreadcrumbItem } from '@/shared/types';

type PlanStatus = 'Pendiente' | 'En revisión' | 'Observado' | 'Aprobado';

type PracticePlan = {
    id: number;
    student: string;
    code: string;
    career: string;
    company: string;
    title: string;
    submittedAt: string;
    startDate: string;
    endDate: string;
    hours: number;
    status: PlanStatus;
    activities: string[];
    objectives: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Documentos de prácticas',
        href: '/internship/practice-plans',
    },
    {
        title: 'Planes de prácticas',
        href: '/internship/practice-plans',
    },
];

// Datos ficticios para diseñar la interfaz.
const demoPlans: PracticePlan[] = [
    {
        id: 1,
        student: 'Estudiante de demostración 01',
        code: '20210001',
        career: 'Ingeniería de Sistemas',
        company: 'Empresa de demostración',
        title: 'Desarrollo de sistemas de información',
        submittedAt: '15/10/2026',
        startDate: '01/10/2026',
        endDate: '31/03/2027',
        hours: 480,
        status: 'Pendiente',
        activities: [
            'Análisis de requerimientos del sistema.',
            'Diseño de interfaces y modelado de datos.',
            'Desarrollo y pruebas de funcionalidades.',
        ],
        objectives: [
            'Aplicar conocimientos de ingeniería de software.',
            'Participar en el desarrollo de soluciones informáticas.',
            'Documentar las actividades realizadas.',
        ],
    },
    {
        id: 2,
        student: 'Estudiante de demostración 02',
        code: '20210002',
        career: 'Ingeniería de Sistemas',
        company: 'Organización de demostración',
        title: 'Soporte y administración de sistemas',
        submittedAt: '14/10/2026',
        startDate: '01/10/2026',
        endDate: '31/03/2027',
        hours: 480,
        status: 'En revisión',
        activities: [
            'Registro y atención de incidencias.',
            'Mantenimiento preventivo de equipos.',
            'Elaboración de reportes técnicos.',
        ],
        objectives: [
            'Fortalecer conocimientos de soporte informático.',
            'Aplicar procedimientos de mantenimiento.',
            'Mejorar la gestión de incidencias.',
        ],
    },
    {
        id: 3,
        student: 'Estudiante de demostración 03',
        code: '20210003',
        career: 'Ingeniería de Sistemas',
        company: 'Institución de demostración',
        title: 'Análisis y gestión de bases de datos',
        submittedAt: '12/10/2026',
        startDate: '01/10/2026',
        endDate: '31/03/2027',
        hours: 480,
        status: 'Observado',
        activities: [
            'Revisión de estructuras de bases de datos.',
            'Elaboración de consultas SQL.',
            'Documentación del modelo de datos.',
        ],
        objectives: [
            'Aplicar técnicas de modelado de datos.',
            'Mejorar el manejo de información.',
            'Documentar los procedimientos desarrollados.',
        ],
    },
    {
        id: 4,
        student: 'Estudiante de demostración 04',
        code: '20210004',
        career: 'Ingeniería de Sistemas',
        company: 'Empresa de demostración',
        title: 'Desarrollo de aplicaciones web',
        submittedAt: '10/10/2026',
        startDate: '01/10/2026',
        endDate: '31/03/2027',
        hours: 480,
        status: 'Aprobado',
        activities: [
            'Desarrollo de componentes web.',
            'Integración de servicios y APIs.',
            'Pruebas funcionales de la aplicación.',
        ],
        objectives: [
            'Aplicar buenas prácticas de desarrollo web.',
            'Integrar componentes de una aplicación.',
            'Validar el funcionamiento del software.',
        ],
    },
    {
        id: 5,
        student: 'Estudiante de demostración 05',
        code: '20210005',
        career: 'Ingeniería de Sistemas',
        company: 'Organización de demostración',
        title: 'Automatización de procesos',
        submittedAt: '08/10/2026',
        startDate: '01/10/2026',
        endDate: '31/03/2027',
        hours: 480,
        status: 'En revisión',
        activities: [
            'Identificación de procesos repetitivos.',
            'Diseño de propuestas de automatización.',
            'Pruebas y documentación de resultados.',
        ],
        objectives: [
            'Identificar oportunidades de mejora.',
            'Proponer soluciones tecnológicas.',
            'Evaluar resultados de la automatización.',
        ],
    },
];

const statusStyles: Record<PlanStatus, string> = {
    Pendiente:
        'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    'En revisión':
        'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    Observado:
        'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
    Aprobado:
        'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400',
};

function StatusBadge({ status }: { status: PlanStatus }) {
    const Icon =
        status === 'Pendiente'
            ? Clock
            : status === 'En revisión'
              ? Eye
              : status === 'Observado'
                ? AlertCircle
                : CheckCircle2;

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
        >
            <Icon className="size-3.5" />
            {status}
        </span>
    );
}

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: number;
    description: string;
    icon: typeof ClipboardList;
}) {
    return (
        <div className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Icon className="size-5 text-muted-foreground" />
                </div>
            </div>
        </div>
    );
}

export default function PracticePlansIndex() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(1);

    const filteredPlans = useMemo(() => {
        const query = search.trim().toLowerCase();

        return demoPlans.filter((plan) => {
            const matchesSearch =
                !query ||
                [
                    plan.student,
                    plan.code,
                    plan.company,
                    plan.title,
                    plan.career,
                ].some((value) => value.toLowerCase().includes(query));

            return (
                matchesSearch &&
                (statusFilter === 'Todos' || plan.status === statusFilter)
            );
        });
    }, [search, statusFilter]);

    const selectedPlan =
        filteredPlans.find((plan) => plan.id === selectedPlanId) ??
        filteredPlans[0] ??
        null;

    const countByStatus = (status: PlanStatus) =>
        demoPlans.filter((plan) => plan.status === status).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Planes de prácticas" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        variant="small"
                        title="Planes de prácticas"
                        description="Consulta y supervisa los planes de prácticas preprofesionales de los estudiantes asignados."
                    />

                    <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5">
                        <ClipboardCheck className="size-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">
                                Supervisión académica
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Seguimiento de planes
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3.5">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Esta vista utiliza datos de demostración. Se
                        reemplazarán por los registros reales al conectar el
                        backend.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total de planes"
                        value={demoPlans.length}
                        description="Registros de demostración"
                        icon={ClipboardList}
                    />
                    <SummaryCard
                        title="Pendientes"
                        value={countByStatus('Pendiente')}
                        description="A la espera de revisión"
                        icon={Clock}
                    />
                    <SummaryCard
                        title="En revisión"
                        value={countByStatus('En revisión')}
                        description="En proceso de evaluación"
                        icon={Eye}
                    />
                    <SummaryCard
                        title="Observados"
                        value={countByStatus('Observado')}
                        description="Requieren atención"
                        icon={AlertCircle}
                    />
                </div>

                <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
                    <div className="min-w-0">
                        <SectionCard>
                            <SectionCard.Header>
                                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold">
                                            Relación de planes
                                        </h2>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Busca un registro para consultar su
                                            información.
                                        </p>
                                    </div>
                                    <span className="w-fit rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium">
                                        {filteredPlans.length} resultados
                                    </span>
                                </div>
                            </SectionCard.Header>

                            <SectionCard.Body className="space-y-4">
                                <div className="flex flex-col gap-3 md:flex-row">
                                    <div className="relative min-w-0 flex-1">
                                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            placeholder="Buscar estudiante, código o empresa..."
                                            aria-label="Buscar planes"
                                            className="h-10 w-full rounded-lg border bg-background pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    </div>

                                    <select
                                        value={statusFilter}
                                        onChange={(event) =>
                                            setStatusFilter(event.target.value)
                                        }
                                        aria-label="Filtrar por estado"
                                        className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary sm:w-44"
                                    >
                                        <option value="Todos">
                                            Todos los estados
                                        </option>
                                        <option value="Pendiente">
                                            Pendiente
                                        </option>
                                        <option value="En revisión">
                                            En revisión
                                        </option>
                                        <option value="Observado">
                                            Observado
                                        </option>
                                        <option value="Aprobado">
                                            Aprobado
                                        </option>
                                    </select>
                                </div>

                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full min-w-[680px] text-left text-sm">
                                        <thead className="bg-muted/50 text-xs text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">
                                                    Estudiante
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Plan presentado
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Fecha
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Estado
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Detalle
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredPlans.map((plan) => (
                                                <tr
                                                    key={plan.id}
                                                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                                                        selectedPlan?.id === plan.id
                                                            ? 'bg-primary/5'
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedPlanId(plan.id)
                                                    }
                                                >
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                                <UserRound className="size-4 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {plan.student}
                                                                </p>
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    Código: {plan.code}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <p className="max-w-48 font-medium">
                                                            {plan.title}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {plan.company}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                                                        {plan.submittedAt}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <StatusBadge status={plan.status} />
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setSelectedPlanId(plan.id);
                                                            }}
                                                        >
                                                            <Eye className="mr-1.5 size-3.5" />
                                                            Ver
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {filteredPlans.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-4 py-12 text-center"
                                                    >
                                                        <Search className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                                                        <p className="text-sm font-medium">
                                                            No se encontraron planes
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Cambia la búsqueda o
                                                            selecciona otro estado.
                                                        </p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionCard.Body>
                        </SectionCard>
                    </div>

                    <div className="min-w-0 space-y-4">
                        {selectedPlan ? (
                            <>
                                <SectionCard>
                                    <SectionCard.Header>
                                        <div className="flex w-full items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                                                    <FileText className="size-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-base font-semibold">
                                                        Detalle del plan
                                                    </h2>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Registro seleccionado
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={selectedPlan.status} />
                                        </div>
                                    </SectionCard.Header>

                                    <SectionCard.Body className="space-y-5">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Título del plan
                                            </p>
                                            <h3 className="mt-1 text-sm font-semibold leading-relaxed">
                                                {selectedPlan.title}
                                            </h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Estudiante
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium">
                                                        {selectedPlan.student}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {selectedPlan.code}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <GraduationCap className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Escuela profesional
                                                    </p>
                                                    <p className="mt-1 text-sm">
                                                        {selectedPlan.career}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Centro de prácticas
                                                    </p>
                                                    <p className="mt-1 text-sm">
                                                        {selectedPlan.company}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Periodo de prácticas
                                                    </p>
                                                    <p className="mt-1 text-sm">
                                                        {selectedPlan.startDate} — {selectedPlan.endDate}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Horas programadas
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium">
                                                        {selectedPlan.hours} horas
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border bg-muted/20 p-3">
                                            <p className="text-xs text-muted-foreground">
                                                Fecha de presentación
                                            </p>
                                            <p className="mt-1 text-sm font-medium">
                                                {selectedPlan.submittedAt}
                                            </p>
                                        </div>
                                    </SectionCard.Body>
                                </SectionCard>

                                <SectionCard>
                                    <SectionCard.Header>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="size-4" />
                                            <h2 className="text-sm font-semibold">
                                                Objetivos del plan
                                            </h2>
                                        </div>
                                    </SectionCard.Header>
                                    <SectionCard.Body>
                                        <ul className="space-y-3">
                                            {selectedPlan.objectives.map(
                                                (objective, index) => (
                                                    <li
                                                        key={objective}
                                                        className="flex items-start gap-2.5 text-sm leading-relaxed"
                                                    >
                                                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                            {index + 1}
                                                        </span>
                                                        <span>{objective}</span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </SectionCard.Body>
                                </SectionCard>

                                <SectionCard>
                                    <SectionCard.Header>
                                        <div className="flex items-center gap-2">
                                            <ClipboardList className="size-4" />
                                            <h2 className="text-sm font-semibold">
                                                Actividades programadas
                                            </h2>
                                        </div>
                                    </SectionCard.Header>
                                    <SectionCard.Body>
                                        <ol className="space-y-3">
                                            {selectedPlan.activities.map(
                                                (activity, index) => (
                                                    <li
                                                        key={activity}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-background text-xs font-medium">
                                                            {index + 1}
                                                        </div>
                                                        <p className="pt-1 text-sm leading-relaxed">
                                                            {activity}
                                                        </p>
                                                    </li>
                                                ),
                                            )}
                                        </ol>
                                    </SectionCard.Body>
                                </SectionCard>
                            </>
                        ) : (
                            <SectionCard>
                                <SectionCard.Body className="flex flex-col items-center py-12 text-center">
                                    <FileText className="mb-3 size-10 text-muted-foreground/50" />
                                    <h3 className="text-sm font-semibold">
                                        Selecciona un plan
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Elige un registro de la tabla para
                                        consultar sus datos.
                                    </p>
                                </SectionCard.Body>
                            </SectionCard>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <GraduationCap className="size-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">
                            Sobre la supervisión de prácticas
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Este apartado permite consultar los objetivos y
                            actividades propuestas por los estudiantes. Las
                            acciones de revisión se implementarán según los
                            permisos del docente supervisor.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}