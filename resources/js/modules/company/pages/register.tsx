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
                            Inicia sesión con tu cuenta de estudiante y abre
                            Pasantía para solicitar la incorporación de tu
                            empresa.
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
                                    Después de iniciar sesión, abre Pasantía.
                                    Consulta el RUC, envía la solicitud y revisa
                                    su estado. La consulta utiliza el catálogo
                                    local; la comprobación de una empresa nueva
                                    corresponde al docente titular.
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
                                        ya existen en el sistema. Las empresas
                                        nuevas requieren una solicitud de
                                        incorporación.
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
                                El registro de empresa se realiza desde
                                Pasantía, después de iniciar sesión como
                                estudiante.
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
