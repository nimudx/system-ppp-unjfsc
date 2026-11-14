import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import jobboard from '@/routes/company/jobboard';
import Heading from '@/shared/components/heading';
import InputError from '@/shared/components/input-error';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { SectionCard } from '@/shared/components/ui/section-card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import AppLayout from '@/shared/layouts/app-layout';
import SchoolSelector from '../../components/school-selector';
import type { CompanyJobBoardFormProps } from '../../types';
import { toDateInput } from '../../utils';

interface VacancyFormData {
    title: string;
    description: string;
    type: string;
    modality: string;
    area_name: string;
    location: string;
    positions_count: number;
    requirements: string;
    deadline_at: string;
    school_ids: number[];
}

export default function CompanyJobBoardForm({
    vacancy,
    schools,
    options,
}: CompanyJobBoardFormProps) {
    const isEditing = vacancy !== null;

    const { data, setData, post, patch, processing, errors } =
        useForm<VacancyFormData>({
            title: vacancy?.title ?? '',
            description: vacancy?.description ?? '',
            type: vacancy?.type ?? options.types[0]?.value ?? '',
            modality: vacancy?.modality ?? options.modalities[0]?.value ?? '',
            area_name: vacancy?.area_name ?? '',
            location: vacancy?.location ?? '',
            positions_count: vacancy?.positions_count ?? 1,
            requirements: vacancy?.requirements ?? '',
            deadline_at: toDateInput(vacancy?.deadline_at),
            school_ids: vacancy?.schools.map((school) => school.id) ?? [],
        });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (vacancy) {
            patch(jobboard.update(vacancy.id).url, { preserveScroll: true });
        } else {
            post(jobboard.store().url, { preserveScroll: true });
        }
    };

    const schoolError =
        (errors as Record<string, string | undefined>).school_ids ??
        (errors as Record<string, string | undefined>)['school_ids.0'];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Bolsa laboral', href: jobboard.index().url },
                {
                    title: isEditing ? 'Editar vacante' : 'Nueva vacante',
                    href: isEditing
                        ? jobboard.edit(vacancy.id).url
                        : jobboard.create().url,
                },
            ]}
        >
            <Head title={isEditing ? 'Editar vacante' : 'Nueva vacante'} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={jobboard.index().url}>
                            <ArrowLeft className="size-4" />
                            <span className="sr-only">Volver</span>
                        </Link>
                    </Button>
                    <Heading
                        variant="small"
                        title={isEditing ? 'Editar vacante' : 'Nueva vacante'}
                        description={
                            isEditing
                                ? 'Actualiza los datos y vuelve a enviarla a revisión.'
                                : 'Completa los datos de la oportunidad laboral.'
                        }
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <SectionCard>
                        <SectionCard.Header
                            title="Datos de la vacante"
                            description="La información que verán administración y docentes titulares."
                        />

                        <SectionCard.Body className="space-y-5 px-4 py-5">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Título de la vacante
                                </Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(event) =>
                                        setData('title', event.target.value)
                                    }
                                    placeholder="Ej. Practicante de contabilidad"
                                    aria-invalid={!!errors.title}
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipo</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) =>
                                            setData('type', value)
                                        }
                                    >
                                        <SelectTrigger
                                            id="type"
                                            aria-invalid={!!errors.type}
                                        >
                                            <SelectValue placeholder="Selecciona el tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {options.types.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="modality">Modalidad</Label>
                                    <Select
                                        value={data.modality}
                                        onValueChange={(value) =>
                                            setData('modality', value)
                                        }
                                    >
                                        <SelectTrigger
                                            id="modality"
                                            aria-invalid={!!errors.modality}
                                        >
                                            <SelectValue placeholder="Selecciona la modalidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {options.modalities.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.modality} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="area_name">
                                        Área o especialidad
                                    </Label>
                                    <Input
                                        id="area_name"
                                        value={data.area_name}
                                        onChange={(event) =>
                                            setData(
                                                'area_name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Ej. Administración"
                                        aria-invalid={!!errors.area_name}
                                    />
                                    <InputError message={errors.area_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Ubicación</Label>
                                    <Input
                                        id="location"
                                        value={data.location}
                                        onChange={(event) =>
                                            setData(
                                                'location',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Ej. Huacho, Lima"
                                        aria-invalid={!!errors.location}
                                    />
                                    <InputError message={errors.location} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="positions_count">
                                        Número de posiciones
                                    </Label>
                                    <Input
                                        id="positions_count"
                                        type="number"
                                        min={1}
                                        max={999}
                                        value={data.positions_count}
                                        onChange={(event) =>
                                            setData(
                                                'positions_count',
                                                Number(event.target.value),
                                            )
                                        }
                                        aria-invalid={!!errors.positions_count}
                                    />
                                    <InputError
                                        message={errors.positions_count}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deadline_at">
                                        Fecha límite
                                    </Label>
                                    <Input
                                        id="deadline_at"
                                        type="date"
                                        value={data.deadline_at}
                                        onChange={(event) =>
                                            setData(
                                                'deadline_at',
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={!!errors.deadline_at}
                                    />
                                    <InputError message={errors.deadline_at} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    rows={6}
                                    placeholder="Describe las funciones, el horario y las condiciones de la vacante."
                                    aria-invalid={!!errors.description}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="requirements">Requisitos</Label>
                                <Textarea
                                    id="requirements"
                                    value={data.requirements}
                                    onChange={(event) =>
                                        setData(
                                            'requirements',
                                            event.target.value,
                                        )
                                    }
                                    rows={5}
                                    placeholder="Requisitos académicos, habilidades y experiencia deseada."
                                    aria-invalid={!!errors.requirements}
                                />
                                <InputError message={errors.requirements} />
                            </div>
                        </SectionCard.Body>
                    </SectionCard>

                    <SectionCard>
                        <SectionCard.Header
                            title="Escuelas destino"
                            description="Selecciona las escuelas cuyos docentes titulares podrán proponer candidatos."
                        />
                        <SectionCard.Body className="px-4 py-5">
                            <SchoolSelector
                                schools={schools}
                                selectedIds={data.school_ids}
                                onChange={(ids) => setData('school_ids', ids)}
                                error={schoolError}
                            />
                        </SectionCard.Body>
                    </SectionCard>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button variant="ghost" asChild>
                            <Link href={jobboard.index().url}>Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 size-4" />
                            {processing
                                ? 'Guardando...'
                                : isEditing
                                  ? 'Guardar cambios'
                                  : 'Guardar borrador'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
