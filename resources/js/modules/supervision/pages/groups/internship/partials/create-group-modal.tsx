import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { router } from "@inertiajs/react"; // Importamos router directamente
import { useForm } from "react-hook-form"; // Importamos useForm de react-hook-form
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import groups from "@/routes/academic/groups";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/components/ui/form';
import { storeGroupSchema, StoreGroupValues } from "./store.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { StudentSelectorTable } from "../../../../components/student-selector-table";

interface Faculty {
    id: number;
    name: string;
    schools: School[];
}

interface School {
    id: number;
    name: string;
    sections: Section[];
}

interface Section {
    id: number;
    name: string;
}

interface CreateGroupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    faculties: Faculty[];
    onSuccess?: () => void;
}

export default function CreateGroupModal({
    open,
    onOpenChange,
    faculties,
    onSuccess
}: CreateGroupModalProps) {
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showStudents, setShowStudents] = useState(false);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [supervisors, setSupervisors] = useState<any[]>([]);
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);

    // 1. Inicializamos React Hook Form con el Resolver de Zod
    const form = useForm<StoreGroupValues>({
        resolver: zodResolver(storeGroupSchema),
        defaultValues: {
            name: "",
            teacher_assignment_id: "",
            supervisor_assignment_id: "",
            section_id: "",
            faculty_id: "",
            school_id: "",
            student_ids: [],
        },
        mode: "onChange",
    });

    // Observamos los cambios para la cascada y carga de datos
    const facultyId = form.watch("faculty_id");
    const schoolId = form.watch("school_id");
    const sectionId = form.watch("section_id");

    const currentFaculty = faculties.find((f) => f.id.toString() === facultyId);
    const currentSchool = currentFaculty?.schools.find((s) => s.id.toString() === schoolId);

    // Cargar docentes cuando cambia la sección
    useEffect(() => {
        if (sectionId) {
            fetchDependencies(Number(sectionId));
        } else {
            setTeachers([]);
            setSupervisors([]);
        }
    }, [sectionId]);

    const fetchDependencies = async (id: number) => {
        setLoading(true);
        try {
            const response = await axios.get(groups.api.dependencies.url(id));
            const { teachers: teachersData, supervisors: supervisorsData, suggested_name } = response.data;

            setTeachers(teachersData || []);
            setSupervisors(supervisorsData || []);

            // Seteamos valores sugeridos en el formulario
            form.setValue("name", suggested_name || "");

            if (teachersData?.length === 1) {
                form.setValue("teacher_assignment_id", teachersData[0].id.toString());
            }
            if (supervisorsData?.length === 1) {
                form.setValue("supervisor_assignment_id", supervisorsData[0].id.toString());
            }

            // Cargar estudiantes disponibles
            const studentsResponse = await axios.get(groups.api.students.url(id));
            setAvailableStudents(studentsResponse.data.students || []);

        } catch (error) {
            toast.error("Error al cargar dependencias de la sección");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (values: StoreGroupValues) => {
        setIsSubmitting(true);
        router.post(groups.store().url, values, {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
                setShowStudents(false);
                setAvailableStudents([]);
                if (onSuccess) onSuccess();
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Nuevo Grupo de Prácticas</DialogTitle>
                            <DialogDescription>
                                Crea un nuevo grupo vinculando una sección académica con sus docentes.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            {/* Selectores de Ubicación Académica */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="faculty_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Facultad</FormLabel>
                                            <Select
                                                onValueChange={(v) => {
                                                    field.onChange(v);
                                                    form.setValue("school_id", "");
                                                    form.setValue("section_id", "");
                                                }}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {faculties.map((f: any) => (
                                                        <SelectItem key={f.id} value={f.id.toString()}>
                                                            {f.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="school_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Escuela</FormLabel>
                                            <Select
                                                disabled={!facultyId}
                                                onValueChange={(v) => {
                                                    field.onChange(v);
                                                    form.setValue("section_id", "");
                                                }}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {currentFaculty?.schools.map((s) => (
                                                        <SelectItem key={s.id} value={s.id.toString()}>
                                                            {s.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="section_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sección</FormLabel>
                                            <Select
                                                disabled={!schoolId}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {currentSchool?.sections.map((sec) => (
                                                        <SelectItem key={sec.id} value={sec.id.toString()}>
                                                            {sec.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Asignación de Docentes */}
                            {sectionId && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4">
                                    <FormField
                                        control={form.control}
                                        name="teacher_assignment_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Docente Titular</FormLabel>
                                                <Select
                                                    disabled={loading}
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background">
                                                            <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {teachers.map((t) => (
                                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                                {t.user?.person?.surnames} {t.user?.person?.names}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="supervisor_assignment_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Docente Supervisor</FormLabel>
                                                <Select
                                                    disabled={loading}
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background">
                                                            <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {supervisors.map((s) => (
                                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                                {s.user?.person?.surnames} {s.user?.person?.names}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Nombre del Grupo */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del Grupo</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Ej: Grupo de Prácticas - Sección A"
                                                disabled={!sectionId}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Sección opcional de Estudiantes */}
                            {sectionId && (
                                <div className="space-y-4">
                                    {!showStudents ? (
                                        <div className="flex border-2 border-dashed rounded-lg p-6 bg-muted/20 items-center justify-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setShowStudents(true)}
                                                className="h-auto py-2 group"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="bg-primary/10 p-2 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
                                                        <Plus className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="text-xs font-semibold">Añadir Estudiantes</span>
                                                    <span className="text-[10px] text-muted-foreground mt-1">
                                                        Selecciona los alumnos que conformarán este grupo (Opcional)
                                                    </span>
                                                </div>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] uppercase font-bold text-primary">Selección de Estudiantes</Label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShowStudents(false);
                                                        form.setValue("student_ids", []);
                                                    }}
                                                    className="h-6 text-[10px] text-destructive hover:bg-destructive/10"
                                                >
                                                    Cancelar selección
                                                </Button>
                                            </div>
                                            <StudentSelectorTable
                                                students={availableStudents}
                                                selectedIds={form.watch("student_ids") || []}
                                                onSelectionChange={(ids) => form.setValue("student_ids", ids)}
                                                compact={false}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="bg-muted/50 -mx-6 -mb-6 p-6 mt-4 border-t">
                            <div className="flex w-full justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting || !sectionId}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Crear Grupo
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    );
}
