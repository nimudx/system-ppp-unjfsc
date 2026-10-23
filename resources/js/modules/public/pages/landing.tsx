import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    CheckCircle2,
    ClipboardList,
    Facebook,
    FileText,
    Globe,
    GraduationCap,
    HelpCircle,
    Layers,
    LayoutDashboard,
    LogIn,
    Search,
    ShieldCheck,
    Smartphone,
    Star,
    Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppLogoIcon from '@/shared/components/app-logo-icon';
import AppearanceToggleTab from '@/shared/components/appearance-tabs';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/shared/components/ui/tabs';

const navLinks = [
    { id: 'about', label: 'Nosotros' },
    { id: 'roles', label: 'Roles' },
    { id: 'process', label: 'Proceso' },
    { id: 'faq', label: 'Ayuda' },
];

// Duración del desplazamiento al hacer clic en el menú (ms).
const SCROLL_DURATION = 900;

const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Desplaza la página hasta la sección de forma suave y pausada, dejando
// libre el alto de la cabecera fija. Respeta prefers-reduced-motion.
function smoothScrollToSection(id: string, onDone?: () => void) {
    const section = document.getElementById(id);
    if (!section) return;

    const headerHeight = document.querySelector('header')?.offsetHeight ?? 0;
    const start = window.scrollY;
    const target = section.getBoundingClientRect().top + start - headerHeight;
    const distance = target - start;

    if (
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        Math.abs(distance) < 1
    ) {
        window.scrollTo(0, target);
        onDone?.();
        return;
    }

    let startTime: number | null = null;
    const step = (now: number) => {
        startTime ??= now;
        const progress = Math.min((now - startTime) / SCROLL_DURATION, 1);
        window.scrollTo(0, start + distance * easeInOutCubic(progress));
        if (progress < 1) requestAnimationFrame(step);
        else onDone?.();
    };
    requestAnimationFrame(step);
}

// Menú con subrayado deslizante: la barra sigue al cursor y, al salir,
// vuelve a la sección activa (seleccionada o visible en pantalla).
function SlidingNavLinks() {
    const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
    const hoveredRef = useRef<string | null>(null);
    const activeRef = useRef<string | null>(null);
    const isScrollingRef = useRef(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [indicator, setIndicator] = useState({
        left: 0,
        width: 0,
        visible: false,
    });

    const moveIndicatorTo = (id: string | null) => {
        const link = id ? linkRefs.current[id] : null;
        setIndicator((prev) =>
            link
                ? {
                      left: link.offsetLeft,
                      width: link.offsetWidth,
                      visible: true,
                  }
                : { ...prev, visible: false },
        );
    };

    const hover = (id: string | null) => {
        hoveredRef.current = id;
        moveIndicatorTo(id ?? activeRef.current);
    };

    const activate = (id: string) => {
        activeRef.current = id;
        setActiveId(id);
        if (!hoveredRef.current) moveIndicatorTo(id);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.find((entry) => entry.isIntersecting);
                // Durante el scroll del menú se ignoran las secciones
                // intermedias para que el subrayado no salte entre ellas.
                if (visible && !isScrollingRef.current) {
                    activate(visible.target.id);
                }
            },
            { rootMargin: '-45% 0px -50% 0px' },
        );

        navLinks.forEach(({ id }) => {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className="relative mr-6 hidden gap-1 md:flex"
            onMouseLeave={() => hover(null)}
        >
            {navLinks.map(({ id, label }) => (
                <a
                    key={id}
                    href={`#${id}`}
                    ref={(el) => {
                        linkRefs.current[id] = el;
                    }}
                    onMouseEnter={() => hover(id)}
                    onFocus={() => hover(id)}
                    onBlur={() => hover(null)}
                    onClick={(event) => {
                        event.preventDefault();
                        activate(id);
                        isScrollingRef.current = true;
                        smoothScrollToSection(id, () => {
                            isScrollingRef.current = false;
                        });
                        window.history.replaceState(null, '', `#${id}`);
                    }}
                    aria-current={activeId === id ? 'true' : undefined}
                    className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 ease-out outline-none hover:scale-105 hover:text-primary focus-visible:scale-105 focus-visible:text-primary motion-reduce:transition-none motion-reduce:hover:scale-100 ${
                        activeId === id
                            ? 'text-primary'
                            : 'text-muted-foreground'
                    }`}
                >
                    {label}
                </a>
            ))}

            <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-primary transition-all duration-300 ease-out motion-reduce:transition-none"
                style={{
                    left: indicator.left + 12,
                    width: Math.max(indicator.width - 24, 0),
                    opacity: indicator.visible ? 1 : 0,
                }}
            />
        </div>
    );
}

export default function Landing() {
    const { auth } = usePage().props;

    const sections = {
        roles: {
            estudiante: [
                {
                    icon: Users,
                    text: 'Registro de datos personales y académicos',
                },
                { icon: FileText, text: 'Carga de documentos de acreditación' },
                {
                    icon: Smartphone,
                    text: 'Seguimiento de la etapa de desarrollo',
                },
                {
                    icon: ClipboardList,
                    text: 'Registro de informes y evidencias',
                },
                { icon: Star, text: 'Consulta de calificación y estado final' },
            ],
            docente: [
                {
                    icon: Users,
                    text: 'Gestión de grupos de práctica asignados',
                },
                {
                    icon: ShieldCheck,
                    text: 'Validación de documentos de estudiantes',
                },
                {
                    icon: Search,
                    text: 'Monitoreo presencial y remoto (Supervisión)',
                },
                {
                    icon: LayoutDashboard,
                    text: 'Calificación de etapas y resultados',
                },
                { icon: FileText, text: 'Generación de actas de evaluación' },
            ],
            empresa: [
                {
                    icon: Building2,
                    text: 'Registro de Razón Social y datos de sede',
                },
                {
                    icon: Users,
                    text: 'Identificación de tutores y jefes directos',
                },
                {
                    icon: Layers,
                    text: 'Validación de convenios institucionales',
                },
                {
                    icon: Globe,
                    text: 'Control de ubicación de centros de práctica',
                },
                {
                    icon: BookOpen,
                    text: 'Banco de datos de empresas receptoras',
                },
            ],
        },
    };

    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
            <Head>
                <title>Sistema de Prácticas | UNJFSC</title>
                <meta
                    name="description"
                    content="Sistema de Gestión de Prácticas Pre Profesionales - Universidad Nacional José Faustino Sánchez Carrión"
                />
            </Head>

            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="page-container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex aspect-square size-10 items-center justify-center rounded-md">
                            <AppLogoIcon className="size-9 fill-current" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="block text-sm leading-none font-bold">
                                Sistema de Prácticas
                            </span>
                            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                                UNJFSC
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-4">
                        <SlidingNavLinks />

                        <AppearanceToggleTab className="hidden sm:inline-flex" />

                        <Separator
                            orientation="vertical"
                            className="hidden h-6 sm:block"
                        />

                        {auth.user ? (
                            <Button asChild variant="secondary">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Ir al Panel</span>
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2"
                                >
                                    <LogIn className="h-4 w-4" />
                                    <span>Acceder</span>
                                </Link>
                            </Button>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                {/* Foto del campus de fondo; en celular va arriba y la tarjeta debajo. */}
                <section className="relative isolate border-b bg-muted/20">
                    <img
                        src="/images/home/campus-unjfsc-1280.webp"
                        srcSet="/images/home/campus-unjfsc-768.webp 768w, /images/home/campus-unjfsc-1280.webp 1280w, /images/home/campus-unjfsc-1920.webp 1920w"
                        sizes="100vw"
                        width={1920}
                        height={1253}
                        fetchPriority="high"
                        decoding="async"
                        alt="Campus de la UNJFSC con el busto de José Faustino Sánchez Carrión rodeado de jardines"
                        className="aspect-[16/10] w-full object-cover object-[42%_center] sm:aspect-[16/9] lg:absolute lg:inset-0 lg:-z-10 lg:aspect-auto lg:h-full"
                    />
                    {/* Degradado hacia la tarjeta para mantener el contraste sin oscurecer el busto. */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 hidden bg-gradient-to-l from-lochmara-950/55 via-lochmara-950/10 to-transparent lg:block"
                    />

                    <div className="relative page-container -mt-14 pb-12 sm:-mt-24 lg:mt-0 lg:flex lg:min-h-[640px] lg:items-center lg:justify-end lg:py-20 xl:min-h-[700px]">
                        <div className="animate-in rounded-2xl border bg-card/95 p-7 shadow-2xl duration-700 fade-in slide-in-from-bottom-4 motion-reduce:animate-none sm:p-10 lg:max-w-xl lg:bg-card/90 lg:backdrop-blur-md">
                            <Badge
                                variant="secondary"
                                className="mb-5 max-w-full px-3 py-1 text-xs whitespace-normal"
                            >
                                Universidad Nacional José Faustino Sánchez
                                Carrión
                            </Badge>

                            <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-foreground sm:text-4xl xl:text-5xl">
                                Sistema de Gestión de{' '}
                                <span className="tracking-tighter text-primary">
                                    Prácticas Pre Profesionales
                                </span>
                            </h1>

                            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                                Optimización administrativa y seguimiento
                                académico centralizado para todas las
                                facultades. Conecta tu potencial académico con
                                el sector productivo líder en el país.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Button size="lg" asChild>
                                    <a
                                        href="#roles"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            smoothScrollToSection('roles');
                                            window.history.replaceState(
                                                null,
                                                '',
                                                '#roles',
                                            );
                                        }}
                                    >
                                        Explorar Funcionalidades
                                    </a>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/login">
                                        Acceder al Sistema
                                    </Link>
                                </Button>
                            </div>

                            <Link
                                href="/registro-empresa"
                                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                <Building2 className="h-4 w-4" />
                                ¿Eres empresa? Registrar mi empresa
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision Section */}
                <section
                    id="about"
                    className="page-container grid gap-12 py-24 md:grid-cols-2"
                >
                    <Card className="group border-muted shadow-sm transition-all duration-300 ease-out hover:scale-[1.03] hover:bg-lochmara-800 hover:shadow-xl hover:ring-lochmara-800 motion-reduce:transition-none motion-reduce:hover:scale-100 dark:hover:bg-lochmara-700 dark:hover:ring-lochmara-700">
                        <CardHeader>
                            <Badge
                                variant="secondary"
                                className="mb-2 w-fit transition-colors group-hover:bg-white/15 group-hover:text-white"
                            >
                                Academico
                            </Badge>
                            <CardTitle className="text-3xl font-bold tracking-tight transition-colors group-hover:text-white">
                                Misión
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed text-muted-foreground transition-colors group-hover:text-lochmara-100">
                                Formar profesionales líderes en sus respectivas
                                disciplinas, con sólidos valores éticos y
                                compromiso social, capaces de generar
                                conocimiento científico y tecnológico para el
                                desarrollo sostenible de la región y el país.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group border-muted bg-muted/10 shadow-sm transition-all duration-300 ease-out hover:scale-[1.03] hover:bg-lochmara-800 hover:shadow-xl hover:ring-lochmara-800 motion-reduce:transition-none motion-reduce:hover:scale-100 dark:hover:bg-lochmara-700 dark:hover:ring-lochmara-700">
                        <CardHeader>
                            <Badge
                                variant="secondary"
                                className="mb-2 w-fit transition-colors group-hover:bg-white/15 group-hover:text-white"
                            >
                                Institucional
                            </Badge>
                            <CardTitle className="text-3xl font-bold tracking-tight transition-colors group-hover:text-white">
                                Visión
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed text-muted-foreground transition-colors group-hover:text-lochmara-100">
                                Ser una universidad referente nacional e
                                internacional en calidad educativa,
                                investigación e innovación, reconocida por su
                                contribución al bienestar de la sociedad y la
                                formación de ciudadanos del mundo.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Roles / Platform Structure */}
                <section id="roles" className="border-y bg-muted/30 py-24">
                    <div className="page-container">
                        <div className="mb-16 space-y-4 text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Estructura de la Plataforma
                            </h2>
                            <p className="text-muted-foreground italic">
                                Servicios centralizados diseñados para cada
                                pilar del proceso.
                            </p>
                        </div>

                        <Tabs
                            defaultValue="estudiante"
                            className="ring-offset-background"
                        >
                            <TabsList className="grid h-12 w-full grid-cols-3">
                                <TabsTrigger
                                    value="estudiante"
                                    className="text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                                >
                                    Estudiante
                                </TabsTrigger>
                                <TabsTrigger
                                    value="docente"
                                    className="text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                                >
                                    Docente
                                </TabsTrigger>
                                <TabsTrigger
                                    value="empresa"
                                    className="text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                                >
                                    Empresa
                                </TabsTrigger>
                            </TabsList>

                            {Object.entries(sections.roles).map(
                                ([role, items]) => (
                                    <TabsContent
                                        key={role}
                                        value={role}
                                        className="mt-8"
                                    >
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                            <Card className="border-none bg-transparent py-6 shadow-none">
                                                <CardHeader className="px-6">
                                                    <CardTitle className="text-2xl font-bold capitalize">
                                                        Servicios para el {role}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Principales acciones y
                                                        herramientas
                                                        disponibles.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="px-6">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        {items.map(
                                                            (item, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="group flex items-center gap-4 rounded-lg border bg-background p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                                                                >
                                                                    <div className="rounded-md bg-muted p-2 transition-colors group-hover:bg-white/15 group-hover:text-primary-foreground">
                                                                        <item.icon className="h-5 w-5" />
                                                                    </div>
                                                                    <span className="text-sm font-medium">
                                                                        {
                                                                            item.text
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {role === 'empresa' && (
                                                <div className="flex flex-col items-center justify-between gap-4 rounded-lg border bg-background p-6 text-center sm:flex-row sm:text-left">
                                                    <div>
                                                        <p className="font-semibold">
                                                            ¿Tu empresa quiere
                                                            recibir
                                                            practicantes?
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Regístrala en
                                                            minutos y empieza a
                                                            recibir
                                                            postulaciones.
                                                        </p>
                                                    </div>
                                                    <Button
                                                        className="shrink-0"
                                                        asChild
                                                    >
                                                        <Link href="/registro-empresa">
                                                            <Building2 className="h-4 w-4" />
                                                            Registrar empresa
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                ),
                            )}
                        </Tabs>
                    </div>
                </section>

                {/* Process Stages Section */}
                <section id="process" className="py-24">
                    <div className="page-container text-center">
                        <div className="mb-16 space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Etapas del Proceso de Prácticas
                            </h2>
                            <p className="text-muted-foreground">
                                Estructura administrativa oficial bajo normativa
                                universitaria.
                            </p>
                        </div>

                        <div className="grid gap-12 text-left md:grid-cols-3">
                            {[
                                {
                                    title: 'Acreditación',
                                    desc: 'Registro y validación de los pilares: Estudiantes, Docentes y Empresas (Razón Social).',
                                    icon: CheckCircle2,
                                },
                                {
                                    title: 'Desarrollo',
                                    desc: 'Gestión técnica, monitoreo académico y carga de evidencias en tiempo real.',
                                    icon: GraduationCap,
                                },
                                {
                                    title: 'Finalización',
                                    desc: 'Revisión técnica de informes finales y cierre oficial del expediente académico.',
                                    icon: FileText,
                                },
                            ].map((stage, i) => (
                                <div
                                    key={i}
                                    className="group flex flex-col space-y-4 rounded-xl border bg-card/40 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                                >
                                    <div className="mb-2 w-fit rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-white/15 group-hover:text-primary-foreground">
                                        <stage.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold">
                                        {stage.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-primary-foreground/85">
                                        {stage.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="border-t bg-muted/10 py-24">
                    <div className="page-container">
                        <div className="grid gap-12 lg:grid-cols-5">
                            <div className="space-y-4 lg:col-span-2">
                                <h2 className="text-3xl font-bold tracking-tight">
                                    Preguntas Frecuentes
                                </h2>
                                <p className="text-muted-foreground">
                                    Todo lo que necesitas saber para iniciar y
                                    concluir tus prácticas con éxito.
                                </p>

                                <div className="flex items-start gap-4 rounded-lg border bg-background p-4">
                                    <HelpCircle className="h-6 w-6 shrink-0 text-primary" />
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Si no encuentras tu duda aquí, contacta
                                        con la oficina de prácticas de tu
                                        facultad.
                                    </p>
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                <Accordion
                                    type="multiple"
                                    defaultValue={['item-0']}
                                    className="flex w-full flex-col gap-3"
                                >
                                    {[
                                        {
                                            t: '¿Qué tiempo duran las prácticas?',
                                            a: 'Tienen una duración mínima de 4 meses (320 horas) hasta un máximo de 6 meses, según el plan de estudios.',
                                        },
                                        {
                                            t: '¿Qué tipo de modalidades existen?',
                                            a: 'Existen dos: Por Desarrollo (durante el semestre) y Por Convalidación (experiencia laboral previa).',
                                        },
                                        {
                                            t: '¿Cuáles son los requisitos iniciales?',
                                            a: 'Matrícula vigente, aprobación de prerrequisitos y asignación de un docente supervisor.',
                                        },
                                        {
                                            t: '¿Cómo obtengo mis credenciales?',
                                            a: 'Son gestionadas por tu facultad. Consulta con tu docente de curso de Prácticas Pre Profesional',
                                        },
                                    ].map((q, i) => (
                                        <AccordionItem
                                            key={i}
                                            value={`item-${i}`}
                                            className="overflow-hidden rounded-lg border bg-background shadow-xs transition-[border-color,box-shadow] duration-300 last:border-b data-[state=open]:border-primary/40 data-[state=open]:shadow-sm motion-reduce:transition-none"
                                        >
                                            <AccordionTrigger className="items-center rounded-none px-5 py-4 text-left text-sm font-semibold transition-colors duration-200 hover:bg-muted/60 hover:text-primary hover:no-underline focus-visible:ring-inset data-[state=open]:text-primary motion-reduce:transition-none [&>svg]:translate-y-0">
                                                {q.t}
                                            </AccordionTrigger>
                                            <AccordionContent className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground transition-opacity duration-300 ease-out in-data-[state=closed]:opacity-0 motion-reduce:transition-none [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5">
                                                {q.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/30">
                <div className="page-container py-16">
                    <div className="flex flex-col items-center space-y-6 text-center">
                        <div className="flex aspect-square items-center justify-center rounded-md">
                            <AppLogoIcon className="size-24 fill-current" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-base font-bold tracking-tight uppercase">
                                Universidad Nacional José Faustino Sánchez
                                Carrión
                            </h3>
                            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                Sede Central - Huacho, Perú
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-primary"
                            >
                                <Facebook className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-primary"
                            >
                                <Globe className="h-5 w-5" />
                            </Button>
                        </div>

                        <Separator className="mx-auto w-24" />

                        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                            Sistema de Prácticas &copy;{' '}
                            {new Date().getFullYear()} Todos los derechos
                            reservados
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
