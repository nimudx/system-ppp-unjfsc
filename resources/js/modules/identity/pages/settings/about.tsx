import { Head } from '@inertiajs/react';
import SettingsLayout from '@/layouts/settings/layout';
import Heading from '@/shared/components/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Cpu, Code2, UserCircle2, ShieldCheck, Github, ExternalLink } from 'lucide-react';
import AppLayout from '@/shared/layouts/app-layout';

const breadcrumbs = [
    {
        title: 'About',
        href: '',
    },
];

export default function About() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />
            <SettingsLayout>
                <Head title="About - Practicas Pre Profesional" />

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="About"
                        description="Information about the project and its development team."
                    />

                    <div className="grid gap-6">
                        <Card className="overflow-hidden border-none bg-linear-to-br from-primary/5 via-transparent to-primary/5 shadow-sm ring-1 ring-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold tracking-tight">System PPP UNJFSC</CardTitle>
                                        <CardDescription>
                                            Sistema de Gestión de Prácticas Pre Profesionales
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                                        Version 4.0
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Este sistema ha sido diseñado y desarrollado para optimizar los procesos académicos y administrativos relacionados con las prácticas pre-profesionales, proporcionando una plataforma robusta, segura y eficiente para estudiantes, docentes y administradores.
                                </p>

                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3 ring-1 ring-border">
                                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                                            <Code2 className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-medium uppercase text-muted-foreground">Frontend</p>
                                            <p className="text-xs font-semibold">React + Inertia</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3 ring-1 ring-border">
                                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                                            <Cpu className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-medium uppercase text-muted-foreground">Backend</p>
                                            <p className="text-xs font-semibold">Laravel 11</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3 ring-1 ring-border">
                                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-medium uppercase text-muted-foreground">Security</p>
                                            <p className="text-xs font-semibold">Sanctum + Fortify</p>
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
                                        <CardTitle className="text-lg">Project Manager</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        <p className="text-base font-bold">Ing. Carlos Claros</p>
                                        <p className="text-xs text-muted-foreground">Supervisión y Dirección de Proyecto</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group border-primary/20 transition-all hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Code2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                                        <CardTitle className="text-lg">Lead Developer</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-base font-bold">Ing. Martin Nicasio Marcelo</p>
                                        <p className="text-xs text-muted-foreground">Arquitectura y Desarrollo Fullstack</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <a
                                            href="https://github.com/martii-n"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            <Github className="h-4 w-4" />
                                        </a>
                                        <a
                                            href="#"
                                            className="text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Separator />

                        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                    &copy; {new Date().getFullYear()} Facultad de Ingeniería Industrial, Sistemas e Informática
                                </p>
                                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                                    Universidad Nacional José Faustino Sánchez Carrión
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                <span className="cursor-default hover:text-primary">Documentation</span>
                                <span className="cursor-default hover:text-primary">Changelog</span>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
