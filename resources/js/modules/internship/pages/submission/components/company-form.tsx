import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "@inertiajs/react";
import { Save, Building2, User, Calendar, Briefcase, Info, ChevronDown, Search, Plus, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import internship from "@/routes/academic/internship";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { stepDetailsSchema } from "../schemas/detail.schema";

type CompanyArea = { id: number; name: string };

interface CompanyFormProps {
    placement: any | null;
    type: string;
    origin: string;
}

export default function CompanyForm({ placement, type, origin }: CompanyFormProps) {
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [companyFound, setCompanyFound] = useState<boolean | null>(placement?.company?.id ? true : null);
    const [companyAreas, setCompanyAreas] = useState<CompanyArea[]>([]);
    const [rucInput, setRucInput] = useState('');
    const [areaMode, setAreaMode] = useState<'select' | 'new'>('select');
    const [prevAreaSnapshot, setPrevAreaSnapshot] = useState<{ area_id: number | null; area_name: string } | null>(null);

    const form = useForm({
        resolver: zodResolver(stepDetailsSchema),
        defaultValues: {
            company: placement?.company || {
                ruc: '',
                name: '',
                address: '',
                phone: '',
                email: ''
            },
            placement: placement || {
                boss_name: '',
                boss_position: '',
                boss_phone: '',
                boss_email: '',
                area_id: null,
                area_name: '',
                position: '',
                description: '',
                start_date: '',
                end_date: ''
            }
        },
        mode: "onChange"
    });

    // Cargar áreas si ya hay empresa registrada (modo edición)
    useEffect(() => {
        if (placement?.company?.ruc) {
            fetch(internship.api.company.verify.url(placement.company.ruc))
                .then(r => r.json())
                .then(res => { if (res.found) setCompanyAreas(res.areas ?? []); })
                .catch(() => { });
        }
        
        // Sincronizar el formulario con los datos que vienen del servidor (Inertia reload)
        if (placement) {
            form.reset({
                company: placement.company,
                placement: placement
            });
            setCompanyFound(!!placement.company?.id);
        }
    }, [placement, form]);

    // Verificar RUC contra la API
    const handleVerifyRuc = async () => {
        const ruc = rucInput.trim();
        if (ruc.length !== 11) { toast.warning("El RUC debe tener exactamente 11 dígitos."); return; }
        setVerifying(true);
        try {
            const res = await fetch(internship.api.company.verify.url(ruc));
            if (!res.ok) throw new Error("Error en la respuesta del servidor");
            
            const json = await res.json();
            if (json.found) {
                form.setValue('company.id', json.company.id);
                form.setValue('company.ruc', ruc);
                form.setValue('company.name', json.company.name ?? '');
                form.setValue('company.address', json.company.address ?? '');
                form.setValue('company.phone', json.company.phone ?? '');
                form.setValue('company.email', json.company.email ?? '');
                setCompanyAreas(json.areas ?? []);
                setCompanyFound(true);
                setAreaMode('select');
                toast.success(`Empresa encontrada: ${json.company.name}`);
                setRucInput(''); // Limpiar solo en éxito
            } else {
                form.setValue('company.id', null);
                form.setValue('company.ruc', ruc);
                form.setValue('company.name', '');
                form.setValue('company.address', '');
                form.setValue('company.phone', '');
                form.setValue('company.email', '');
                setCompanyAreas([]);
                setCompanyFound(false);
                setAreaMode('new');
                toast.info("RUC no registrado. Complete los datos de la nueva empresa.");
                setRucInput(''); // Limpiar solo en éxito
            }
        } catch (error) { 
            console.error("RUC Verification Error:", error);
            toast.error("Error al verificar el RUC. Revise su conexión o intente nuevamente."); 
        }
        finally { setVerifying(false); }
    };

    const handleSelectArea = (area: CompanyArea) => {
        form.setValue('placement.area_id', area.id as any);
        form.setValue('placement.area_name', area.name as any);
    };

    const handleStartNewArea = () => {
        setPrevAreaSnapshot({
            area_id: form.getValues('placement.area_id') ?? null,
            area_name: form.getValues('placement.area_name') ?? '',
        });
        form.setValue('placement.area_id', null as any);
        form.setValue('placement.area_name', '' as any);
        setAreaMode('new');
    };

    const handleCancelNewArea = () => {
        if (prevAreaSnapshot) {
            form.setValue('placement.area_id', prevAreaSnapshot.area_id as any);
            form.setValue('placement.area_name', prevAreaSnapshot.area_name as any);
        }
        setAreaMode('select');
        setPrevAreaSnapshot(null);
    };

    const onSubmit = (data: any) => {
        const payload = {
            internship_type: type,
            origin_type: origin,
            company: data.company,
            placement: data.placement
        };

        if (placement?.id) {
            router.patch(internship.placements.update.url(placement.id), payload, {
                onBefore: () => setLoading(true),
                onFinish: () => setLoading(false),
                onError: (errors: any) => {
                    const firstError = Object.values(errors)[0] as string;
                    toast.error(firstError || 'Error al guardar la empresa');
                }
            });
        } else {
            router.post(internship.placements.store.url(), payload, {
                onBefore: () => setLoading(true),
                onFinish: () => setLoading(false),
                onError: (errors: any) => {
                    const firstError = Object.values(errors)[0] as string;
                    toast.error(firstError || 'Error al guardar la empresa');
                }
            });
        }
    };

    const labelStyle = "text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1 mb-1";
    const isCompanyLocked = !!placement;

    return (
        <TooltipProvider delayDuration={200}>
            <Form {...form}>
                <form id="form-company" onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col w-full animate-in fade-in zoom-in-95 duration-500 overflow-y-auto overflow-x-hidden">
                    <div className="flex-1 space-y-12 p-4 md:p-8 max-w-4xl mx-auto w-full">

                        {/* --- SECCIÓN 1: EMPRESA --- */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Building2 className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base uppercase tracking-tight text-foreground/90">Información de la Empresa</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 tracking-tight">Datos legales y contacto de la entidad receptora.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                <FormField
                                    control={form.control}
                                    name="company.ruc"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2 col-span-1 md:col-span-1">
                                            <div className="flex items-center gap-2 px-1">
                                                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0 flex items-center gap-1.5">
                                                    RUC de la empresa *
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="size-3.5 text-muted-foreground/50 hover:text-primary transition-colors cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="max-w-64 p-3 shadow-xl border-primary/10">
                                                            <p className="text-[11px] leading-relaxed">
                                                                <strong className="text-primary block mb-1 uppercase tracking-tighter">Importante</strong>
                                                                Una vez registrado y enviado a revisión, el RUC quedará bloqueado para garantizar la trazabilidad legal del convenio.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </FormLabel>
                                                {companyFound === true && (
                                                    <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border-green-200 h-4 px-1.5">Registrada</Badge>
                                                )}
                                                {companyFound === false && (
                                                    <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border-amber-200 h-4 px-1.5">Nueva</Badge>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    {/* RUC siempre readonly — sólo se edita via el dropdown */}
                                                    <div className="relative flex-1">
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                readOnly
                                                                placeholder="Verifique el RUC con el botón →"
                                                                className="h-11 pl-4 pr-10 font-mono tracking-wider bg-muted/40 cursor-not-allowed border-transparent"
                                                            />
                                                        </FormControl>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            <Building2 className={`size-4 transition-colors ${field.value ? 'text-primary' : 'text-muted-foreground/20'}`} />
                                                        </div>
                                                    </div>

                                                    {/* Dropdown de verificación */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="h-11 px-4 gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all"
                                                                disabled={isCompanyLocked}
                                                            >
                                                                <Search className="size-4 text-primary" />
                                                                <span className="hidden sm:inline text-xs font-bold uppercase tracking-tight">Verificar</span>
                                                                <ChevronDown className="size-3.5 text-muted-foreground/50" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[320px] p-5 shadow-2xl border-primary/10 space-y-4">
                                                            <div className="space-y-1">
                                                                <DropdownMenuLabel className="p-0 text-xs font-bold uppercase tracking-tight">Verificar Empresa por RUC</DropdownMenuLabel>
                                                                <p className="text-[11px] text-muted-foreground leading-snug">Si la empresa ya existe, sus datos se cargarán automáticamente. Si es nueva, podrá registrarla.</p>
                                                            </div>
                                                            <DropdownMenuSeparator className="bg-primary/5" />
                                                            <div className="space-y-3">
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">RUC (11 dígitos)</Label>
                                                                    <Input
                                                                        value={rucInput}
                                                                        onChange={e => setRucInput(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                                                        onKeyDown={e => {
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                                handleVerifyRuc();
                                                                            }
                                                                        }}
                                                                        placeholder="Ej. 20123456789"
                                                                        maxLength={11}
                                                                        className="h-9 text-xs font-mono"
                                                                    />
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    className="w-full h-10 gap-2 shadow-lg shadow-primary/10"
                                                                    onClick={handleVerifyRuc}
                                                                    disabled={verifying || rucInput.length !== 11}
                                                                >
                                                                    {verifying ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                                                                    <span className="text-xs font-bold uppercase">{verifying ? 'Verificando...' : 'Verificar y Cargar'}</span>
                                                                </Button>
                                                            </div>
                                                            <DropdownMenuSeparator className="bg-primary/5" />
                                                            <a
                                                                href="https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/FrameCriterioBusquedaWeb.jsp"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors font-medium"
                                                            >
                                                                <Search className="size-3" />
                                                                Consultar RUC directamente en Sunat
                                                            </a>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="company.name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className={labelStyle}>Nombre / Razón Social *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ej. Tech Solutions S.A.C." className="h-10 transition-all focus:ring-2 focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="company.address"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5 col-span-1 md:col-span-2">
                                            <FormLabel className={labelStyle}>Dirección Fiscal / Sede</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ej. Av. Larco 123, Miraflores" className="h-10 transition-all focus:ring-2 focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="company.phone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className={labelStyle}>Teléfono Corporativo</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="tel" placeholder="Ej. +51 999 999 999" className="h-10 transition-all focus:ring-2 focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="company.email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className={labelStyle}>Email corporativo</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="Ej. contacto@empresa.com" className="h-10 transition-all focus:ring-2 focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* --- SECCIÓN 2: JEFE DIRECTO --- */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600">
                                    <User className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base uppercase tracking-tight text-foreground/90">Responsable / Jefe Directo</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 tracking-tight">Persona que supervisará sus actividades presencialmente.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 px-1">
                                <FormField
                                    control={form.control}
                                    name="placement.boss_name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className={labelStyle}>Nombre Completo *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ej. Ing. Juan Pérez" className="h-10 transition-all focus:ring-2 focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="placement.boss_position"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className={labelStyle}>Cargo / Posición</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ej. Gerente de Tecnologías" className="h-10 transition-all focus:ring-2 focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="placement.boss_phone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5 text-xs">
                                            <FormLabel className={labelStyle}>Celular de Contacto</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="tel" placeholder="Ej. 999888777" className="h-10 transition-all focus:ring-2 focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="placement.boss_email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className={labelStyle}>Correo de Contacto</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="Ej. jefe@empresa.com" className="h-10 transition-all focus:ring-2 focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* --- SECCIÓN 3: DETALLES DEL PUESTO --- */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                                    <Briefcase className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base uppercase tracking-tight text-foreground/90">Área y Puesto del Practicante</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 tracking-tight">Especifique su ubicación funcional y rol en la empresa.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 px-1">
                                <FormField
                                    control={form.control}
                                    name="placement.area_name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <div className="flex items-center gap-2 px-1">
                                                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0 flex items-center gap-1.5">
                                                    {placement ? 'Área de Desempeño (Cambiar)' : 'Área de Desempeño'}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="size-3.5 text-muted-foreground/50 hover:text-indigo-600 transition-colors cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="max-w-64 p-3 shadow-xl">
                                                            <p className="text-[11px] leading-relaxed">
                                                                Seleccione un área existente de la empresa o cree una nueva. El nombre quedará registrado institucionalmente.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </FormLabel>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            readOnly
                                                            placeholder={companyFound === null ? 'Primero verifique el RUC' : '← Seleccione o cree un área'}
                                                            className="h-11 pl-4 pr-4 bg-muted/40 cursor-not-allowed border-transparent font-medium"
                                                        />
                                                    </FormControl>
                                                </div>
                                                {(!placement || placement.approval_status !== 1) && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="h-11 px-4 gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all whitespace-nowrap"
                                                                disabled={companyFound === null}
                                                            >
                                                                {placement
                                                                    ? <><Search className="size-4 text-primary" /><span className="hidden sm:inline text-xs font-bold uppercase tracking-tight">Cambiar</span></>
                                                                    : <><Plus className="size-4 text-primary" /><span className="hidden sm:inline text-xs font-bold uppercase tracking-tight">Añadir</span></>}
                                                                <ChevronDown className="size-3.5 text-muted-foreground/50" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[280px] shadow-2xl border-primary/5">
                                                            {areaMode === 'select' && (
                                                                <>
                                                                    {companyAreas.length > 0 ? (
                                                                        <>
                                                                            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold px-3 pt-3 pb-1">Áreas de la Empresa</DropdownMenuLabel>
                                                                            <DropdownMenuSeparator className="mx-2 mb-1 bg-primary/5" />
                                                                            <div className="p-1 space-y-0.5 max-h-48 overflow-y-auto">
                                                                                {companyAreas.map(area => (
                                                                                    <DropdownMenuItem
                                                                                        key={area.id}
                                                                                        onSelect={() => handleSelectArea(area)}
                                                                                        className="text-xs font-medium cursor-pointer focus:bg-primary/5 focus:text-primary px-3 py-2 rounded-md"
                                                                                    >
                                                                                        {area.name}
                                                                                    </DropdownMenuItem>
                                                                                ))}
                                                                            </div>
                                                                            <DropdownMenuSeparator className="mx-2 my-1 bg-primary/5" />
                                                                        </>
                                                                    ) : (
                                                                        <div className="px-4 py-3 text-center">
                                                                            <p className="text-[11px] text-muted-foreground">Sin áreas registradas para esta empresa.</p>
                                                                        </div>
                                                                    )}
                                                                    <div className="p-2">
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="w-full h-8 gap-1.5 border-dashed border-primary/30 text-primary hover:bg-primary/5"
                                                                            onClick={handleStartNewArea}
                                                                        >
                                                                            <Plus className="size-3.5" />
                                                                            <span className="text-[11px] font-bold uppercase tracking-tight">Registrar Nueva Área</span>
                                                                        </Button>
                                                                    </div>
                                                                </>
                                                            )}
                                                            {areaMode === 'new' && (
                                                                <div className="p-4 space-y-3">
                                                                    <div className="space-y-1">
                                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Nueva Área</p>
                                                                        <p className="text-[10px] text-muted-foreground leading-snug">Este nombre quedará vinculado a la empresa institucionalmente.</p>
                                                                    </div>
                                                                    <Input
                                                                        value={field.value ?? ''}
                                                                        onChange={field.onChange}
                                                                        placeholder="Ej. Departamento de TI"
                                                                        className="h-9 text-xs"
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            className="flex-1 h-8 gap-1.5 text-[11px] font-bold uppercase"
                                                                            onClick={() => setAreaMode('select')}
                                                                        >
                                                                            Confirmar
                                                                        </Button>
                                                                        {companyAreas.length > 0 && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 gap-1 text-[11px] font-bold uppercase border-muted-foreground/20"
                                                                                onClick={handleCancelNewArea}
                                                                            >
                                                                                <X className="size-3.5" />
                                                                                Cancelar
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="placement.position"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className={labelStyle}>Cargo a Ocupar</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ej. Practicante de Desarrollo" className="h-10 transition-all focus:ring-2 focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="placement.description"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5 col-span-1 md:col-span-2">
                                            <FormLabel className={labelStyle}>Descripción de Funciones</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={2} placeholder="Describa brevemente las tareas o proyectos que realizará..." className="transition-all focus:ring-2 focus:ring-primary/20 min-h-[80px]" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="placement.start_date"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className={labelStyle}>Fecha Estimada de Inicio</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input {...field} type="date" className="h-10 px-10 transition-all focus:ring-2 focus:ring-primary/20" />
                                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="placement.end_date"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className={labelStyle}>Fecha Estimada de Término</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input {...field} type="date" className="h-10 px-10 transition-all focus:ring-2 focus:ring-primary/20" />
                                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Declaración Jurada Simple */}
                        {!placement && (
                            <div className="pt-6 border-t">
                                <div className="bg-muted/30 p-4 rounded-xl flex items-start gap-4 border">
                                    <Checkbox id="terms" className="mt-1" />
                                    <div className="space-y-1">
                                        <Label htmlFor="terms" className="text-sm font-bold cursor-pointer">Declarar veracidad de la información</Label>
                                        <p className="text-[11px] text-muted-foreground">Confirmo que los datos proporcionados son reales y corresponden a mi situación laboral actual para este proceso de prácticas.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Boton de guardado global en la parte inferior */}
                    <div className="p-4 md:px-8 border-t bg-card sticky bottom-0 z-10 flex justify-end">
                        <Button
                            type="submit"
                            size="sm"
                            className="h-9 gap-2 shadow-sm uppercase font-bold text-xs"
                            disabled={loading || (placement && placement.approval_status === 1)}
                        >
                            {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            {loading ? "Guardando..." : placement ? "Guardar Cambios" : "Registrar Empresa"}
                        </Button>
                    </div>
                </form>
            </Form>
        </TooltipProvider>
    );
}