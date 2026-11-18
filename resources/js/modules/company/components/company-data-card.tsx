import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { DataItem } from '@/shared/components/workflow-ui';

import type { CompanyRequest } from '../services/company-workflow';

export default function CompanyDataCard({
    current,
}: {
    current: CompanyRequest;
}) {
    const company = current.company ?? current.company_data;

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle>1. Datos de la empresa</CardTitle>
                <CardDescription>
                    Información registrada de la empresa donde realizarás tus
                    prácticas.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <DataItem label="RUC" value={current.ruc} />
                    <DataItem label="Nombre comercial" value={company.name} />
                    <DataItem label="Razón social" value={company.razon} />
                    <DataItem
                        label="Dirección fiscal"
                        value={company.address}
                    />
                    <DataItem
                        label="Teléfono corporativo"
                        value={company.phone}
                    />
                    <DataItem
                        label="Correo de la empresa"
                        value={company.email}
                    />
                </div>
                {current.ruc_document_url && (
                    <a
                        className="text-sm text-primary underline"
                        href={current.ruc_document_url}
                    >
                        Descargar ficha RUC adjunta
                    </a>
                )}
            </CardContent>
        </Card>
    );
}
