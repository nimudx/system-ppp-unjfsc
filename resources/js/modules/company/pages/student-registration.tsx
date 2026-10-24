import { Head } from '@inertiajs/react';
import {
    Building2,
    Check,
    CircleAlert,
    FileUp,
    Search,
    Send,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { verifyCompanyByRuc } from '@/modules/company/services/company-workflow';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import AppLayout from '@/shared/layouts/app-layout';

type Company = {
    id: number;
    ruc: string;
    name: string;
    address: string;
    phone: string;
    email: string;
};

type RequestStatus = 'pendiente' | 'observado' | 'aprobado' | 'rechazado';

const statusLabels: Record<RequestStatus, string> = {
    pendiente: 'Pendiente',
    observado: 'Observado',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
};

const demoCompany: Company = {
    id: 1,
    ruc: '20345678901',
    name: 'Empresa Demo S.A.C.',
    address: 'Jr. Los Olivos 123, Lima',
    phone: '987654321',
    email: 'empresa.demo@unjfsc.edu.pe',
};

export default function StudentCompanyRegistration({
    standalonePreview = false,
}: {
    standalonePreview?: boolean;
}) {
    const [ruc, setRuc] = useState('');
    const [company, setCompany] = useState<Company | null>(null);
    const [companyExists, setCompanyExists] = useState<boolean | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState(standalonePreview);
    const [previewStatus, setPreviewStatus] =
        useState<RequestStatus>('pendiente');
    const [previewStudentAccepted, setPreviewStudentAccepted] = useState(false);
    const [declarationAccepted, setDeclarationAccepted] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [rucFile, setRucFile] = useState<File | null>(null);

    const lookupCompany = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        const normalizedRuc = ruc.trim();

        if (!/^\d{11}$/.test(normalizedRuc)) {
            setError('Ingresa un RUC válido de 11 dígitos.');
            return;
        }

        if (preview) {
            const isDemoCompany = normalizedRuc === demoCompany.ruc;
            setCompanyExists(isDemoCompany);
            setCompany(isDemoCompany ? demoCompany : null);
            return;
        }

        setIsSearching(true);
        setCompany(null);
        setCompanyExists(null);
        try {
            const result = await verifyCompanyByRuc(normalizedRuc);

            setCompanyExists(Boolean(result.found));
            if (result.found && result.company) {
                setCompany({
                    id: result.company.id,
                    ruc: result.company.ruc,
                    name: result.company.name,
                    address: result.company.address ?? '',
                    phone: result.company.phone ?? '',
                    email: result.company.email ?? '',
                });
            }
        } catch (lookupError) {
            setError(
                lookupError instanceof Error
                    ? lookupError.message
                    : 'No se pudo consultar el RUC.',
            );
        } finally {
            setIsSearching(false);
        }
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        {
            title: 'Registrar empresa',
            href: '/estudiante/registro-empresa',
        },
    ];

    const content = (
        <>
            <Head title="Registrar empresa" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Registrar empresa
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Solicita la incorporación de una empresa de forma
                            independiente a la formalización de tu pasantía.
                        </p>
                    </div>
                    {import.meta.env.DEV && (
                        <Button
                            type="button"
                            variant={preview ? 'default' : 'outline'}
                            onClick={() => {
                                setPreview((value) => !value);
                                setCompany(null);
                                setCompanyExists(null);
                                setError(null);
                            }}
                        >
                            {preview ? 'Salir de vista previa' : 'Vista previa'}
                        </Button>
                    )}
                </div>

                {preview && (
                    <Alert>
                        <CircleAlert className="size-4" />
                        <AlertTitle>Vista previa de desarrollo</AlertTitle>
                        <AlertDescription>
                            Los datos mostrados son ilustrativos y no se
                            guardan, no se envían al docente y no representan
                            una respuesta real del backend.
                        </AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Search className="size-4" />
                            1. Consulta de empresa
                        </CardTitle>
                        <CardDescription>
                            Se consulta únicamente el registro local de
                            empresas; no se realizan consultas externas a SUNAT.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={lookupCompany}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="company-ruc">RUC</Label>
                                <Input
                                    id="company-ruc"
                                    value={ruc}
                                    onChange={(event) =>
                                        setRuc(
                                            event.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 11),
                                        )
                                    }
                                    placeholder="11 dígitos"
                                    inputMode="numeric"
                                    maxLength={11}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSearching}
                                className="sm:mt-7"
                            >
                                <Search className="size-4" />
                                {isSearching ? 'Consultando…' : 'Consultar RUC'}
                            </Button>
                        </form>
                        {error && (
                            <p
                                role="alert"
                                className="mt-3 text-sm text-destructive"
                            >
                                {error}
                            </p>
                        )}
                        {companyExists === true && company && (
                            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <Check className="size-4 text-emerald-600" />
                                    <p className="font-medium">
                                        Empresa encontrada. Confirma que los
                                        datos correspondan.
                                    </p>
                                    {preview && (
                                        <Badge variant="outline">Demo</Badge>
                                    )}
                                </div>
                                <CompanyFields company={company} readOnly />
                                <div className="mt-4 space-y-3">
                                    <Label htmlFor="existing-confirm">
                                        Correo de contacto para la confirmación
                                    </Label>
                                    <Input
                                        id="existing-confirm"
                                        type="email"
                                        placeholder="Tu correo electrónico"
                                    />
                                    <Button type="button" disabled>
                                        <Send className="size-4" />
                                        Enviar confirmación a la empresa
                                    </Button>
                                    {!preview && (
                                        <p className="text-sm text-muted-foreground">
                                            El backend aún no tiene un endpoint
                                            verificado para enviar esta
                                            confirmación. El botón se habilitará
                                            al integrar ese contrato.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {companyExists === false && (
                            <div className="mt-4 rounded-lg border bg-muted/20 p-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <Building2 className="size-4 text-primary" />
                                    <p className="font-medium">
                                        No existe en el registro local. Completa
                                        la solicitud para una empresa nueva.
                                    </p>
                                    {preview && (
                                        <Badge variant="outline">Demo</Badge>
                                    )}
                                </div>
                                <CompanyFields
                                    company={{
                                        id: 0,
                                        ruc: ruc.trim(),
                                        name: '',
                                        address: '',
                                        phone: '',
                                        email: '',
                                    }}
                                    readOnly={false}
                                />
                                <div className="mt-4 grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="legal-name">
                                            Razón social
                                        </Label>
                                        <Input
                                            id="legal-name"
                                            placeholder="Razón social registrada"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ruc-sheet">
                                            Ficha RUC (opcional, PDF)
                                        </Label>
                                        <Input
                                            id="ruc-sheet"
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            onChange={(event) =>
                                                setRucFile(
                                                    event.target.files?.[0] ??
                                                        null,
                                                )
                                            }
                                        />
                                        {rucFile && (
                                            <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <FileUp className="size-3" />
                                                {rucFile.name} (solo
                                                seleccionado; aún no se ha
                                                subido)
                                            </p>
                                        )}
                                    </div>
                                    <label className="flex items-start gap-3 text-sm">
                                        <Checkbox
                                            checked={declarationAccepted}
                                            onCheckedChange={(checked) =>
                                                setDeclarationAccepted(
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <span>
                                            Declaro que la información
                                            proporcionada es correcta y autorizo
                                            su revisión.
                                        </span>
                                    </label>
                                    <label className="flex items-start gap-3 text-sm">
                                        <Checkbox
                                            checked={termsAccepted}
                                            onCheckedChange={(checked) =>
                                                setTermsAccepted(
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <span>
                                            Acepto los términos del proceso de
                                            registro.
                                        </span>
                                    </label>
                                    <Button type="button" disabled>
                                        <Send className="size-4" />
                                        Enviar solicitud al docente titular
                                    </Button>
                                    {!preview && (
                                        <p className="text-sm text-muted-foreground">
                                            No hay un endpoint verificado para
                                            crear una solicitud de
                                            incorporación. El endpoint existente
                                            registra empresas directamente y no
                                            representa este flujo.
                                        </p>
                                    )}
                                    {preview &&
                                        (!declarationAccepted ||
                                            !termsAccepted) && (
                                            <p className="text-sm text-muted-foreground">
                                                Acepta la declaración y los
                                                términos para revisar
                                                visualmente el botón de envío.
                                            </p>
                                        )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            3. Jefe inmediato y datos de práctica
                        </CardTitle>
                        <CardDescription>
                            Esta sección se habilita solo después de que la
                            empresa acepte al estudiante. La aprobación de la
                            empresa por parte del docente no equivale a esa
                            aceptación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {preview && (
                            <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
                                <Checkbox
                                    checked={previewStudentAccepted}
                                    onCheckedChange={(checked) =>
                                        setPreviewStudentAccepted(
                                            checked === true,
                                        )
                                    }
                                />
                                <span>
                                    Vista previa: mostrar como si la empresa
                                    hubiera aceptado al estudiante (no se
                                    guarda).
                                </span>
                            </label>
                        )}
                        {!previewStudentAccepted && (
                            <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                                El formulario permanecerá bloqueado hasta que la
                                empresa acepte al estudiante. El backend aún no
                                proporciona ese estado.
                            </p>
                        )}
                        <fieldset
                            disabled={!previewStudentAccepted}
                            className="grid gap-4 disabled:opacity-60 sm:grid-cols-2"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="boss-name">
                                    Jefe inmediato
                                </Label>
                                <Input
                                    id="boss-name"
                                    placeholder="Nombre completo"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="boss-position">
                                    Cargo o posición
                                </Label>
                                <Input id="boss-position" placeholder="Cargo" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="boss-email">
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="boss-email"
                                    type="email"
                                    placeholder="jefe@empresa.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="boss-phone">Teléfono</Label>
                                <Input
                                    id="boss-phone"
                                    type="tel"
                                    placeholder="Teléfono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="practice-area">
                                    Área de desempeño
                                </Label>
                                <Input id="practice-area" placeholder="Área" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="practice-position">
                                    Cargo a ocupar
                                </Label>
                                <Input
                                    id="practice-position"
                                    placeholder="Cargo"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="practice-start">
                                    Fecha de inicio
                                </Label>
                                <Input id="practice-start" type="date" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="practice-end">
                                    Fecha de término
                                </Label>
                                <Input id="practice-end" type="date" />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="practice-description">
                                    Descripción de funciones
                                </Label>
                                <Textarea id="practice-description" />
                            </div>
                            <label className="flex items-start gap-3 text-sm sm:col-span-2">
                                <Checkbox />
                                <span>
                                    Declaro que los datos de práctica son
                                    correctos.
                                </span>
                            </label>
                            <Button
                                type="button"
                                disabled
                                className="sm:col-span-2"
                            >
                                Guardar datos de práctica
                            </Button>
                        </fieldset>
                        <p className="text-sm text-muted-foreground">
                            El endpoint para actualizar los datos de práctica
                            después de la aceptación empresarial no está
                            disponible. El formulario no envía ni guarda
                            información.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            4. Documentos de prácticas
                        </CardTitle>
                        <CardDescription>
                            La carga se habilita cuando la empresa acepta al
                            estudiante y se registra la formalización requerida.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                ['fut', 'FUT'],
                                ['carta-presentacion', 'Carta de Presentación'],
                                ['carta-aceptacion', 'Carta de Aceptación'],
                                ['plan-practicas', 'Plan de Prácticas'],
                                ['informe-practicas', 'Informe de Prácticas'],
                            ].map(([id, title]) => (
                                <div key={id} className="space-y-2">
                                    <Label htmlFor={`document-${id}`}>
                                        {title}
                                    </Label>
                                    <Input
                                        id={`document-${id}`}
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        disabled={!previewStudentAccepted}
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            El backend solo ofrece carga PDF para documentos de
                            una formalización existente (FUT, carta de
                            presentación y carta de aceptación). No hay listado,
                            descarga ni contrato para Plan/Informe en este flujo
                            independiente. Esta pantalla no simula subidas.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            2. Seguimiento de solicitud
                        </CardTitle>
                        <CardDescription>
                            La solicitud y sus observaciones aparecerán aquí
                            cuando el backend provea el servicio de seguimiento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {preview ? (
                            <>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Label htmlFor="preview-status">
                                        Estado de demostración
                                    </Label>
                                    <select
                                        id="preview-status"
                                        className="h-9 rounded-md border bg-background px-3 text-sm"
                                        value={previewStatus}
                                        onChange={(event) =>
                                            setPreviewStatus(
                                                event.target
                                                    .value as RequestStatus,
                                            )
                                        }
                                    >
                                        {Object.entries(statusLabels).map(
                                            ([value, label]) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <Badge variant="outline">
                                        No persistido
                                    </Badge>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <p className="font-medium">
                                        {statusLabels[previewStatus]}
                                    </p>
                                    {previewStatus === 'observado' && (
                                        <Textarea
                                            className="mt-3"
                                            readOnly
                                            value="Vista ilustrativa: aquí aparecerá el motivo de observación enviado por el docente."
                                        />
                                    )}
                                    {previewStatus === 'rechazado' && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Vista ilustrativa: esta solicitud no
                                            puede continuar como aprobada.
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Aún no hay un endpoint para listar solicitudes,
                                estados u observaciones. Esta pantalla no
                                inventa una respuesta ni registra datos
                                localmente.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );

    return standalonePreview ? (
        <main className="min-h-screen bg-background">{content}</main>
    ) : (
        <AppLayout breadcrumbs={breadcrumbs}>{content}</AppLayout>
    );
}

function CompanyFields({
    company,
    readOnly,
}: {
    company: Company;
    readOnly: boolean;
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
                <Label>Nombre comercial</Label>
                <Input
                    defaultValue={company.name}
                    readOnly={readOnly}
                    placeholder="Nombre comercial"
                />
            </div>
            <div className="space-y-2">
                <Label>RUC</Label>
                <Input defaultValue={company.ruc} readOnly={readOnly} />
            </div>
            <div className="space-y-2">
                <Label>Dirección</Label>
                <Input
                    defaultValue={company.address}
                    readOnly={readOnly}
                    placeholder="Dirección fiscal"
                />
            </div>
            <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                    defaultValue={company.phone}
                    readOnly={readOnly}
                    placeholder="Teléfono corporativo"
                />
            </div>
            <div className="space-y-2 sm:col-span-2">
                <Label>Correo corporativo</Label>
                <Input
                    defaultValue={company.email}
                    readOnly={readOnly}
                    placeholder="contacto@empresa.com"
                />
            </div>
        </div>
    );
}
