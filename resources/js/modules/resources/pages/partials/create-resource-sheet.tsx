import { useForm, usePage } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import resource from "@/routes/resource";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import type { LocationValue } from "./location-selector";
import { LocationSelector } from "./location-selector";

export function CreateResourceSheet({
    open,
    onOpenChange,
    documentTypes = [],
    roles = [],
    faculties = [],
    initialFilters = null,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documentTypes?: any[];
    roles?: any[];
    faculties?: any[];
    initialFilters?: any;
}) {
    const { role } = usePage().props as any;
    const isAdmin = role === 1;
    const isTeacher = role === 3;
    const isSubAdmin = role === 2;

    // ─── Formulario con Inertia ──────────────────────────────────────
    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        description: "",
        role_id: "" as string | null, // null significa "Todos/Público"
        level: (isTeacher ? 4 : 1) as number,
        document_type_id: "",
        location_id: (isTeacher ? initialFilters?.section_id?.toString() : null) as string | null,
        file: null as File | null,
        semester_id: (usePage().props as any).currentSemester?.id || null,
    });

    // Estados adicionales para el UI
    const [selectedRoleType, setSelectedRoleType] = useState<"all" | "specific" | "">("");

    // Estados internos para el Selector de Ubicación
    const [selectedFacultyId, setSelectedFacultyId] = useState<string>(isTeacher ? initialFilters?.faculty_id?.toString() : "");
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>(isTeacher ? initialFilters?.school_id?.toString() : "");
    const [selectedSectionId, setSelectedSectionId] = useState<string>(isTeacher ? initialFilters?.section_id?.toString() : "");
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

    // ─── Filtrar tipos de documento según el rol elegido ────────────
    const filteredDocumentTypes = useMemo(() => {
        if (!selectedRoleType) return [];

        if (selectedRoleType === "all") {
            // Si es para todos, buscamos el tipo con código "OTH"
            return documentTypes.filter((dt: any) => dt.code === "OTH");
        }

        return documentTypes.filter((dt: any) =>
            dt.roles?.some((r: any) => r.id.toString() === data.role_id)
        );
    }, [selectedRoleType, data.role_id, documentTypes]);

    // ─── Efecto: Si es para "Todos", autoseleccionar OTH y nivel Global ──
    useEffect(() => {
        if (selectedRoleType === "all" && filteredDocumentTypes.length > 0) {
            setData((prev: any) => ({
                ...prev,
                role_id: null,
                level: 1,
                document_type_id: filteredDocumentTypes[0].id.toString(),
                location_id: null,
            }));
        }
    }, [selectedRoleType, filteredDocumentTypes]);

    // Efecto para inicializar docente si se abre el sheet
    useEffect(() => {
        if (open && isTeacher && initialFilters) {
            setSelectedRoleType("specific");
            setData(prev => ({
                ...prev,
                level: 4,
                location_id: initialFilters.section_id.toString(),
            }));
            setSelectedFacultyId(initialFilters.faculty_id.toString());
            setSelectedSchoolId(initialFilters.school_id.toString());
            setSelectedSectionId(initialFilters.section_id.toString());
        }
    }, [open, isTeacher, initialFilters]);

    const handleRoleChange = (val: string) => {
        if (val === "all") {
            setSelectedRoleType("all");
            resetLocationStates();
        } else {
            setSelectedRoleType("specific");
            setData("role_id", val);
        }
    };

    const resetLocationStates = () => {
        setSelectedFacultyId("");
        setSelectedSchoolId("");
        setSelectedSectionId("");
        setSelectedCompanyId("");
    }

    const handleLevelChange = (val: string) => {
        const lvl = Number(val);
        resetLocationStates();
        setData(prev => ({
            ...prev,
            level: lvl,
            location_id: null,
        }));
    };

    const handleLocationChange = (loc: LocationValue) => {
        setData(prev => ({
            ...prev,
            location_id: loc.location_id ? loc.location_id.toString() : null,
        }));
    };

    const getLevelLabel = (lvl: number) => {
        switch (lvl) {
            case 1: return "Global (toda la universidad)";
            case 2: return "Por Facultad";
            case 3: return "Por Escuela";
            case 4: return "Por Sección";
            default: return "";
        }
    };

    const handleClose = () => {
        reset();
        resetLocationStates();
        setSelectedRoleType("");
        onOpenChange(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(resource.store.url(), {
            onSuccess: () => {
                handleClose();
            },
            onError: () => {
                toast.error("Error al registrar el recurso. Revisa los campos.");
            },
            forceFormData: true, // Asegura que el archivo se envíe correctamente
        });
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="flex flex-col p-4 h-full sm:max-w-md w-full overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Nuevo Recurso Académico</SheetTitle>
                    <SheetDescription>
                        Sube manuales, reglamentos o formatos para la comunidad.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">

                    {/* PASO 1 ─ ¿Para quién? (Rol) */}
                    <div className="flex flex-col gap-2">
                        <Label className={errors.role_id ? "text-destructive" : ""}>1. ¿Para quién va dirigido?</Label>
                        <Select onValueChange={handleRoleChange} value={selectedRoleType === "all" ? "all" : data.role_id || ""}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el rol destinatario" />
                            </SelectTrigger>
                            <SelectContent>
                                {isAdmin && (
                                    <SelectItem value="all">
                                        Público General / Todos
                                    </SelectItem>
                                )}
                                {roles.map((r: any) => (
                                    <SelectItem key={r.id} value={r.id.toString()}>
                                        {r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role_id && (
                            <p className="text-xs text-destructive">{errors.role_id}</p>
                        )}
                        <p className="text-xs text-muted-foreground italic">
                            {selectedRoleType === "all" ? "Visible para todo usuario autenticado en el sistema." : "El recurso será visible solo para el rol seleccionado."}
                        </p>
                    </div>

                    {selectedRoleType === "specific" && (
                        <>
                            {/* PASO 2 ─ Nivel / Alcance */}
                            <div className="flex flex-col gap-2">
                                <Label className={errors.level ? "text-destructive" : ""}>2. Nivel de Visibilidad</Label>
                                <Select
                                    onValueChange={handleLevelChange}
                                    value={data.level.toString()}
                                    disabled={isTeacher}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Global, Facultad, Escuela..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {!isSubAdmin && (
                                            <SelectItem value="1">Global (toda la institución)</SelectItem>
                                        )}
                                        {!isSubAdmin && (
                                            <SelectItem value="2">Por Facultad</SelectItem>
                                        )}
                                        <SelectItem value="3">Por Escuela</SelectItem>
                                        <SelectItem value="4">Por Sección</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.level && <p className="text-xs text-destructive">{errors.level}</p>}
                                {isTeacher && <p className="text-[10px] text-muted-foreground">Como docente, tus recursos se asignan automáticamente a tu sección.</p>}
                            </div>

                            {/* PASO 2b ─ Selector de ubicación */}
                            {data.level > 1 && (
                                <div className="rounded-lg border border-sidebar-border p-4 bg-muted/20 flex flex-col gap-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                        Especifica la ubicación para "{getLevelLabel(data.level)}"
                                    </p>
                                    <LocationSelector
                                        level={data.level}
                                        faculties={faculties}
                                        onChange={handleLocationChange}
                                        selectedFacultyId={selectedFacultyId}
                                        selectedSchoolId={selectedSchoolId}
                                        selectedSectionId={selectedSectionId}
                                        selectedCompanyId={selectedCompanyId}
                                        onFacultyChange={setSelectedFacultyId}
                                        onSchoolChange={setSelectedSchoolId}
                                        onSectionChange={setSelectedSectionId}
                                        onCompanyChange={setSelectedCompanyId}
                                        disabled={isTeacher}
                                    />
                                    {errors.location_id && <p className="text-xs text-destructive">{errors.location_id}</p>}
                                </div>
                            )}

                            {/* PASO 3 ─ Tipo de Documento */}
                            <div className="flex flex-col gap-2">
                                <Label className={errors.document_type_id ? "text-destructive" : ""}>3. Tipo de Documento</Label>
                                <Select
                                    onValueChange={(val) => setData("document_type_id", val)}
                                    disabled={filteredDocumentTypes.length === 0}
                                    value={data.document_type_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                filteredDocumentTypes.length === 0
                                                    ? "Sin tipos disponibles"
                                                    : "Selecciona el formato..."
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredDocumentTypes.map((dt: any) => (
                                            <SelectItem key={dt.id} value={dt.id.toString()}>
                                                {dt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.document_type_id && <p className="text-xs text-destructive">{errors.document_type_id}</p>}
                            </div>
                        </>
                    )}

                    {/* PASO 4 ─ Detalles del archivo */}
                    <div className={`flex flex-col gap-2 border-t pt-4 ${selectedRoleType === "" ? "opacity-30 pointer-events-none" : ""}`}>
                        <Label>
                            {selectedRoleType === "all" ? "2. Detalles del Archivo Público" : "4. Detalles del Archivo"}
                        </Label>
                        <div className="flex flex-col gap-3 mt-2">
                            <Input
                                placeholder="Nombre o título (ej. Guía de Prácticas 2026)"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            <Textarea
                                placeholder="Breve descripción del contenido..."
                                className="resize-none"
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData("description", e.target.value)}
                            />
                            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                            <Input
                                type="file"
                                className="cursor-pointer"
                                onChange={(e) => setData("file", e.target.files ? e.target.files[0] : null)}
                            />
                            {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
                        </div>
                    </div>

                    <div className="mt-auto flex justify-end gap-3 pt-4 border-t border-sidebar-border">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing || !selectedRoleType}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cargando...
                                </>
                            ) : (
                                "Cargar Recurso"
                            )}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
