import { zodResolver } from '@hookform/resolvers/zod';
import { usePage } from '@inertiajs/react';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useState } from 'react'; // 👈 Añadido useEffect
import { useWatch } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { Faculty } from '@/modules/academic';
import { AcademicSelectorRHF } from '@/modules/registration/pages/register/components/AcademicSelector/AcademicSelector';
import type { RoleOption } from '@/modules/registration/types';
import type { CsvRow, CsvValidationError } from '@/modules/registration/types';
import { Button } from '@/shared/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { CsvPreview } from './components/CsvPreview';
import { CsvUploader } from './components/CsvUploader';
import type { MassivePersonInitValues } from './schema';
import { massivePersonInitSchema } from './schema';

interface MassivePersonInitProps {
    roles: RoleOption[];
    faculties: Faculty[];
    initialValues?: Partial<MassivePersonInitValues>;
    onSubmit: (values: MassivePersonInitValues) => void;
    isLoading: boolean;
}

export function MassiveVStepOne({
    roles,
    faculties,
    initialValues,
    onSubmit,
    isLoading,
}: MassivePersonInitProps) {
    const { role } = usePage().props;
    const [previewData, setPreviewData] = useState<CsvRow[]>(
        initialValues?.rows ?? [],
    );
    const [csvErrors, setCsvErrors] = useState<CsvValidationError[]>([]);

    const form = useForm<MassivePersonInitValues>({
        resolver: zodResolver(massivePersonInitSchema),
        defaultValues: {
            role_id: '',
            faculty_id: '',
            school_id: '',
            section_id: '',
            rows: [],
            ...initialValues,
        },
        mode: 'onChange',
    });
    const watchedField1 = useWatch({ control: form.control, name: 'role_id' });

    // 👈 Sincronizar datos si ya existen (al regresar de otros pasos)

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="role_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rol</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.id.toString()}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <AcademicSelectorRHF
                    roleId={watchedField1}
                    roleUser={role}
                    faculties={faculties}
                />
                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                {previewData.length === 0 ? (
                                    <CsvUploader
                                        onChange={({ file, rows, errors }) => {
                                            field.onChange(file);
                                            // Solo guardamos si el archivo es válido según el parseo inicial
                                            form.setValue(
                                                'rows',
                                                errors.length === 0 ? rows : [],
                                            );
                                            setPreviewData(rows);
                                            setCsvErrors(errors);
                                        }}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        <CsvPreview
                                            data={previewData}
                                            errors={csvErrors}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                field.onChange(undefined); // 👈 Limpiamos RHF
                                                form.setValue('rows', []); // 👈 Limpiamos el JSON
                                                setPreviewData([]);
                                                setCsvErrors([]);
                                            }}
                                        >
                                            <RefreshCcw className="mr-2 h-4 w-4" />
                                            Cambiar archivo
                                        </Button>
                                    </div>
                                )}
                            </FormControl>
                            <FormMessage />{' '}
                            {/* 👈 Aquí aparecerá el error en rojo */}
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={csvErrors.length > 0 || isLoading}
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Continuar
                    </Button>
                </div>
            </form>
        </Form>
    );
}
