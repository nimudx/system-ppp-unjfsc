import {
    Archive,
    BadgeCheck,
    BookMarked,
    Boxes,
    BriefcaseBusiness,
    Building2,
    CalendarRange,
    ClipboardList,
    FileSignature,
    FileText,
    Folder,
    FolderCheck,
    GraduationCap,
    LayoutDashboard,
    NotebookPen,
    Settings,
    UserPlus2,
    UserRound,
    UserRoundCog,
    Users,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { cv as studentCvRoute } from '@/routes/academic';
import { index as companiesIndex } from '@/routes/academic/companies';
import { submission as dossierSubmissionIndex } from '@/routes/academic/dossiers';
import { teacher as teacherDossierIndex } from '@/routes/academic/dossiers';
import { supervisor as supervisorDossierIndex } from '@/routes/academic/dossiers';
import { student as studentDossierIndex } from '@/routes/academic/dossiers';
import { index as facultiesIndex } from '@/routes/academic/faculties';
import { internship as internshipIndex } from '@/routes/academic/groups';
import { student as studentIndex } from '@/routes/academic/groups';
import { supervision as groupSupervisionIndex } from '@/routes/academic/groups';
import {
    annexes as internshipAnnexes,
    formalization as internshipFormalization,
    reportReview as reportReviewIndex,
    submission as internshipSubmissionIndex,
    validation as internshipValidationIndex,
} from '@/routes/academic/internship';
import { index as adminJobBoardIndex } from '@/routes/academic/jobboard/admin';
import { index as teacherJobBoardIndex } from '@/routes/academic/jobboard/teacher';
import { index as schoolsIndex } from '@/routes/academic/schools';
import { index as sectionsIndex } from '@/routes/academic/sections';
import { index as semestersIndex } from '@/routes/academic/semesters';
import { index as studentsIndex } from '@/routes/academic/students';
import { index as subadminsIndex } from '@/routes/academic/subadmins';
import {
    practicePlans as supervisionPracticePlans,
    practiceReports as supervisionPracticeReports,
    validation as supervisionValidationIndex,
} from '@/routes/academic/supervision';
import { submission as supervisionSubmissionIndex } from '@/routes/academic/supervision';
import { index as supervisorsIndex } from '@/routes/academic/supervisors';
import { index as teachersIndex } from '@/routes/academic/teachers';
import { requests as companyRequests } from '@/routes/company';
import { index as companyJobBoardIndex } from '@/routes/company/jobboard';
import { edit as profileEdit } from '@/routes/profile';
import { index as registerIndex } from '@/routes/register';
import { index as resourceIndex } from '@/routes/resource';
import {
    document as documentSettings,
    internship as internshipSettings,
} from '@/routes/settings/academic';
import { ROLES, USER_TYPES } from '@/shared/config/roles';
import type { NavItem } from '@/shared/types';

export const ACADEMIC_NAV: NavItem[] = [
    {
        title: 'Panel',
        href: dashboard(),
        icon: LayoutDashboard,
    },

    // Docente, supervisor y estudiante: su propio expediente
    {
        title: 'Mi documentación',
        href: dossierSubmissionIndex().url,
        icon: FolderCheck,
        roles: [ROLES.TEACHER, ROLES.SUPERVISOR, ROLES.STUDENT],
    },

    // Estudiante (en orden de flujo)
    {
        title: 'Mi pasantía',
        href: internshipSubmissionIndex().url,
        icon: GraduationCap,
        roles: [ROLES.STUDENT],
    },
    {
        title: 'Formalización',
        href: internshipFormalization().url,
        icon: FileSignature,
        roles: [ROLES.STUDENT],
    },
    {
        title: 'Mi CV',
        href: studentCvRoute().url,
        icon: UserRound,
        roles: [ROLES.STUDENT],
    },
    {
        title: 'Revisión de prácticas',
        href: reportReviewIndex().url,
        icon: ClipboardList,
        roles: [ROLES.STUDENT],
    },
    {
        title: 'Anexos del informe',
        href: internshipAnnexes().url,
        icon: FileText,
        roles: [ROLES.STUDENT],
    },

    // Supervisor
    {
        title: 'Mis estudiantes',
        href: groupSupervisionIndex().url,
        icon: Users,
        roles: [ROLES.SUPERVISOR],
    },
    {
        title: 'Documentos de prácticas',
        href: '#',
        icon: Folder,
        roles: [ROLES.SUPERVISOR],
        items: [
            {
                title: 'Planes de prácticas',
                href: supervisionPracticePlans().url,
                roles: [ROLES.SUPERVISOR],
            },
            {
                title: 'Informes de prácticas',
                href: supervisionPracticeReports().url,
                roles: [ROLES.SUPERVISOR],
            },
        ],
    },
    {
        title: 'Evaluar estudiantes',
        href: supervisionSubmissionIndex().url,
        icon: NotebookPen,
        roles: [ROLES.SUPERVISOR],
    },

    // Admin / Subadmin / Docente
    {
        title: 'Validar documentación',
        href: '#',
        icon: BadgeCheck,
        roles: [ROLES.ADMIN, ROLES.SUBADMIN, ROLES.TEACHER],
        items: [
            {
                title: 'Docentes titulares',
                href: teacherDossierIndex().url,
                roles: [ROLES.ADMIN, ROLES.SUBADMIN],
            },
            {
                title: 'Docentes supervisores',
                href: supervisorDossierIndex().url,
                roles: [ROLES.ADMIN, ROLES.SUBADMIN, ROLES.TEACHER],
            },
            {
                title: 'Estudiantes',
                href: studentDossierIndex().url,
                roles: [ROLES.ADMIN, ROLES.SUBADMIN, ROLES.TEACHER],
            },
        ],
    },
    {
        title: 'Grupos de prácticas',
        href: '#',
        icon: Boxes,
        roles: [ROLES.ADMIN, ROLES.SUBADMIN, ROLES.TEACHER],
        items: [
            {
                title: 'Por práctica',
                href: internshipIndex().url,
            },
            {
                title: 'Por estudiante',
                href: studentIndex().url,
            },
        ],
    },
    {
        title: 'Seguimiento',
        href: '#',
        icon: BookMarked,
        roles: [ROLES.ADMIN, ROLES.SUBADMIN, ROLES.TEACHER],
        items: [
            {
                title: 'Prácticas de estudiantes',
                href: internshipValidationIndex().url,
            },
            {
                title: 'Evaluaciones de supervisión',
                href: supervisionSubmissionIndex().url,
            },
            {
                title: 'Revisión de evaluaciones',
                href: supervisionValidationIndex().url,
            },
        ],
    },
    {
        title: 'Usuarios',
        href: '#',
        icon: UserRoundCog,
        roles: [ROLES.ADMIN, ROLES.SUBADMIN, ROLES.TEACHER],
        items: [
            {
                title: 'Registrar usuario',
                href: registerIndex().url,
                icon: UserPlus2,
            },
            {
                title: 'Subadministradores',
                href: subadminsIndex().url,
                roles: [ROLES.ADMIN],
            },
            {
                title: 'Docentes titulares',
                href: teachersIndex().url,
                roles: [ROLES.ADMIN, ROLES.SUBADMIN],
            },
            {
                title: 'Docentes supervisores',
                href: supervisorsIndex().url,
            },
            {
                title: 'Estudiantes',
                href: studentsIndex().url,
            },
        ],
    },
    {
        title: 'Empresas',
        href: companiesIndex().url,
        icon: Building2,
        roles: [ROLES.TEACHER],
    },
    {
        title: 'Académico',
        href: '#',
        icon: CalendarRange,
        roles: [ROLES.ADMIN, ROLES.SUBADMIN],
        items: [
            {
                title: 'Semestres',
                href: semestersIndex().url,
            },
            {
                title: 'Facultades',
                href: facultiesIndex().url,
            },
            {
                title: 'Escuelas',
                href: schoolsIndex().url,
            },
            {
                title: 'Secciones',
                href: sectionsIndex().url,
            },
        ],
    },
    {
        title: 'Bolsa laboral',
        href: adminJobBoardIndex().url,
        icon: BriefcaseBusiness,
        roles: [ROLES.ADMIN, ROLES.SUBADMIN],
        badge: 'Nuevo',
    },
    {
        title: 'Bolsa laboral',
        href: teacherJobBoardIndex().url,
        icon: BriefcaseBusiness,
        roles: [ROLES.TEACHER],
        badge: 'Nuevo',
    },
];

export const COMPANY_NAV: NavItem[] = [
    {
        title: 'Panel',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Solicitudes de estudiantes',
        href: companyRequests().url,
        icon: Users,
    },
    {
        title: 'Perfil empresarial',
        href: profileEdit().url,
        icon: Building2,
    },
    {
        title: 'Bolsa laboral',
        href: companyJobBoardIndex().url,
        icon: BriefcaseBusiness,
        badge: 'Nuevo',
    },
];

export const ADMIN_NAV: NavItem[] = [
    {
        title: 'Panel',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Usuarios',
        href: '#',
        icon: UserRoundCog,
        items: [
            {
                title: 'Registrar usuario',
                href: registerIndex().url,
                icon: UserPlus2,
            },
            {
                title: 'Subadministradores',
                href: subadminsIndex().url,
            },
            {
                title: 'Docentes titulares',
                href: teachersIndex().url,
            },
            {
                title: 'Docentes supervisores',
                href: supervisorsIndex().url,
            },
            {
                title: 'Estudiantes',
                href: studentsIndex().url,
            },
        ],
    },
    {
        title: 'Bolsa laboral',
        href: adminJobBoardIndex().url,
        icon: BriefcaseBusiness,
        badge: 'Nuevo',
    },
];

export const ACADEMIC_SETTINGS_NAV: NavItem[] = [
    {
        title: 'Configuración de prácticas',
        href: internshipSettings().url,
        icon: Settings,
    },
    {
        title: 'Configuración de documentos',
        href: documentSettings().url,
        icon: FileText,
        roles: [ROLES.ADMIN, ROLES.SUBADMIN],
    },
];

export const FOOTER_NAV: NavItem[] = [
    {
        title: 'Recursos Administrativos',
        href: resourceIndex().url,
        icon: Archive,
        userTypes: [USER_TYPES.ADMIN],
    },
    {
        title: 'Recursos',
        href: resourceIndex().url,
        icon: Archive,
        userTypes: [USER_TYPES.ACADEMIC],
    },
    {
        title: 'Recursos Empresariales',
        href: resourceIndex().url,
        icon: Archive,
        userTypes: [USER_TYPES.COMPANY],
    },
    {
        title: 'Configuración',
        href: internshipSettings().url,
        icon: Settings,
        userTypes: [USER_TYPES.ACADEMIC],
        roles: [ROLES.ADMIN, ROLES.SUBADMIN, ROLES.TEACHER],
    },
];
