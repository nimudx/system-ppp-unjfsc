import { router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { LucideIcon } from 'lucide-react';
import {
    Building2,
    Download,
    ExternalLink,
    File,
    FileArchive,
    FileImage,
    FileSpreadsheet,
    FileText,
    FolderOpen,
    GraduationCap,
    MoreVertical,
    Pencil,
    Plus,
    Presentation,
    RefreshCw,
    Search,
    SearchX,
    ShieldCheck,
    Trash2,
    UploadCloud,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
    ResourceItem,
    ResourcePageProps,
} from '@/modules/resources/types';
import storage from '@/routes/storage';
import Heading from '@/shared/components/heading';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';
import { CreateResourceSheet } from './create-resource-sheet';
import { DeleteResourceAlert } from './delete-resource-alert';
import { EditResourceSheet } from './edit-resource-sheet';

type Props = Partial<Omit<ResourcePageProps, 'resources'>> & {
    resources?: ResourceItem[];
};

type ResourceDocument = NonNullable<ResourceItem['documents']>[number];
type Origin = 'all' | 'admin' | 'teacher' | 'company' | 'other';

const NEW_DAYS = 7;

const LEVELS: Record<number, { label: string; badge: string; accent: string }> =
    {
        1: {
            label: 'Global',
            badge: 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
            accent: 'bg-blue-500',
        },
        2: {
            label: 'Facultad',
            badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            accent: 'bg-emerald-500',
        },
        3: {
            label: 'Escuela',
            badge: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
            accent: 'bg-amber-500',
        },
        4: {
            label: 'Sección',
            badge: 'border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400',
            accent: 'bg-purple-500',
        },
        5: {
            label: 'Empresa',
            badge: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400',
            accent: 'bg-rose-500',
        },
    };

const FALLBACK_LEVEL = {
    label: 'General',
    badge: 'border-border bg-muted text-muted-foreground',
    accent: 'bg-muted-foreground',
};

const ORIGINS: Record<
    Exclude<Origin, 'all'>,
    { label: string; badge: string; icon: LucideIcon }
> = {
    admin: {
        label: 'Administración',
        badge: 'border-primary/20 bg-primary/10 text-primary',
        icon: ShieldCheck,
    },
    teacher: {
        label: 'Docente',
        badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        icon: GraduationCap,
    },
    company: {
        label: 'Empresa',
        badge: 'border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400',
        icon: Building2,
    },
    other: {
        label: 'Sistema',
        badge: 'border-border bg-muted text-muted-foreground',
        icon: Users,
    },
};

type FileKind = { label: string; icon: LucideIcon; tile: string };

const FILE_KINDS: Record<string, FileKind> = {
    pdf: {
        label: 'PDF',
        icon: FileText,
        tile: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
    word: {
        label: 'Word',
        icon: FileText,
        tile: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    excel: {
        label: 'Excel',
        icon: FileSpreadsheet,
        tile: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    slides: {
        label: 'Presentación',
        icon: Presentation,
        tile: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
    image: {
        label: 'Imagen',
        icon: FileImage,
        tile: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    archive: {
        label: 'Comprimido',
        icon: FileArchive,
        tile: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    },
    other: {
        label: 'Archivo',
        icon: File,
        tile: 'bg-muted text-muted-foreground',
    },
};

const EXTENSIONS: Record<string, keyof typeof FILE_KINDS> = {
    pdf: 'pdf',
    doc: 'word',
    docx: 'word',
    xls: 'excel',
    xlsx: 'excel',
    csv: 'excel',
    ppt: 'slides',
    pptx: 'slides',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    webp: 'image',
    zip: 'archive',
    rar: 'archive',
};

function getFileKind(document?: ResourceDocument): FileKind {
    const source = document?.path ?? document?.name ?? '';
    const extension = source.split('.').pop()?.toLowerCase() ?? '';

    return FILE_KINDS[EXTENSIONS[extension] ?? 'other'];
}

function originOf(resource: ResourceItem): Exclude<Origin, 'all'> {
    const kind = resource.uploader_kind?.toLocaleLowerCase('es') ?? '';

    if (kind.includes('administra')) return 'admin';
    if (kind.includes('docente')) return 'teacher';
    if (kind.includes('empresa')) return 'company';

    return 'other';
}

function ResourceCard({
    resource,
    index,
    isNew,
    onEdit,
    onDelete,
}: {
    resource: ResourceItem;
    index: number;
    isNew: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const document = resource.documents?.[0];
    const url = document?.path ? storage.local(document.path).url : null;
    const kind = getFileKind(document);
    const level = LEVELS[resource.level] ?? FALLBACK_LEVEL;
    const origin = ORIGINS[originOf(resource)];
    const OriginIcon = origin.icon;
    const KindIcon = kind.icon;

    return (
        <article
            className="group relative flex animate-in flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs transition-all duration-300 fill-mode-both fade-in slide-in-from-bottom-2 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg motion-reduce:animate-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
        >
            <span
                aria-hidden
                className={cn(
                    'absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none',
                    level.accent,
                )}
            />

            <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 motion-reduce:transition-none',
                                kind.tile,
                            )}
                        >
                            <KindIcon className="size-6" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                            {kind.label}
                        </span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="-mt-1 -mr-2 size-8 text-muted-foreground"
                                aria-label={`Opciones de ${resource.name}`}
                            >
                                <MoreVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Pencil /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={onDelete}
                            >
                                <Trash2 /> Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={level.badge}>
                        {level.label}
                    </Badge>
                    <Badge
                        variant="outline"
                        className={cn('gap-1', origin.badge)}
                    >
                        <OriginIcon className="size-3" />
                        {origin.label}
                    </Badge>
                    {isNew && (
                        <Badge className="gap-1.5 border-transparent bg-primary/10 text-primary">
                            <span className="relative flex size-1.5">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:hidden" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                            </span>
                            Nuevo
                        </Badge>
                    )}
                </div>

                <div className="space-y-1.5">
                    <h3 className="line-clamp-2 text-base leading-snug font-semibold transition-colors group-hover:text-primary">
                        {resource.name}
                    </h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {resource.description || 'Sin descripción disponible.'}
                    </p>
                </div>

                <div className="grid gap-1 text-xs text-muted-foreground">
                    <span className="truncate">
                        <span className="font-medium text-foreground">
                            Subido por:
                        </span>{' '}
                        {resource.uploader_name ?? 'Sistema'}
                    </span>
                    <span className="truncate">
                        <span className="font-medium text-foreground">
                            Dirigido a:
                        </span>{' '}
                        {resource.target_role_name ?? 'Todos'}
                    </span>
                    {(resource.document_type_name ||
                        resource.location_name) && (
                        <span className="truncate">
                            {[
                                resource.document_type_name,
                                resource.location_name,
                            ]
                                .filter(Boolean)
                                .join(' · ')}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-5 py-3">
                <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(resource.created_at), {
                        addSuffix: true,
                        locale: es,
                    })}
                </span>

                {url ? (
                    <div className="flex items-center gap-1.5">
                        <Button asChild size="sm" variant="ghost">
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
                            <a href={url} download={document?.name || true}>
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
}

export default function AdminResourceContent({
    resources = [],
    documentTypes = [],
    roles = [],
    faculties = [],
    initialFilters = null,
}: Props) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [resourceToEdit, setResourceToEdit] = useState<ResourceItem | null>(
        null,
    );
    const [resourceToDelete, setResourceToDelete] =
        useState<ResourceItem | null>(null);
    const [query, setQuery] = useState('');
    const [originFilter, setOriginFilter] = useState<Origin>('all');
    const [levelFilter, setLevelFilter] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [now] = useState(() => Date.now());

    const originCounts = useMemo(() => {
        const counts: Record<Origin, number> = {
            all: resources.length,
            admin: 0,
            teacher: 0,
            company: 0,
            other: 0,
        };

        resources.forEach((resource) => {
            counts[originOf(resource)] += 1;
        });

        return counts;
    }, [resources]);

    const levelCounts = useMemo(() => {
        const counts = new Map<number, number>();
        resources.forEach((resource) =>
            counts.set(resource.level, (counts.get(resource.level) ?? 0) + 1),
        );

        return counts;
    }, [resources]);

    const filtered = useMemo(() => {
        const term = query.trim().toLocaleLowerCase('es');

        return resources.filter((resource) => {
            if (originFilter !== 'all' && originOf(resource) !== originFilter) {
                return false;
            }

            if (levelFilter !== null && resource.level !== levelFilter) {
                return false;
            }

            if (!term) return true;

            return [
                resource.name,
                resource.description,
                resource.uploader_name,
                resource.target_role_name,
                resource.document_type_name,
            ]
                .filter(Boolean)
                .some((value) => value!.toLocaleLowerCase('es').includes(term));
        });
    }, [resources, query, originFilter, levelFilter]);

    const hasFilters =
        query.trim() !== '' || originFilter !== 'all' || levelFilter !== null;

    const clearFilters = () => {
        setQuery('');
        setOriginFilter('all');
        setLevelFilter(null);
    };

    const refresh = () => {
        router.reload({
            only: ['resources'],
            onStart: () => setRefreshing(true),
            onFinish: () => setRefreshing(false),
        });
    };

    const isNewResource = (createdAt: string) =>
        now - new Date(createdAt).getTime() < NEW_DAYS * 24 * 60 * 60 * 1000;

    return (
        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Heading
                    variant="small"
                    title="Recursos administrativos"
                    description="Todos los documentos publicados por la administración, los docentes y las empresas."
                />
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={refresh}
                        disabled={refreshing}
                    >
                        <RefreshCw
                            className={cn(refreshing && 'animate-spin')}
                        />
                        Actualizar
                    </Button>
                    <Button onClick={() => setIsSheetOpen(true)}>
                        <Plus /> Nuevo recurso
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Recursos publicados
                        </CardTitle>
                        <FolderOpen className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{resources.length}</p>
                        <p className="text-xs text-muted-foreground">
                            Disponibles en el semestre
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Subidos por administración
                        </CardTitle>
                        <ShieldCheck className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {originCounts.admin}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Gestión institucional
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Subidos por docentes
                        </CardTitle>
                        <GraduationCap className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {originCounts.teacher}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Material de sus secciones
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Subidos por empresas
                        </CardTitle>
                        <Building2 className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {originCounts.company}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Documentos de prácticas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {resources.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-2xl border border-dashed bg-muted/20 py-16 text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <UploadCloud className="size-8" />
                    </div>
                    <div className="space-y-1.5">
                        <h2 className="text-xl font-semibold">
                            Aún no hay recursos publicados
                        </h2>
                        <p className="max-w-md text-sm text-muted-foreground">
                            Sube el primer manual, formato o reglamento para que
                            estudiantes y docentes puedan consultarlo.
                        </p>
                    </div>
                    <Button onClick={() => setIsSheetOpen(true)}>
                        <Plus /> Subir primer recurso
                    </Button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {(
                                [
                                    { value: 'all', label: 'Todos' },
                                    { value: 'admin', label: 'Administración' },
                                    { value: 'teacher', label: 'Docentes' },
                                    { value: 'company', label: 'Empresas' },
                                ] as { value: Origin; label: string }[]
                            )
                                .filter(
                                    (origin) =>
                                        origin.value === 'all' ||
                                        originCounts[origin.value] > 0,
                                )
                                .map((origin) => {
                                    const active =
                                        originFilter === origin.value;

                                    return (
                                        <button
                                            key={origin.value}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() =>
                                                setOriginFilter(origin.value)
                                            }
                                            className={cn(
                                                'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 motion-reduce:transition-none',
                                                active
                                                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                                    : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                                            )}
                                        >
                                            {origin.label}
                                            <span
                                                className={cn(
                                                    'rounded-full px-1.5 text-xs tabular-nums transition-colors',
                                                    active
                                                        ? 'bg-primary-foreground/20'
                                                        : 'bg-muted',
                                                )}
                                            >
                                                {originCounts[origin.value]}
                                            </span>
                                        </button>
                                    );
                                })}

                            {levelCounts.size > 1 &&
                                Object.entries(LEVELS)
                                    .map(([value, config]) => ({
                                        value: Number(value),
                                        label: config.label,
                                        count:
                                            levelCounts.get(Number(value)) ?? 0,
                                    }))
                                    .filter((level) => level.count > 0)
                                    .map((level) => {
                                        const active =
                                            levelFilter === level.value;

                                        return (
                                            <button
                                                key={level.label}
                                                type="button"
                                                aria-pressed={active}
                                                onClick={() =>
                                                    setLevelFilter(
                                                        active
                                                            ? null
                                                            : level.value,
                                                    )
                                                }
                                                className={cn(
                                                    'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 motion-reduce:transition-none',
                                                    active
                                                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                                        : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                                                )}
                                            >
                                                {level.label}
                                                <span
                                                    className={cn(
                                                        'rounded-full px-1.5 text-xs tabular-nums transition-colors',
                                                        active
                                                            ? 'bg-primary-foreground/20'
                                                            : 'bg-muted',
                                                    )}
                                                >
                                                    {level.count}
                                                </span>
                                            </button>
                                        );
                                    })}
                        </div>

                        <div className="relative w-full max-w-md">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar por nombre, autor o tipo…"
                                aria-label="Buscar recursos"
                                className="h-10 pr-10 pl-9"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    aria-label="Borrar búsqueda"
                                    className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 animate-in items-center justify-center rounded-full text-muted-foreground transition-colors fade-in zoom-in hover:bg-muted hover:text-foreground"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>

                        <p
                            aria-live="polite"
                            className="text-sm text-muted-foreground"
                        >
                            {hasFilters
                                ? `${filtered.length} de ${resources.length} recursos`
                                : `${resources.length} ${resources.length === 1 ? 'recurso' : 'recursos'}`}
                        </p>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-16 text-center">
                            <div className="flex size-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
                                <SearchX className="size-9" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-xl font-semibold">
                                    No encontramos coincidencias
                                </h3>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    Prueba con otra palabra o quita los filtros
                                    aplicados.
                                </p>
                            </div>
                            <Button variant="outline" onClick={clearFilters}>
                                <X />
                                Quitar búsqueda y filtros
                            </Button>
                        </div>
                    ) : (
                        <div
                            key={`${originFilter}-${levelFilter ?? 'all'}-${query.trim()}`}
                            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {filtered.map((resource, index) => (
                                <ResourceCard
                                    key={resource.id}
                                    resource={resource}
                                    index={index}
                                    isNew={isNewResource(resource.created_at)}
                                    onEdit={() => setResourceToEdit(resource)}
                                    onDelete={() =>
                                        setResourceToDelete(resource)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            <CreateResourceSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                documentTypes={documentTypes}
                roles={roles}
                faculties={faculties}
                initialFilters={initialFilters}
            />

            <DeleteResourceAlert
                fres={resourceToDelete}
                isOpen={!!resourceToDelete}
                onClose={() => setResourceToDelete(null)}
            />

            <EditResourceSheet
                resource={resourceToEdit}
                open={!!resourceToEdit}
                onOpenChange={(open) => !open && setResourceToEdit(null)}
            />
        </div>
    );
}
