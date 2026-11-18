import { Link } from '@inertiajs/react';
import { ArrowRight, FlaskConical, Sparkles } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { useExperimentalBadge } from '../hooks/use-experimental-badge';

/**
 * Aviso de lanzamiento del módulo experimental de la bolsa laboral.
 * Desaparece automáticamente al vencer la fecha configurada en el backend.
 */
export default function ExperimentalNotice({
    createUrl,
}: {
    createUrl: string;
}) {
    const { visible, daysLeft } = useExperimentalBadge();

    if (!visible) {
        return null;
    }

    return (
        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/12 via-background to-primary/5 p-5 md:p-6">
            <div className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/15 p-2.5 text-primary">
                        <FlaskConical className="size-5" />
                    </div>

                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold">
                                Estamos estrenando la bolsa laboral
                            </h3>
                            <Badge className="border-primary/20 bg-primary/15 text-primary">
                                <Sparkles className="mr-1 size-3" />
                                Nuevo · Experimental
                            </Badge>
                        </div>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Este módulo está en construcción y mejora con cada
                            vacante que publicas. Comparte una oportunidad y los
                            docentes titulares podrán proponer estudiantes de su
                            sección.
                        </p>
                        {daysLeft !== null && (
                            <p className="text-xs font-medium text-primary">
                                Disponible por {daysLeft}{' '}
                                {daysLeft === 1 ? 'día' : 'días'} más.
                            </p>
                        )}
                    </div>
                </div>

                <Button asChild className="shrink-0">
                    <Link href={createUrl}>
                        Publicar vacante
                        <ArrowRight className="ml-2 size-4" />
                    </Link>
                </Button>
            </div>
        </section>
    );
}
