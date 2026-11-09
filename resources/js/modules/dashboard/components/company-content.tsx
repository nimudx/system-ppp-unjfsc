import { Link } from '@inertiajs/react';
import company from '@/routes/company';
import { edit as editProfile } from '@/routes/profile';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/shared/components/ui/card';

export function CompanyContent() {
    return (
        <div className="grid gap-4 p-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Solicitudes de estudiantes</CardTitle>
                    <CardDescription>
                        Revisa las solicitudes recibidas y confirma qué
                        estudiantes realizarán prácticas en tu empresa.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href={company.requests.url()}>
                            Revisar y aceptar estudiantes
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Perfil empresarial</CardTitle>
                    <CardDescription>
                        Consulta los datos de tu cuenta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline">
                        <Link href={editProfile().url}>Ver perfil</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
