import { Link } from '@inertiajs/react';
import { Building2, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';

export default function StudentDashboardContent() {
    return (
        <div className="grid flex-1 gap-4 p-4 pt-0 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Building2 className="size-5" />
                        </div>
                        <div>
                            <CardTitle>Formalización de prácticas</CardTitle>
                            <CardDescription>
                                Consulta el RUC de la empresa, completa la
                                solicitud y revisa su estado.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/internship">
                            Ir a formalización y seguimiento
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <FileText className="size-5" />
                        </div>
                        <div>
                            <CardTitle>Mi documentación</CardTitle>
                            <CardDescription>
                                Presenta o consulta los documentos requeridos
                                para tu expediente académico.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline">
                        <Link href="/dossier">Abrir mi expediente</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
