import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";

import { Input } from "@/shared/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";

import type { PersonValues} from "./schema";
import { personSchema } from "./schema";

interface PersonFormProps {
    initialValues?: Partial<PersonValues>;
    personExists?: boolean;
    searchDni: string;
    setSearchDni: (value: string) => void;
    onSearch: () => void;
    onPrev: () => void;
    onSubmit: (values: PersonValues) => void;
    isLoading: boolean;
}

export function PersonFStepTwo({
    initialValues,
    personExists = false,
    searchDni,
    setSearchDni,
    onSearch,
    onPrev,
    onSubmit,
    isLoading,
}: PersonFormProps) {
    const form = useForm<PersonValues>({
        resolver: zodResolver(personSchema),
        defaultValues: {
            names: "",
            surnames: "",
            dni: "",
            gender: "",
            ...initialValues,
        },
        mode: "onChange",
    });

    // Sincronizar el estado interno con las props del padre (Especialmente tras búsqueda de DNI)
    useEffect(() => {
        if (initialValues && initialValues.dni) {
            form.reset({
                names: initialValues.names || "",
                surnames: initialValues.surnames || "",
                dni: initialValues.dni || "",
                gender: initialValues.gender || form.getValues("gender") || "M",
            });
        }
    }, [initialValues, form]);


    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 animate-in fade-in duration-300"
            >
                <div className="space-y-1">
                    <p className="text-sm font-medium">Validación de Identidad</p>
                    <p className="text-xs text-muted-foreground">Ingrese el DNI para buscar o registrar.</p>
                </div>

                {/* DNI Search */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Número de DNI..."
                            className="pl-9"
                            value={searchDni}
                            maxLength={8}
                            onChange={(e) => setSearchDni(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    onSearch();
                                }
                            }}
                        />
                    </div>
                    <Button type="button" variant="outline" onClick={onSearch} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Consultar"}
                    </Button>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Nombres */}
                    <FormField
                        control={form.control}
                        name="names"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombres</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={personExists} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Apellidos */}
                    <FormField
                        control={form.control}
                        name="surnames"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellidos</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={personExists} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* DNI */}
                    <FormField
                        control={form.control}
                        name="dni"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>DNI</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Género */}
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Género</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="M">Masculino</SelectItem>
                                        <SelectItem value="F">Femenino</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onPrev} className="flex-1">
                        Regresar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={!form.watch("dni") || isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Ir al Resumen
                    </Button>
                </div>
            </form>
        </Form>
    );
}