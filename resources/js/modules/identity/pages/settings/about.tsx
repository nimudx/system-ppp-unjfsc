import { Head } from '@inertiajs/react';
import {
    Cpu,
    Code2,
    UserCircle2,
    ShieldCheck,
    Github,
    ExternalLink,
    Users,
} from 'lucide-react';
import Heading from '@/shared/components/heading';
import { Badge } from '@/shared/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import AppLayout from '@/shared/layouts/app-layout';
import SettingsLayout from '@/shared/layouts/settings/layout';

const breadcrumbs = [
    {
        title: 'Acerca de',
        href: '',
    },
];

type Developer = {
    name: string;
    github: string;
    portfolio?: string;
};

const DEVELOPERS: Developer[] = [
    {
        name: 'Ing. Bruno Castillo Robles',
        github: 'https://github.com/BrunoCastillo23',
        portfolio: 'https://portfolio-flax-omega-9o41txpov8.vercel.app/',
    },
    {
        name: 'Ing. Jean Fernandez Pardo',
        github: 'https://github.com/JeanSmith1505',
    },
    {
        name: 'Ing. Yefferson Quiñonez Espinoza',
        github: 'https://github.com/yeffx10',
    },
    {
        name: 'Ing. Aldo Rios Chaccara',
        github: 'https://github.com/SrDiff',
    },
    {
        name: 'Ing. Mirko Torres Diaz',
        github: 'https://github.com/MirkoTorres02',
    },
    {
        name: 'Ing. Renzo Villavicencio Romero',
        github: 'https://github.com/Renzo212000',
    },
];

function DeveloperLinks({ developer }: { developer: Developer }) {
    return (
        <div className="flex items-center gap-3">
            <a
                href={developer.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`GitHub de ${developer.name}`}
                className="text-muted-foreground transition-colors hover:text-primary"
            >
                <Github className="h-4 w-4" />
            </a>
            {developer.portfolio && (
                <a
                    href={developer.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Portafolio de ${developer.name}`}
                    className="text-muted-foreground transition-colors hover:text-primary"
                >
                    <ExternalLink className="h-4 w-4" />
                </a>
            )}
        </div>
    );
}

export default function About() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <Head title="Acerca de" />

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Acerca de"
                        description="Información sobre el proyecto y su equipo de desarrollo."
                    />

                    <div className="grid gap-6">
                        <Card className="overflow-hidden border-none bg-linear-to-br from-primary/5 via-transparent to-primary/5 shadow-sm ring-1 ring-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold tracking-tight">
                                            Sistema PPP UNJFSC
                                        </CardTitle>
                                        <CardDescription>
                                            Sistema de Gestión de Prácticas Pre
                                            Profesionales
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="px-3 py-1 text-xs font-semibold tracking-wider uppercase"
                                    >
                                        Versión 5.0
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Este sistema ha sido diseñado y desarrollado
                                    para optimizar los procesos académicos y
                                    administrativos relacionados con las
                                    prácticas pre-profesionales, proporcionando
                                    una plataforma robusta, segura y eficiente
                                    para estudiantes, docentes y
                                    administradores.
                                </p>

                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3 ring-1 ring-border">
                                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                                            <Code2 className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase">
                                                Frontend
                                            </p>
                                            <p className="text-xs font-semibold">
                                                React + Inertia
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3 ring-1 ring-border">
                                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                                            <Cpu className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase">
                                                Backend
                                            </p>
                                            <p className="text-xs font-semibold">
                                                Laravel 12
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3 ring-1 ring-border">
                                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase">
                                                Security
                                            </p>
                                            <p className="text-xs font-semibold">
                                                Sanctum + Fortify
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="group transition-all hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 text-primary">
                                        <UserCircle2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                                        <CardTitle className="text-lg">
                                            Project Manager
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        <p className="text-base font-bold">
                                            Ing. Carlos Claros
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Supervisión y Dirección de Proyecto
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group border-primary/20 transition-all hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Code2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                                        <CardTitle className="text-lg">
                                            Lead Developer
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-base font-bold">
                                            Ing. Martin Nicasio Marcelo
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Arquitectura y Desarrollo Fullstack
                                        </p>
                                    </div>
                                    <DeveloperLinks
                                        developer={{
                                            name: 'Ing. Martin Nicasio Marcelo',
                                            github: 'https://github.com/martii-n',
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2 text-primary">
                                    <Users className="h-5 w-5" />
                                    <CardTitle className="text-lg">
                                        Equipo de Desarrollo
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    Arquitectura y Desarrollo Full Stack
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="grid gap-3 sm:grid-cols-2">
                                    {DEVELOPERS.map((developer) => (
                                        <li
                                            key={developer.github}
                                            className="flex items-center justify-between gap-3 rounded-lg p-3 ring-1 ring-border transition-shadow hover:shadow-sm"
                                        >
                                            <div className="min-w-0 space-y-0.5">
                                                <p className="text-sm font-semibold break-words">
                                                    {developer.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Arquitectura y Desarrollo
                                                    Full Stack
                                                </p>
                                            </div>
                                            <DeveloperLinks
                                                developer={developer}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Separator />

                        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                    &copy; {new Date().getFullYear()} Facultad
                                    de Ingeniería Industrial, Sistemas e
                                    Informática
                                </p>
                                <p className="text-[10px] tracking-widest text-muted-foreground/60 uppercase">
                                    Universidad Nacional José Faustino Sánchez
                                    Carrión
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                <span className="cursor-default hover:text-primary">
                                    Documentación
                                </span>
                                <span className="cursor-default hover:text-primary">
                                    Historial de cambios
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
