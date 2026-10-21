import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Loader2, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type {
    InternshipGroup,
    Assignment,
} from '@/modules/supervision/hooks/use-internship-group';
import groups from '@/routes/academic/groups';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import type { UpdateGroupValues } from './update.schema';
import { updateGroupSchema } from './update.schema';

interface EditGroupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group: InternshipGroup | null;
    onSuccess?: () => void;
}

export default function EditGroupModal({
    open,
    onOpenChange,
    group,
    onSuccess,
}: EditGroupModalProps) {
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [supervisors, setSupervisors] = useState<Assignment[]>([]);

    const form = useForm<UpdateGroupValues>({
        resolver: zodResolver(updateGroupSchema),
        defaultValues: {
            name: '',
            supervisor_id: '',
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (open && group) {
            form.reset({
                name: group.name,
                supervisor_id: 'none',
            });
            fetchSupervisors(group.section.id);
        } else {
            setSupervisors([]);
            form.reset();
        }
    }, [open, group, form]);

    const fetchSupervisors = async (sectionId: number) => {
        setLoading(true);
        try {
            const response = await axios.get(
                groups.api.dependencies.url(sectionId),
            );
            const { supervisors: supervisorsData } = response.data;
            setSupervisors(supervisorsData || []);
        } catch {
            toast.error('Error al cargar dependencias de la sección');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (values: UpdateGroupValues) => {
        if (!group) return;

        setIsSubmitting(true);
        const dataToSend: { name: string; supervisor_id?: string } = {
            name: values.name,
        };

        if (values.supervisor_id && values.supervisor_id !== 'none') {
            dataToSend.supervisor_id = values.supervisor_id;
        }

        router.put(groups.update(group.id).url, dataToSend, {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
                if (onSuccess) onSuccess();
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Editar Grupo de Prácticas</DialogTitle>
                            <DialogDescription>
                                Modifica el nombre o asigna un nuevo docente
                                supervisor al grupo.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                                <Info className="mt-0.5 h-5 w-5 shrink-0" />
                                <div className="text-[11px] leading-relaxed">
                                    <strong>Nota importante:</strong> No se
                                    puede editar la estructura principal, ya que
                                    podría afectar a otros registros y alumnos
                                    vinculados al grupo. Si requiere cambios de
                                    raíz, elimine el grupo y cree uno nuevo
                                    (asegúrese de retirar primero a los
                                    estudiantes).
                                </div>
                            </div>

                            {/* Selectores Bloqueados */}
                            <div className="grid grid-cols-1 gap-4 opacity-70 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label>Módulo</Label>
                                    <Input
                                        disabled
                                        value={
                                            group?.module?.name || 'Módulo 1'
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Facultad</Label>
                                    <Input
                                        disabled
                                        value={
                                            group?.section?.school?.faculty
                                                ?.name || ''
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Escuela</Label>
                                    <Input
                                        disabled
                                        value={
                                            group?.section?.school?.name || ''
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Sección</Label>
                                    <Input
                                        disabled
                                        value={group?.section?.name || ''}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-2">
                                <div className="space-y-2 opacity-70">
                                    <Label>Docente Titular</Label>
                                    <Input
                                        disabled
                                        value={`${group?.teacher?.user?.person?.surnames || ''} ${group?.teacher?.user?.person?.names || ''}`}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="supervisor_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Docente Supervisor
                                            </FormLabel>
                                            <Select
                                                disabled={loading}
                                                onValueChange={field.onChange}
                                                value={field.value || 'none'}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="bg-background">
                                                        <SelectValue
                                                            placeholder={
                                                                loading
                                                                    ? 'Cargando...'
                                                                    : 'Seleccionar'
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        Mantener actual (
                                                        {group?.supervisor?.user
                                                            ?.person
                                                            ?.surnames ||
                                                            ''}{' '}
                                                        {group?.supervisor?.user
                                                            ?.person?.names ||
                                                            ''}
                                                        )
                                                    </SelectItem>
                                                    {supervisors.map((s) => (
                                                        <SelectItem
                                                            key={s.id}
                                                            value={s.id.toString()}
                                                        >
                                                            {
                                                                s.user?.person
                                                                    ?.surnames
                                                            }{' '}
                                                            {
                                                                s.user?.person
                                                                    ?.names
                                                            }
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

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
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="-mx-6 mt-4 -mb-6 border-t bg-muted/50 p-6">
                            <div className="flex w-full justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Guardar Cambios
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
