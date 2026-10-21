import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/components/ui/form';

import { Input } from '@/shared/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { AcademicSelectorRHF } from '../../../../components/AcademicSelector/AcademicSelector';

import { type Faculty } from '@/shared/types';

import { personInitSchema, PersonInitValues } from './schema';
import { usePage } from '@inertiajs/react';

interface PersonInitProps {
    roles: any[];
    faculties: Faculty[];
    initialValues?: Partial<PersonInitValues>;
    onSubmit: (values: PersonInitValues) => void;
    isLoading: boolean;
}

export function PersonVStepOne({
    roles,
    faculties,
    initialValues,
    onSubmit,
    isLoading,
}: PersonInitProps) {
    const { role } = usePage().props as any;
    const form = useForm<PersonInitValues>({
        resolver: zodResolver(personInitSchema),
        defaultValues: {
            role_id: '',
            email: '',
            faculty_id: '',
            school_id: '',
            section_id: '',
            ...initialValues,
        },
        mode: 'onChange',
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Rol */}
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

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <AcademicSelectorRHF
                    roleId={form.watch('role_id')}
                    roleUser={role}
                    faculties={faculties}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
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
