import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

import AppLogoIcon from '@/shared/components/app-logo-icon';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export default function LoginEmpresa() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Interfaz de demostración: todavía no valida contra el backend.
        setError('Usuario o contraseña inválidos.');
    };

    return (
        <>
            <Head title="Acceso para empresas | Bolsa Laboral UNJFSC" />

            <main className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 text-slate-900 lg:flex-row">
                {/* Panel institucional */}
                <section className="relative flex flex-col justify-between overflow-hidden bg-[#102747] px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:w-[48%] lg:px-16 lg:py-12">
                    <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full border border-white/10" />
                    <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full border border-white/10" />
                    <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />

                    <Link
                        href="/"
                        className="relative z-10 inline-flex w-fit items-center gap-3 rounded-lg"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                            <AppLogoIcon className="size-9 fill-current" />
                        </div>

                        <div>
                            <p className="text-sm font-bold tracking-wide">
                                BOLSA LABORAL
                            </p>
                            <p className="text-xs tracking-[0.2em] text-blue-200">
                                UNJFSC
                            </p>
                        </div>
                    </Link>

                    <div className="relative z-10 mx-auto my-12 max-w-xl lg:my-0">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-blue-100">
                            <BriefcaseBusiness className="size-4 text-amber-300" />
                            Portal de oportunidades profesionales
                        </div>

                        <h1 className="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl xl:text-6xl">
                            Encuentra el talento que tu empresa necesita.
                        </h1>

                        <p className="mt-6 max-w-lg text-base leading-7 text-blue-100/80 sm:text-lg">
                            Conecta con estudiantes y egresados de la
                            Universidad Nacional José Faustino Sánchez Carrión y
                            publica oportunidades para impulsar su futuro
                            profesional.
                        </p>

                        <div className="mt-10 space-y-5">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: 'Entorno institucional',
                                    description:
                                        'Un espacio para conectar empresas con talento universitario.',
                                },
                                {
                                    icon: Building2,
                                    title: 'Gestión de vacantes',
                                    description:
                                        'Organiza tus oportunidades laborales desde un solo lugar.',
                                },
                                {
                                    icon: BriefcaseBusiness,
                                    title: 'Talento universitario',
                                    description:
                                        'Acércate a futuros profesionales de distintas especialidades.',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="flex items-start gap-4"
                                >
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-amber-300">
                                        <item.icon className="size-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            {item.title}
                                        </h2>
                                        <p className="mt-1 text-sm leading-6 text-blue-100/70">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="relative z-10 text-xs text-blue-100/60">
                        Universidad Nacional José Faustino Sánchez Carrión
                        <span className="mx-2">·</span>
                        Huacho, Perú
                    </p>
                </section>

                {/* Formulario de acceso */}
                <section className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">
                        <Link
                            href="/"
                            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#102747]"
                        >
                            <ArrowLeft className="size-4" />
                            Volver al portal principal
                        </Link>

                        <div className="mb-8">
                            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-[#102747]">
                                <Building2 className="size-7" />
                            </div>

                            <p className="mb-2 text-sm font-semibold tracking-wide text-blue-800">
                                PORTAL PARA EMPRESAS
                            </p>

                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Bienvenido de nuevo
                            </h2>

                            <p className="mt-3 leading-6 text-slate-500">
                                Ingresa tus credenciales para acceder a tu
                                cuenta empresarial.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Correo electrónico
                                </Label>

                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />

                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="username"
                                        placeholder="empresa@correo.com"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                            setError('');
                                        }}
                                        className="h-12 border-slate-200 bg-white pl-10 focus-visible:ring-blue-800"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label htmlFor="password">Contraseña</Label>

                                    <button
                                        type="button"
                                        className="text-xs font-semibold text-blue-800 transition-colors hover:text-blue-950"
                                        onClick={() =>
                                            setError(
                                                'Contacta con el administrador de la Bolsa Laboral para recuperar tu acceso.',
                                            )
                                        }
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>

                                <div className="relative">
                                    <LockKeyhole className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />

                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        autoComplete="current-password"
                                        placeholder="Ingresa tu contraseña"
                                        value={password}
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            setError('');
                                        }}
                                        className="h-12 border-slate-200 bg-white pr-11 pl-10 focus-visible:ring-blue-800"
                                        required
                                    />

                                    <button
                                        type="button"
                                        aria-label={
                                            showPassword
                                                ? 'Ocultar contraseña'
                                                : 'Mostrar contraseña'
                                        }
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    aria-live="polite"
                                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="h-12 w-full bg-[#102747] font-semibold text-white hover:bg-[#183b68]"
                            >
                                Iniciar sesión
                            </Button>
                        </form>

                        <div className="my-7 flex items-center gap-4">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-xs text-slate-400">
                                ACCESO EMPRESARIAL
                            </span>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                                    <Building2 className="size-5" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold">
                                        ¿Tu empresa aún no tiene una cuenta?
                                    </h3>

                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        Registra los datos de tu organización
                                        para solicitar acceso a la Bolsa
                                        Laboral.
                                    </p>

                                    <Link
                                        href="/registro-empresa"
                                        className="mt-3 inline-flex text-sm font-semibold text-blue-800 hover:text-blue-950"
                                    >
                                        Registrar empresa
                                        <span
                                            className="ml-1"
                                            aria-hidden="true"
                                        >
                                            →
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-xs leading-5 text-slate-400">
                            © {new Date().getFullYear()} UNJFSC. Bolsa Laboral.
                            <br />
                            Plataforma institucional de oportunidades
                            profesionales.
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
