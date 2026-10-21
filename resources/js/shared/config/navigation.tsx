import {
    Archive,
    BadgeCheck,
    BookMarked,
    BookOpen,
    Boxes,
    Briefcase,
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
import { index as semestersIndex } from '@/routes/academic/semesters';
import { index as facultiesIndex } from '@/routes/academic/faculties';
import { index as schoolsIndex } from '@/routes/academic/schools';
import { index as sectionsIndex } from '@/routes/academic/sections';
import { index as registerIndex } from '@/routes/register';
import { index as subadminsIndex } from '@/routes/academic/subadmins';
import { index as teachersIndex } from '@/routes/academic/teachers';
import { index as supervisorsIndex } from '@/routes/academic/supervisors';
import { index as studentsIndex } from '@/routes/academic/students';
import { submission as dossierSubmissionIndex } from '@/routes/academic/dossiers';
import { teacher as teacherDossierIndex } from '@/routes/academic/dossiers';
import { supervisor as supervisorDossierIndex } from '@/routes/academic/dossiers';
import { student as studentDossierIndex } from '@/routes/academic/dossiers';
import { internship as internshipIndex } from '@/routes/academic/groups';
import { student as studentIndex } from '@/routes/academic/groups';
import { supervision as groupSupervisionIndex } from '@/routes/academic/groups';
import { submission as supervisionSubmissionIndex } from '@/routes/academic/supervision';
import { validation as supervisionValidationIndex } from '@/routes/academic/supervision';
import { student as studentSupervisionIndex } from '@/routes/academic/supervision';
import { index as resourceIndex } from '@/routes/resource';
import { submission as internshipSubmissionIndex } from '@/routes/academic/internship';
import { validation as internshipValidationIndex } from '@/routes/academic/internship';

export const ACADEMIC_NAV = [
    {
        title: 'Dashboard',
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
        title: "Estudiantes",
        href: groupSupervisionIndex().url,
        icon: Users,
        roles: [4],
    },
    {
        title: 'Evaluación',
        href: supervisionSubmissionIndex().url,
        icon: NotebookPen,
        roles: [4]
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
    }
];

export const COMPANY_NAV = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Mis vacantes',
        href: '#',
        icon: Briefcase,
    },
];

export const ADMIN_NAV = [
    {
        title: 'Dashboard',
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
        title: 'Repository',
        href: 'https://github.com/martii-n/system-ppp-unjfsc',
        icon: Folder,
        userTypes: [1, 2],
        roles: [1, 2],
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
        userTypes: [1, 2],
        roles: [1, 2],
    },
];
