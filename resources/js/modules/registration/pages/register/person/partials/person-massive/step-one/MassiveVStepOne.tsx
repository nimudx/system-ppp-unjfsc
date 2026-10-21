import { Loader2, RefreshCcw, UploadCloud } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { MassivePersonInitValues, massivePersonInitSchema } from "./schema";
import { AcademicSelectorRHF } from '@/modules/registration/pages/register/components/AcademicSelector/AcademicSelector';
import { useState, useEffect } from 'react'; // 👈 Añadido useEffect
import { CsvUploader } from './components/CsvUploader';
import { CsvPreview } from './components/CsvPreview';
import { usePage } from '@inertiajs/react';

import { type Faculty } from '@/shared/types';

interface MassivePersonInitProps {
    roles: any[];
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
    const { role } = usePage().props as any;
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [csvErrors, setCsvErrors] = useState<any[]>([]);

    const form = useForm<MassivePersonInitValues>({
        resolver: zodResolver(massivePersonInitSchema),
        defaultValues: {
            role_id: "",
            faculty_id: "",
            school_id: "",
            section_id: "",
            rows: [],
            ...initialValues,
        },
        mode: "onChange",
    });

    // 👈 Sincronizar datos si ya existen (al regresar de otros pasos)
    useEffect(() => {
        if (initialValues?.rows && initialValues.rows.length > 0) {
            setPreviewData(initialValues.rows);
            // Si también quieres persistir errores, deberías guardarlos en el padre también
        }
    }, [initialValues?.rows]);


    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="role_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rol</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {roles.map(role => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
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
                    roleId={form.watch("role_id")}
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
                                    <CsvUploader onChange={({ file, rows, valid, errors }) => {

                                        field.onChange(file);
                                        // Solo guardamos si el archivo es válido según el parseo inicial
                                        form.setValue("rows", errors.length === 0 ? rows : []);
                                        setPreviewData(rows);
                                        setCsvErrors(errors);
                                    }} />
                                ) : (
                                    <div className="space-y-4">
                                        <CsvPreview data={previewData} errors={csvErrors} />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                field.onChange(undefined); // 👈 Limpiamos RHF
                                                form.setValue("rows", []); // 👈 Limpiamos el JSON
                                                setPreviewData([]);
                                                setCsvErrors([]);
                                            }}
                                        >
                                            <RefreshCcw className="w-4 h-4 mr-2" />
                                            Cambiar archivo
                                        </Button>
                                    </div>
                                )}
                            </FormControl>
                            <FormMessage /> {/* 👈 Aquí aparecerá el error en rojo */}
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={csvErrors.length > 0 || isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continuar
                    </Button>
                </div>
            </form>
        </Form >
    );
}