import { router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Field, WorkflowErrors } from '@/shared/components/workflow-ui';

import { placementService } from '../../services/placement.service';
import type { PlacementRecord } from '../../types';
import { normalizeInternshipType } from '../../utils/internship-type';
import {
    MINIMUM_BUSINESS_DAYS,
    MINIMUM_PRACTICE_HOURS,
    countBusinessDays,
    estimatedPracticeHours,
    minimumPracticeEndDate,
} from '../../utils/practice-duration';
import PracticeSummary from './practice-summary';

export default function PracticeForm({
    companyId,
    placement,
    type,
    origin,
    onSaved,
}: {
    companyId: number | null;
    placement: PlacementRecord | null;
    type: string;
    origin: string;
    onSaved: () => Promise<void>;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [checked, setChecked] = useState(false);
    const [editing, setEditing] = useState(!placement);
    const showForm = !placement || editing;
    const wasApproved = placement?.approval_status === 1;
    const [startDate, setStartDate] = useState(
        placement?.start_date?.slice(0, 10) ?? '',
    );
    const [endDate, setEndDate] = useState(
        placement?.end_date?.slice(0, 10) ?? '',
    );
    const businessDays = countBusinessDays(startDate, endDate);
    const estimatedHours = estimatedPracticeHours(businessDays);
    const durationIsValid = estimatedHours >= MINIMUM_PRACTICE_HOURS;
    const minimumEndDate = minimumPracticeEndDate(startDate);
    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!checked || !companyId) return;
        const values = Object.fromEntries(new FormData(event.currentTarget));
        // El placement puede venir de datos antiguos con el tipo en español.
        // La API solo acepta los valores en inglés.
        const internshipType = normalizeInternshipType(type);
        setBusy(true);
        setError(null);
        try {
            await placementService.save({
                company: { id: companyId },
                internship_type: internshipType,
                origin_type: origin,
                practice_declaration_accepted: true,
                placement: values,
            });
            toast.success(
                placement
                    ? 'Datos actualizados. La formalización volverá a revisión.'
                    : 'Jefe inmediato y datos de práctica guardados. Ya puedes presentar documentos en Formalización.',
            );
            setEditing(false);
            setChecked(false);
            await onSaved();
            router.reload();
        } catch (cause) {
            setError(cause);
        } finally {
            setBusy(false);
        }
    };
    return (
        <div className="space-y-5">
            {placement && !showForm && wasApproved && (
                <p className="text-sm text-muted-foreground">
                    Estos datos ya fueron aprobados. Si los editas, la
                    formalización volverá a revisión.
                </p>
            )}
            {showForm ? (
                <form onSubmit={save} className="space-y-5">
                    <WorkflowErrors error={error} />
                    <fieldset disabled={busy} className="space-y-5">
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>
                                    2. Datos del Jefe Inmediato
                                </CardTitle>
                                <CardDescription>
                                    Persona que supervisará tus prácticas dentro
                                    de la empresa.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {(
                                        [
                                            [
                                                'boss_name',
                                                'Nombre completo del jefe inmediato',
                                                'text',
                                            ],
                                            [
                                                'boss_position',
                                                'Cargo del jefe inmediato',
                                                'text',
                                            ],
                                            [
                                                'boss_phone',
                                                'Celular de contacto',
                                                'tel',
                                            ],
                                            [
                                                'boss_email',
                                                'Correo de contacto',
                                                'email',
                                            ],
                                        ] as const
                                    ).map(([name, label, inputType]) => (
                                        <Field key={name} label={label}>
                                            <Input
                                                name={name}
                                                type={inputType}
                                                defaultValue={
                                                    placement?.[name] ?? ''
                                                }
                                                required
                                                maxLength={
                                                    name === 'boss_phone'
                                                        ? 30
                                                        : 255
                                                }
                                            />
                                        </Field>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>
                                    3. Datos de las Prácticas Pre-Profesionales
                                </CardTitle>
                                <CardDescription>
                                    Área, cargo y fechas estimadas de tu
                                    práctica.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {(
                                        [
                                            [
                                                'area_name',
                                                'Área de desempeño',
                                                'text',
                                            ],
                                            [
                                                'position',
                                                'Cargo a ocupar',
                                                'text',
                                            ],
                                        ] as const
                                    ).map(([name, label, inputType]) => (
                                        <Field key={name} label={label}>
                                            <Input
                                                name={name}
                                                type={inputType}
                                                defaultValue={
                                                    placement?.[name] ?? ''
                                                }
                                                required
                                                maxLength={255}
                                            />
                                        </Field>
                                    ))}
                                    <Field label="Fecha estimada de inicio">
                                        <Input
                                            name="start_date"
                                            type="date"
                                            value={startDate}
                                            onChange={(event) =>
                                                setStartDate(event.target.value)
                                            }
                                            required
                                        />
                                    </Field>
                                    <Field label="Fecha estimada de término">
                                        <Input
                                            name="end_date"
                                            type="date"
                                            value={endDate}
                                            min={minimumEndDate ?? undefined}
                                            onChange={(event) =>
                                                setEndDate(event.target.value)
                                            }
                                            required
                                        />
                                    </Field>
                                </div>
                                <div
                                    className={
                                        startDate && endDate && !durationIsValid
                                            ? 'rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive'
                                            : 'rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground'
                                    }
                                >
                                    {startDate && endDate ? (
                                        <p className="font-medium">
                                            {businessDays} días hábiles ·{' '}
                                            {estimatedHours} horas estimadas
                                            (máximo 6 h/día)
                                        </p>
                                    ) : (
                                        <p className="font-medium">
                                            Duración mínima:{' '}
                                            {MINIMUM_PRACTICE_HOURS} horas
                                        </p>
                                    )}
                                    <p className="mt-1 leading-relaxed">
                                        La práctica debe cubrir al menos{' '}
                                        {MINIMUM_PRACTICE_HOURS} horas. Con un
                                        máximo de 6 horas diarias necesitas al
                                        menos {MINIMUM_BUSINESS_DAYS} días
                                        hábiles. Si tu jornada es de 4 horas,
                                        necesitarás 80 días hábiles.
                                    </p>
                                </div>
                                <Field label="Descripción de funciones">
                                    <Textarea
                                        name="description"
                                        defaultValue={
                                            placement?.description ?? ''
                                        }
                                        maxLength={1000}
                                    />
                                </Field>
                            </CardContent>
                        </Card>
                        <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                            <label className="flex items-start gap-3 text-sm">
                                <input
                                    type="checkbox"
                                    required
                                    checked={checked}
                                    onChange={(e) =>
                                        setChecked(e.target.checked)
                                    }
                                />
                                <span>
                                    Declaro que los datos del jefe inmediato y
                                    de la práctica registrados son válidos y
                                    correctos.
                                </span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <Button disabled={busy || !checked}>
                                    {busy
                                        ? 'Guardando…'
                                        : placement
                                          ? 'Guardar cambios de práctica'
                                          : 'Guardar datos de práctica'}
                                </Button>
                                {placement && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={busy}
                                        onClick={() => {
                                            setEditing(false);
                                            setChecked(false);
                                            setError(null);
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </fieldset>
                </form>
            ) : (
                <PracticeSummary
                    placement={placement}
                    onEdit={() => {
                        setEditing(true);
                        setChecked(false);
                        setError(null);
                    }}
                />
            )}
        </div>
    );
}
