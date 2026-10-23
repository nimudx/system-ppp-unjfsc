import { Head, Link, usePage } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    ChevronRight,
    Facebook,
    FileText,
    Globe,
    GraduationCap,
    HelpCircle,
    Info,
    ListChecks,
    LayoutDashboard,
    LogIn,
    Menu,
    ShieldCheck,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/shared/components/ui/sheet';
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

// "Acceder" para visitantes o "Ir al Panel" si ya hay sesión.
function AccessButton({
    isAuthenticated,
    className,
}: {
    isAuthenticated: boolean;
    className?: string;
}) {
    return isAuthenticated ? (
        <Button asChild variant="secondary" className={className}>
            <Link href="/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Ir al Panel</span>
            </Link>
        </Button>
    ) : (
        <Button asChild className={className}>
            <Link href="/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Acceder</span>
            </Link>
        </Button>
    );
}

// Iconos de cada sección en el menú del celular.
const navIcons: Record<string, LucideIcon> = {
    about: Info,
    roles: Users,
    process: ListChecks,
    faq: HelpCircle,
};

// En celular: secciones, tema y acceso en un panel lateral.
function MobileMenu({ isAuthenticated }: { isAuthenticated: boolean }) {
    const [open, setOpen] = useState(false);

    // Se cierra el panel y luego se desplaza: mientras está abierto la página
    // tiene el scroll bloqueado.
    const goToSection = (id: string) => {
        setOpen(false);
        window.setTimeout(() => {
            smoothScrollToSection(id);
            window.history.replaceState(null, '', `#${id}`);
        }, 300);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="sm:hidden"
                    aria-label="Abrir menú"
                >
                    <Menu className="size-6" />
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-80 gap-0"
                onCloseAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="border-b p-5">
                    <div className="flex items-center gap-3">
                        <AppLogoIcon className="size-9 fill-current" />
                        <div>
                            <SheetTitle className="text-sm leading-none font-bold">
                                Sistema de Prácticas
                            </SheetTitle>
                            <SheetDescription className="mt-1 text-[10px] font-medium tracking-widest uppercase">
                                UNJFSC
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <nav aria-label="Secciones" className="p-3">
                    {navLinks.map(({ id, label }) => {
                        const Icon = navIcons[id];

                        return (
                            <a
                                key={id}
                                href={`#${id}`}
                                onClick={(event) => {
                                    event.preventDefault();
                                    goToSection(id);
                                }}
                                className="group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:bg-accent focus-visible:outline-none"
                            >
                                <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                    <Icon className="size-4" />
                                </span>
                                {label}
                                <ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none" />
                            </a>
                        );
                    })}
                </nav>

                <div className="space-y-3 border-t px-5 py-4">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Tema
                    </p>
                    <AppearanceToggleTab className="w-full [&>button]:flex-1 [&>button]:justify-center" />
                </div>

                <div className="mt-auto border-t p-5">
                    <AccessButton
                        isAuthenticated={isAuthenticated}
                        className="w-full"
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}

type RoleKey = 'estudiante' | 'titular' | 'supervisor' | 'empresa';

interface RoleInfo {
    key: RoleKey;
    label: string;
    icon: LucideIcon;
    summary: string;
    services: string[];
    // Captura del sistema para ese rol (sin captura se muestra el registro de empresas).
    screenshot?: { slug: string; alt: string };
}

// Servicios según el menú real de cada rol en el sistema.
const platformRoles: RoleInfo[] = [
    {
        key: 'estudiante',
        label: 'Estudiante',
        icon: GraduationCap,
        summary: 'Gestiona su expediente y el avance de sus prácticas.',
        services: [
            'Carga de documentos de su expediente y seguimiento de su estado',
            'Registro de su práctica y del centro donde la realiza',
            'Revisión del avance de sus prácticas',
            'Envío y revisión de informes',
            'Avisos cuando un documento se aprueba o se observa',
        ],
        screenshot: {
            slug: 'estudiante',
            alt: 'Pantalla de documentación del estudiante con la ficha de matrícula aprobada',
        },
    },
    {
        key: 'titular',
        label: 'Docente Titular',
        icon: ShieldCheck,
        summary: 'Valida expedientes y organiza a estudiantes y supervisores.',
        services: [
            'Validación de expedientes de estudiantes y supervisores',
            'Organización de grupos por práctica y por estudiante',
            'Seguimiento, evaluación y revisión de las prácticas',
            'Registro de estudiantes y docentes supervisores',
            'Carga de su propia documentación (horario y carga lectiva)',
        ],
        screenshot: {
            slug: 'docente-titular',
            alt: 'Pantalla de validación de estudiantes del docente titular con un documento observado',
        },
    },
    {
        key: 'supervisor',
        label: 'Docente Supervisor',
        icon: Users,
        summary: 'Acompaña y evalúa a los estudiantes de sus grupos.',
        services: [
            'Consulta de los estudiantes de sus grupos asignados',
            'Revisión de planes e informes de prácticas',
            'Evaluación de las prácticas de cada estudiante',
            'Carga de su documentación (horario, carga lectiva y resolución)',
        ],
        screenshot: {
            slug: 'docente-supervisor',
            alt: 'Pantalla de supervisión con el listado de estudiantes a supervisar',
        },
    },
    {
        key: 'empresa',
        label: 'Empresa',
        icon: Building2,
        summary: 'Recibe practicantes de la universidad.',
        services: [
            'Registro de razón social y datos de sede',
            'Identificación de tutores y jefes directos',
            'Validación de convenios institucionales',
            'Control de ubicación de centros de práctica',
        ],
    },
];

// Estructura de la plataforma: roles a la izquierda y, a la derecha, la
// pantalla del sistema de ese rol dentro de un marco de navegador.
function PlatformStructure() {
    const [active, setActive] = useState<RoleKey>('estudiante');
    const current = platformRoles.find((role) => role.key === active)!;

    return (
        <Tabs
            value={active}
            onValueChange={(value) => setActive(value as RoleKey)}
            orientation="vertical"
            className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center"
        >
            <div className="space-y-6">
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 lg:grid-cols-1">
                    {platformRoles.map(
                        ({ key, label, icon: Icon, summary }) => (
                            <TabsTrigger
                                key={key}
                                value={key}
                                className="group h-auto w-full justify-start gap-3 rounded-xl border bg-card px-4 py-3 text-left whitespace-normal shadow-xs transition-all duration-300 hover:border-primary/40 hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md motion-reduce:transition-none dark:data-[state=active]:border-primary dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                            >
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary transition-colors group-data-[state=active]:bg-white/15 group-data-[state=active]:text-primary-foreground">
                                    <Icon className="size-5" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold">
                                        {label}
                                    </span>
                                    <span className="hidden text-xs font-normal opacity-80 lg:block">
                                        {summary}
                                    </span>
                                </span>
                            </TabsTrigger>
                        ),
                    )}
                </TabsList>

                {platformRoles.map(({ key, label, services }) => (
                    <TabsContent
                        key={key}
                        value={key}
                        className="animate-in rounded-xl border bg-card p-6 shadow-xs duration-500 fade-in motion-reduce:animate-none"
                    >
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold">
                                Servicios para {label.toLowerCase()}
                            </h3>
                            {key === 'empresa' && (
                                <Badge variant="secondary">Próximamente</Badge>
                            )}
                        </div>
                        <ul className="space-y-3">
                            {services.map((service) => (
                                <li
                                    key={service}
                                    className="flex items-start gap-3 text-sm"
                                >
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <span>{service}</span>
                                </li>
                            ))}
                        </ul>
                    </TabsContent>
                ))}
            </div>

            {/* Vista del sistema: las capturas se apilan y la activa aparece con un fundido. */}
            <div aria-live="polite">
                {current.screenshot ? (
                    <figure className="overflow-hidden rounded-xl border bg-card shadow-xl">
                        <div
                            aria-hidden="true"
                            className="flex items-center gap-2 border-b bg-muted/60 px-4 py-2.5"
                        >
                            <span className="size-2.5 rounded-full bg-red-400/80" />
                            <span className="size-2.5 rounded-full bg-amber-400/80" />
                            <span className="size-2.5 rounded-full bg-emerald-400/80" />
                            <span className="ml-3 truncate rounded-md bg-background px-3 py-0.5 text-xs text-muted-foreground">
                                practicaspre.kerpun.com
                            </span>
                        </div>
                        <div className="relative aspect-[1515/720] bg-muted">
                            {platformRoles
                                .filter((role) => role.screenshot)
                                .map(({ key, screenshot }) => (
                                    <img
                                        key={key}
                                        src={`/images/home/roles/${screenshot!.slug}-1280.webp`}
                                        srcSet={`/images/home/roles/${screenshot!.slug}-768.webp 768w, /images/home/roles/${screenshot!.slug}-1280.webp 1280w`}
                                        sizes="(min-width: 1024px) 55vw, 90vw"
                                        width={1280}
                                        height={608}
                                        loading="lazy"
                                        decoding="async"
                                        alt={
                                            key === active
                                                ? screenshot!.alt
                                                : ''
                                        }
                                        aria-hidden={key !== active}
                                        className={`absolute inset-0 h-full w-full object-cover object-top-left transition-opacity duration-500 motion-reduce:transition-none ${
                                            key === active
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        }`}
                                    />
                                ))}
                        </div>
                        <figcaption className="border-t px-4 py-3 text-xs text-muted-foreground">
                            Vista de {current.label.toLowerCase()} en el sistema
                        </figcaption>
                    </figure>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-5 rounded-xl border border-dashed bg-card p-10 text-center">
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Building2 className="size-7" />
                        </span>
                        <div className="space-y-2">
                            <p className="text-lg font-semibold">
                                ¿Tu empresa quiere recibir practicantes?
                            </p>
                            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                                Regístrala en minutos. El módulo para empresas
                                está en desarrollo y pronto podrás gestionar tus
                                practicantes desde aquí.
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/registro-empresa">
                                <Building2 className="h-4 w-4" />
                                Registrar empresa
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </Tabs>
    );
}

export default function Landing() {
    const { auth } = usePage().props;

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

                        <div className="hidden sm:block">
                            <AccessButton isAuthenticated={!!auth.user} />
                        </div>

                        <MobileMenu isAuthenticated={!!auth.user} />
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                {/* Foto del campus de fondo en todos los tamaños. En celular se usa
                    una toma vertical y la tarjeta queda centrada sobre la foto; en
                    escritorio la tarjeta va a la derecha. */}
                <section className="relative isolate border-b bg-muted/20">
                    <picture>
                        <source
                            media="(max-width: 639px)"
                            srcSet="/images/home/campus-unjfsc-mobile-480.webp 480w, /images/home/campus-unjfsc-mobile-800.webp 800w"
                            sizes="100vw"
                            width={800}
                            height={1000}
                        />
                        <img
                            src="/images/home/campus-unjfsc-1280.webp"
                            srcSet="/images/home/campus-unjfsc-768.webp 768w, /images/home/campus-unjfsc-1280.webp 1280w, /images/home/campus-unjfsc-1920.webp 1920w"
                            sizes="100vw"
                            width={1920}
                            height={1253}
                            fetchPriority="high"
                            decoding="async"
                            alt="Campus de la UNJFSC con el busto de José Faustino Sánchez Carrión rodeado de jardines"
                            className="absolute inset-0 -z-10 h-full w-full object-cover object-[center_38%] sm:object-[42%_center]"
                        />
                    </picture>
                    {/* Velo suave para integrar la tarjeta; en escritorio es un
                        degradado hacia la derecha para no oscurecer el busto. */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 bg-lochmara-950/30 lg:bg-transparent lg:bg-gradient-to-l lg:from-lochmara-950/55 lg:via-lochmara-950/10 lg:to-transparent"
                    />

                    <div className="relative page-container flex min-h-[calc(100svh-4rem)] items-center justify-center py-10 sm:py-14 lg:min-h-[640px] lg:justify-end lg:py-20 xl:min-h-[700px]">
                        <div className="w-full max-w-xl animate-in rounded-2xl border bg-card/85 p-6 shadow-2xl backdrop-blur-md duration-700 fade-in slide-in-from-bottom-4 motion-reduce:animate-none sm:p-10 lg:bg-card/90">
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
                            <p className="mx-auto max-w-2xl text-muted-foreground">
                                Cada perfil tiene su propio espacio dentro del
                                sistema. Elige uno para ver qué puede hacer.
                            </p>
                        </div>

                        <PlatformStructure />
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
