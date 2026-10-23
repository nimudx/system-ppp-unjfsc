import { Head } from '@inertiajs/react';
import {
    FileText,
    FileCheck,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Eye,
    CalendarDays,
    Building2,
    GraduationCap,
    ClipboardCheck,
    MessageSquare,
    UserRound,
    History,
    Download,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import Heading from '@/shared/components/heading';
import AppLayout from '@/shared/layouts/app-layout';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import type { BreadcrumbItem } from '@/shared/types';

type ReportStatus = 'Pendiente' | 'En revisión' | 'Observado' | 'Aprobado';

type PracticeReport = {
    id: number;
    student: string;
    code: string;
    career: string;
    company: string;
    title: string;
    submittedAt: string;
    period: string;
    reportType: string;
    status: ReportStatus;
    fileName: string;
    summary: string;
    activities: string[];
    observations: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Documentos de prácticas',
        href: '/internship/practice-reports',
    },
    {
        title: 'Informes de prácticas',
        href: '/internship/practice-reports',
    },
];

// Datos ficticios para diseñar la interfaz.
// Se reemplazarán por los registros reales al conectar el backend.
const demoReports: PracticeReport[] = [
    {
        id: 1,
        student: 'Estudiante de demostración 01',
        code: '20210001',
        career: 'Ingeniería de Sistemas',
        company: 'Empresa de demostración',
        title: 'Informe de actividades de desarrollo web',
        submittedAt: '18/10/2026',
        period: '01/10/2026 - 15/10/2026',
        reportType: 'Informe parcial',
        status: 'Pendiente',
        fileName: 'informe_parcial.pdf',
        summary:
            'Informe de demostración sobre las actividades desarrolladas durante el periodo de prácticas.',
        activities: [
            'Análisis de requerimientos.',
            'Desarrollo de interfaces web.',
            'Pruebas funcionales de módulos.',
        ],
        observations: 'Todavía no se registraron observaciones.',
    },
    {
        id: 2,
        student: 'Estudiante de demostración 02',
        code: '20210002',
        career: 'Ingeniería de Sistemas',
        company: 'Organización de demostración',
        title: 'Informe de soporte informático',
        submittedAt: '17/10/2026',
        period: '01/10/2026 - 15/10/2026',
        reportType: 'Informe parcial',
        status: 'En revisión',
        fileName: 'informe_soporte.pdf',
        summary:
            'Descripción de las actividades de soporte técnico y mantenimiento realizadas.',
        activities: [
            'Atención de incidencias.',
            'Mantenimiento de equipos.',
            'Registro de reportes técnicos.',
        ],
        observations: 'El informe se encuentra pendiente de revisión.',
    },
    {
        id: 3,
        student: 'Estudiante de demostración 03',
        code: '20210003',
        career: 'Ingeniería de Sistemas',
        company: 'Institución de demostración',
        title: 'Informe de gestión de bases de datos',
        submittedAt: '16/10/2026',
        period: '01/10/2026 - 15/10/2026',
        reportType: 'Informe parcial',
        status: 'Observado',
        fileName: 'informe_bases_datos.pdf',
        summary:
            'Registro de actividades de análisis, consultas y documentación de bases de datos.',
        activities: [
            'Revisión del modelo de datos.',
            'Elaboración de consultas SQL.',
            'Documentación de procedimientos.',
        ],
        observations:
            'Se requiere ampliar la descripción de las actividades y los resultados obtenidos.',
    },
    {
        id: 4,
        student: 'Estudiante de demostración 04',
        code: '20210004',
        career: 'Ingeniería de Sistemas',
        company: 'Empresa de demostración',
        title: 'Informe de desarrollo de aplicaciones',
        submittedAt: '12/10/2026',
        period: '01/10/2026 - 10/10/2026',
        reportType: 'Informe parcial',
        status: 'Aprobado',
        fileName: 'informe_aplicaciones.pdf',
        summary:
            'Resumen de las funcionalidades desarrolladas y las pruebas realizadas.',
        activities: [
            'Desarrollo de componentes.',
            'Integración de servicios.',
            'Validación de funcionalidades.',
        ],
        observations: 'Sin observaciones en esta demostración.',
    },
    {
        id: 5,
        student: 'Estudiante de demostración 05',
        code: '20210005',
        career: 'Ingeniería de Sistemas',
        company: 'Organización de demostración',
        title: 'Informe de automatización de procesos',
        submittedAt: '11/10/2026',
        period: '01/10/2026 - 10/10/2026',
        reportType: 'Informe parcial',
        status: 'En revisión',
        fileName: 'informe_automatizacion.pdf',
        summary:
            'Descripción de los procesos identificados y de las propuestas de automatización.',
        activities: [
            'Identificación de tareas repetitivas.',
            'Diseño de propuestas de mejora.',
            'Registro de resultados de pruebas.',
        ],
        observations: 'El informe se encuentra pendiente de revisión.',
    },
];

const statusStyles: Record<ReportStatus, string> = {
    Pendiente:
        'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    'En revisión':
        'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    Observado:
        'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
    Aprobado:
        'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400',
};

function StatusBadge({ status }: { status: ReportStatus }) {
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
    icon: typeof FileText;
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

export default function PracticeReportsIndex() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [selectedReportId, setSelectedReportId] = useState<number | null>(1);

    const filteredReports = useMemo(() => {
        const query = search.trim().toLowerCase();

        return demoReports.filter((report) => {
            const matchesSearch =
                !query ||
                [
                    report.student,
                    report.code,
                    report.company,
                    report.title,
                    report.career,
                    report.fileName,
                ].some((value) => value.toLowerCase().includes(query));

            return (
                matchesSearch &&
                (statusFilter === 'Todos' || report.status === statusFilter)
            );
        });
    }, [search, statusFilter]);

    const selectedReport =
        filteredReports.find((report) => report.id === selectedReportId) ??
        filteredReports[0] ??
        null;

    const countByStatus = (status: ReportStatus) =>
        demoReports.filter((report) => report.status === status).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Informes de prácticas" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Encabezado */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        variant="small"
                        title="Informes de prácticas"
                        description="Consulta los informes presentados por los estudiantes y realiza el seguimiento de sus entregas."
                    />

                    <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5">
                        <FileCheck className="size-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">
                                Seguimiento de informes
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supervisión académica
                            </p>
                        </div>
                    </div>
                </div>

                {/* Aviso */}
                <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3.5">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Esta vista utiliza datos y documentos ficticios para
                        mostrar el diseño. La consulta de archivos reales se
                        habilitará al conectar el backend.
                    </p>
                </div>

                {/* Indicadores */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total de informes"
                        value={demoReports.length}
                        description="Registros de demostración"
                        icon={FileText}
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
                        description="Requieren correcciones"
                        icon={AlertCircle}
                    />
                </div>

                {/* Listado y detalle */}
                <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
                    <div className="min-w-0">
                        <SectionCard>
                            <SectionCard.Header>
                                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold">
                                            Informes recibidos
                                        </h2>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Busca informes y consulta su
                                            información.
                                        </p>
                                    </div>
                                    <span className="w-fit rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium">
                                        {filteredReports.length} resultados
                                    </span>
                                </div>
                            </SectionCard.Header>

                            <SectionCard.Body className="space-y-4">
                                {/* Buscador y filtro */}
                                <div className="flex flex-col gap-3 md:flex-row">
                                    <div className="relative min-w-0 flex-1">
                                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            placeholder="Buscar estudiante, informe o archivo..."
                                            aria-label="Buscar informes"
                                            className="h-10 w-full rounded-lg border bg-background pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    </div>

                                    <select
                                        value={statusFilter}
                                        onChange={(event) =>
                                            setStatusFilter(event.target.value)
                                        }
                                        aria-label="Filtrar informes por estado"
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

                                {/* Tabla */}
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full min-w-[680px] text-left text-sm">
                                        <thead className="bg-muted/50 text-xs text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">
                                                    Estudiante
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Informe
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Entrega
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
                                            {filteredReports.map((report) => (
                                                <tr
                                                    key={report.id}
                                                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                                                        selectedReport?.id === report.id
                                                            ? 'bg-primary/5'
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedReportId(report.id)
                                                    }
                                                >
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                                <UserRound className="size-4 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {report.student}
                                                                </p>
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    Código: {report.code}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3.5">
                                                        <p className="max-w-48 font-medium">
                                                            {report.title}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {report.reportType}
                                                        </p>
                                                    </td>

                                                    <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                                                        {report.submittedAt}
                                                    </td>

                                                    <td className="px-4 py-3.5">
                                                        <StatusBadge status={report.status} />
                                                    </td>

                                                    <td className="px-4 py-3.5 text-right">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setSelectedReportId(report.id);
                                                            }}
                                                        >
                                                            <Eye className="mr-1.5 size-3.5" />
                                                            Ver
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {filteredReports.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-4 py-12 text-center"
                                                    >
                                                        <Search className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                                                        <p className="text-sm font-medium">
                                                            No se encontraron informes
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

                    {/* Panel de detalle */}
                    <div className="min-w-0 space-y-4">
                        {selectedReport ? (
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
                                                        Detalle del informe
                                                    </h2>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Registro seleccionado
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={selectedReport.status} />
                                        </div>
                                    </SectionCard.Header>

                                    <SectionCard.Body className="space-y-5">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Título del informe
                                            </p>
                                            <h3 className="mt-1 text-sm font-semibold leading-relaxed">
                                                {selectedReport.title}
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
                                                        {selectedReport.student}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {selectedReport.code}
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
                                                        {selectedReport.career}
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
                                                        {selectedReport.company}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Periodo informado
                                                    </p>
                                                    <p className="mt-1 text-sm">
                                                        {selectedReport.period}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <FileCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Tipo de informe
                                                    </p>
                                                    <p className="mt-1 text-sm">
                                                        {selectedReport.reportType}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border bg-muted/20 p-3">
                                            <p className="text-xs text-muted-foreground">
                                                Fecha de entrega
                                            </p>
                                            <p className="mt-1 text-sm font-medium">
                                                {selectedReport.submittedAt}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="mb-2 text-xs font-medium">
                                                Resumen del informe
                                            </p>
                                            <p className="rounded-lg bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
                                                {selectedReport.summary}
                                            </p>
                                        </div>
                                    </SectionCard.Body>
                                </SectionCard>

                                <SectionCard>
                                    <SectionCard.Header>
                                        <div className="flex items-center gap-2">
                                            <ClipboardCheck className="size-4" />
                                            <h2 className="text-sm font-semibold">
                                                Actividades reportadas
                                            </h2>
                                        </div>
                                    </SectionCard.Header>

                                    <SectionCard.Body>
                                        <ol className="space-y-3">
                                            {selectedReport.activities.map(
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

                                <SectionCard>
                                    <SectionCard.Header>
                                        <div className="flex items-center gap-2">
                                            <FileCheck className="size-4" />
                                            <h2 className="text-sm font-semibold">
                                                Documento entregado
                                            </h2>
                                        </div>
                                    </SectionCard.Header>

                                    <SectionCard.Body className="space-y-3">
                                        <div className="flex items-center gap-3 rounded-lg border p-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <FileText className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="break-all text-sm font-medium">
                                                    {selectedReport.fileName}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Archivo de demostración
                                                </p>
                                            </div>
                                            <Download className="size-4 shrink-0 text-muted-foreground" />
                                        </div>

                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            La descarga y visualización del
                                            documento se habilitarán cuando se
                                            conecten los archivos reales.
                                        </p>
                                    </SectionCard.Body>
                                </SectionCard>

                                <SectionCard>
                                    <SectionCard.Header>
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="size-4" />
                                            <h2 className="text-sm font-semibold">
                                                Observaciones
                                            </h2>
                                        </div>
                                    </SectionCard.Header>

                                    <SectionCard.Body>
                                        <p className="rounded-lg border bg-muted/20 p-3 text-sm leading-relaxed text-muted-foreground">
                                            {selectedReport.observations}
                                        </p>
                                    </SectionCard.Body>
                                </SectionCard>
                            </>
                        ) : (
                            <SectionCard>
                                <SectionCard.Body className="flex flex-col items-center py-12 text-center">
                                    <FileText className="mb-3 size-10 text-muted-foreground/50" />
                                    <h3 className="text-sm font-semibold">
                                        Selecciona un informe
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Elige un registro para consultar sus
                                        detalles y documentos.
                                    </p>
                                </SectionCard.Body>
                            </SectionCard>
                        )}
                    </div>
                </div>

                {/* Ayuda e historial */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <History className="size-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold">
                                Historial de informes
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                En la versión conectada se podrán consultar
                                las entregas anteriores, sus estados y las
                                observaciones registradas.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <GraduationCap className="size-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold">
                                Seguimiento académico
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                La revisión de documentos y el registro de
                                observaciones se implementarán según los
                                permisos del docente supervisor.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}