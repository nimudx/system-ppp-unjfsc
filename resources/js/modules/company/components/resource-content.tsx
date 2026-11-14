import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Download,
    ExternalLink,
    FileArchive,
    FileImage,
    FileSpreadsheet,
    FileText,
    FolderOpen,
    Presentation,
    Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ResourceItem } from '@/modules/resources/types';
import storage from '@/routes/storage';
import Heading from '@/shared/components/heading';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

function documentKind(path?: string) {
    const extension = path?.split('.').pop()?.toLowerCase() ?? '';

    if (extension === 'pdf') {
        return { icon: FileText, tile: 'bg-red-500/10 text-red-600' };
    }

    if (['doc', 'docx'].includes(extension)) {
        return { icon: FileText, tile: 'bg-blue-500/10 text-blue-600' };
    }

    if (['xls', 'xlsx', 'csv'].includes(extension)) {
        return {
            icon: FileSpreadsheet,
            tile: 'bg-emerald-500/10 text-emerald-600',
        };
    }

    if (['ppt', 'pptx'].includes(extension)) {
        return {
            icon: Presentation,
            tile: 'bg-orange-500/10 text-orange-600',
        };
    }

    if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
        return { icon: FileImage, tile: 'bg-purple-500/10 text-purple-600' };
    }

    if (['zip', 'rar'].includes(extension)) {
        return {
            icon: FileArchive,
            tile: 'bg-yellow-500/10 text-yellow-600',
        };
    }

    return { icon: FileText, tile: 'bg-muted text-muted-foreground' };
}

export default function CompanyResourceContent({
    resources = [],
}: {
    resources?: ResourceItem[];
}) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const term = query.trim().toLocaleLowerCase('es');

        if (!term) return resources;

        return resources.filter((resource) =>
            [resource.name, resource.description, resource.document_type_name]
                .filter(Boolean)
                .some((value) => value!.toLocaleLowerCase('es').includes(term)),
        );
    }, [resources, query]);

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Heading
                    variant="small"
                    title="Recursos empresariales"
                    description="Documentos, plantillas y guías para la gestión de prácticas con la empresa."
                />

                <div className="relative w-full max-w-sm">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar recurso..."
                        aria-label="Buscar recursos"
                        className="pl-9"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-12 text-center">
                    <FolderOpen className="size-12 text-muted-foreground/50" />
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold">
                            {resources.length === 0
                                ? 'Aún no hay recursos para tu empresa'
                                : 'No encontramos coincidencias'}
                        </h2>
                        <p className="max-w-md text-sm text-muted-foreground">
                            {resources.length === 0
                                ? 'Cuando la coordinación académica publique guías o formatos, aparecerán en esta sección.'
                                : 'Prueba con otra palabra o borra la búsqueda.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((resource) => {
                        const document = resource.documents?.[0];
                        const url = document?.path
                            ? storage.local(document.path).url
                            : null;
                        const kind = documentKind(document?.path);
                        const KindIcon = kind.icon;

                        return (
                            <article
                                key={resource.id}
                                className="flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs"
                            >
                                <div className="flex flex-1 flex-col gap-4 p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div
                                            className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${kind.tile}`}
                                        >
                                            <KindIcon className="size-6" />
                                        </div>
                                        {resource.document_type_name && (
                                            <Badge variant="outline">
                                                {resource.document_type_name}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <h3 className="line-clamp-2 text-base leading-snug font-semibold">
                                            {resource.name}
                                        </h3>
                                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                            {resource.description ||
                                                'Sin descripción disponible.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-5 py-3">
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(
                                            new Date(resource.created_at),
                                            { addSuffix: true, locale: es },
                                        )}
                                    </span>

                                    {url ? (
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="ghost"
                                            >
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink />
                                                    Abrir
                                                </a>
                                            </Button>
                                            <Button asChild size="sm">
                                                <a
                                                    href={url}
                                                    download={
                                                        document?.name || true
                                                    }
                                                >
                                                    <Download />
                                                    Descargar
                                                </a>
                                            </Button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">
                                            Sin archivo adjunto
                                        </span>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
