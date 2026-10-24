import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    CircleAlert,
    ClipboardCheck,
    FileSearch,
} from 'lucide-react';
import AppLogoIcon from '@/shared/components/app-logo-icon';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';

export default function CompanyRegister() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Head title="Registro de empresa" />

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
                        <Link href="/login">Iniciar sesión</Link>
                    </Button>
                </div>
            </header>

            <main className="flex flex-1 items-center justify-center px-4 py-12">
                <Card className="w-full max-w-3xl">
                    <CardHeader className="items-center text-center">
                        <div className="rounded-xl bg-primary/10 p-3 text-primary">
                            <Building2 className="size-8" />
                        </div>
                        <CardTitle className="text-2xl">
                            Incorporación de empresas
                        </CardTitle>
                        <CardDescription className="max-w-xl">
                            La solicitud de incorporación es independiente de la
                            formalización de prácticas. Inicia sesión con tu
                            cuenta de estudiante para abrirla desde el menú.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div
                            role="status"
                            className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                        >
                            <CircleAlert className="mt-0.5 size-5 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">
                                    Acceso al flujo de estudiante
                                </p>
                                <p className="text-sm">
                                    Después de iniciar sesión, abre Dashboard →
                                    Registrar empresa. La consulta de RUC usa el
                                    registro local de empresas; no consulta
                                    SUNAT. La API independiente para enviar y
                                    dar seguimiento a una solicitud aún está
                                    pendiente en el backend.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex items-start gap-3 rounded-lg border p-4">
                                <FileSearch className="mt-0.5 size-4 shrink-0 text-primary" />
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p className="font-medium text-foreground">
                                        Consulta de RUC
                                    </p>
                                    <p>
                                        Se consultan los datos de empresas que
                                        ya existen en el sistema. Para nuevas
                                        empresas, la solicitud aún no se
                                        persiste.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border p-4">
                                <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p className="font-medium text-foreground">
                                        Validación académica
                                    </p>
                                    <p>
                                        La revisión de incorporación por parte
                                        del docente debe usar un estado separado
                                        de la aprobación de prácticas.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">
                                No se envían solicitudes desde esta página
                                pública.
                            </p>
                            <p className="mt-1">
                                El formulario de estudiante está separado del
                                registro de prácticas y disponible después de
                                iniciar sesión.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <Button asChild>
                                <Link href="/login">
                                    Iniciar sesión para continuar
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
