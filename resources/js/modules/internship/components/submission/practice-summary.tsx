import { Pencil } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { DataItem } from '@/shared/components/workflow-ui';

import type { PlacementRecord } from '../../types';
import { formatPracticeDate } from '../../utils/format-practice-date';

export default function PracticeSummary({
    placement,
    onEdit,
}: {
    placement: PlacementRecord | null;
    onEdit: () => void;
}) {
    return (
        <div className="space-y-5">
            <Card>
                <CardHeader className="border-b">
                    <CardTitle>2. Datos del Jefe Inmediato</CardTitle>
                    <CardDescription>
                        Persona que supervisará tus prácticas dentro de la
                        empresa.
                    </CardDescription>
                    <CardAction>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onEdit}
                        >
                            <Pencil />
                            Editar
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <DataItem
                            label="Nombre del jefe inmediato"
                            value={placement?.boss_name}
                        />
                        <DataItem
                            label="Cargo del jefe inmediato"
                            value={placement?.boss_position}
                        />
                        <DataItem
                            label="Celular de contacto"
                            value={placement?.boss_phone}
                        />
                        <DataItem
                            label="Correo de contacto"
                            value={placement?.boss_email}
                        />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="border-b">
                    <CardTitle>
                        3. Datos de las Prácticas Pre-Profesionales
                    </CardTitle>
                    <CardDescription>
                        Área, cargo y fechas estimadas de tu práctica.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <DataItem
                            label="Área de desempeño"
                            value={placement?.area_name}
                        />
                        <DataItem
                            label="Cargo a ocupar"
                            value={placement?.position}
                        />
                        <DataItem
                            label="Fecha estimada de inicio"
                            value={formatPracticeDate(placement?.start_date)}
                        />
                        <DataItem
                            label="Fecha estimada de término"
                            value={formatPracticeDate(placement?.end_date)}
                        />
                    </div>
                    <DataItem
                        label="Descripción de funciones"
                        value={placement?.description}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
