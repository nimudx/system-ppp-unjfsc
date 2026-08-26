import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    ClipboardList,
    FileText,
    Mail,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Stepper } from '@/pages/academic/user/register/components/Stepper';

const steps = [
    { id: 1, label: 'Formulario' },
    { id: 2, label: 'Resumen' },
];

const benefits = [
    {
        icon: Users,
        title: 'Acceso a talento universitario',
        text: 'Recibe postulaciones de estudiantes de todas las facultades de la UNJFSC.',
    },
    {
        icon: ClipboardList,
        title: 'Gestión centralizada',
        text: 'Administra convenios, tutores y practicantes desde un solo panel.',
    },
    {
        icon: ShieldCheck,
        title: 'Seguimiento respaldado',
        text: 'La universidad valida y acompaña todo el proceso de la práctica.',
    },
    {
        icon: Mail,
        title: 'Comunicación directa',
        text: 'Coordina evaluaciones y documentación sin trámites presenciales.',
    },
];

const requirements = [
    'RUC y razón social vigentes de la empresa',
    'Dirección y datos de contacto institucional',
    'Nombre y cargo de la persona que administrará la cuenta',
    'Correo electrónico donde recibirás las credenciales de acceso',
];

const process = [
    {
        title: 'Completa el formulario',
        text: 'Ingresa los datos de tu empresa y de la persona encargada de la cuenta.',
    },
    {
        title: 'Revisión de la universidad',
        text: 'Un administrador del sistema valida la información registrada.',
    },
    {
        title: 'Recibes tus credenciales',
        text: 'Te llegan por correo al del encargado registrado para acceder al sistema.',
    },
    {
        title: 'Publica y gestiona plazas',
        text: 'Empieza a recibir y evaluar postulantes para prácticas pre profesionales.',
    },
];

const summaryRows = [
    'Nombre comercial',
    'RUC',
    'Razón social',
    'Dirección',
    'Teléfono',
    'Encargado de la cuenta',
    'Correo de contacto',
];

export default function CompanyRegister() {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Head title="Registrar empresa" />

            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-3">
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
                    </Link>
                    <Button variant="outline" asChild>
                        <Link href="/login">¿Ya tienes cuenta? Inicia sesión</Link>
                    </Button>
                </div>
            </header>

            <main className="flex-1">
                <section className="border-b bg-muted/20 py-16">
                    <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center">
                        <div className="w-fit rounded-lg bg-primary/10 p-3 text-primary">
                            <Building2 className="h-8 w-8" />
                        </div>
                        <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            Registra tu empresa como entidad receptora de prácticas
                        </h1>
                        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                            Ofrece plazas de prácticas pre profesionales a los estudiantes de la UNJFSC y gestiona
                            todo el proceso desde un solo lugar.
                        </p>
                    </div>
                </section>

                <section className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-[minmax(0,1fr)_420px]">
                    {/* Columna informativa */}
                    <div className="order-2 space-y-6 lg:order-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    ¿Por qué registrar tu empresa?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                {benefits.map((b) => (
                                    <div
                                        key={b.title}
                                        className="flex gap-3 rounded-lg border bg-card p-4"
                                    >
                                        <div className="h-fit rounded-md bg-primary/10 p-2 text-primary">
                                            <b.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{b.title}</p>
                                            <p className="text-xs text-muted-foreground">{b.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    ¿Qué necesitas para registrarte?
                                </CardTitle>
                                <CardDescription>
                                    Ten a la mano esta información antes de completar el formulario.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {requirements.map((r) => (
                                    <div key={r} className="flex items-start gap-3 text-sm">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <span>{r}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {process.map((p, i) => (
                                    <div key={p.title} className="flex gap-3">
                                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{p.title}</p>
                                            <p className="text-xs text-muted-foreground">{p.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna del formulario */}
                    <div className="order-1 space-y-6 lg:order-2">
                        {!submitted && (
                            <div className="rounded-xl border bg-card p-4 shadow-xs">
                                <Stepper currentStep={step} steps={steps} />
                            </div>
                        )}

                        {submitted ? (
                            <Card className="animate-in fade-in text-center">
                                <CardContent className="flex flex-col items-center gap-4 py-12">
                                    <div className="rounded-full bg-primary/10 p-4">
                                        <CheckCircle2 className="h-10 w-10 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-semibold">Solicitud enviada</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Un administrador revisará la información y activará el acceso de tu
                                            empresa. Las credenciales llegarán al correo del encargado registrado.
                                        </p>
                                    </div>
                                    <Button asChild>
                                        <Link href="/">Volver al inicio</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : step === 1 ? (
                            <Card className="animate-in fade-in">
                                <CardHeader>
                                    <CardTitle>Datos de la empresa</CardTitle>
                                    <CardDescription>
                                        Información legal y de contacto de la entidad receptora.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre comercial</Label>
                                        <Input id="name" placeholder="Ej. Grupo Constructor SAC" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ruc">RUC</Label>
                                        <Input id="ruc" placeholder="20123456789" maxLength={11} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="razon">Razón social</Label>
                                        <Input id="razon" placeholder="Razón social registrada en SUNAT" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Dirección</Label>
                                        <Input id="address" placeholder="Av. Ejemplo 123, Huacho" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input id="phone" placeholder="01 234 5678" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Sitio web (opcional)</Label>
                                        <Input id="website" placeholder="https://miempresa.com" />
                                    </div>

                                    <Separator />

                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold">Encargado de la cuenta</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Esta persona recibirá las credenciales de acceso y gestionará las
                                            postulaciones de tu empresa dentro del sistema.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_name">Nombre completo</Label>
                                        <Input id="contact_name" placeholder="Nombre del encargado" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_position">Cargo</Label>
                                        <Input id="contact_position" placeholder="Jefe de Recursos Humanos" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_email">Correo electrónico</Label>
                                        <Input
                                            id="contact_email"
                                            type="email"
                                            placeholder="contacto@miempresa.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_phone">Teléfono directo</Label>
                                        <Input id="contact_phone" placeholder="987 654 321" />
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-end">
                                    <Button onClick={() => setStep(2)}>Continuar</Button>
                                </CardFooter>
                            </Card>
                        ) : (
                            <Card className="animate-in fade-in">
                                <CardHeader>
                                    <CardTitle>Resumen de la solicitud</CardTitle>
                                    <CardDescription>
                                        Verifica que los datos sean correctos antes de enviar.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                                        {summaryRows.map((label) => (
                                            <div
                                                key={label}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <span className="text-muted-foreground">{label}</span>
                                                <span className="font-medium">—</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        * Vista de diseño: aquí se mostrarán los datos ingresados en el paso
                                        anterior.
                                    </p>
                                </CardContent>
                                <CardFooter className="justify-between">
                                    <Button variant="outline" onClick={() => setStep(1)}>
                                        Editar
                                    </Button>
                                    <Button onClick={() => setSubmitted(true)}>
                                        Confirmar y enviar solicitud
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        <p className="text-center text-xs text-muted-foreground">
                            <FileText className="mr-1 inline h-3 w-3" />
                            Tu solicitud será revisada por un administrador antes de activar el acceso.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
