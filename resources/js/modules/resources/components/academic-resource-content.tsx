import { router, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { LucideIcon } from 'lucide-react';
import {
    Download,
    ExternalLink,
    File,
    FileArchive,
    FileImage,
    FileSpreadsheet,
    FileText,
    FolderOpen,
    MoreVertical,
    Pencil,
    Plus,
    Presentation,
    RefreshCw,
    Search,
    SearchX,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
    ResourceItem,
    ResourcePageProps,
} from '@/modules/resources/types';

import Heading from '@/shared/components/heading';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import { ROLES } from '@/shared/config/roles';
import { cn } from '@/shared/lib/utils';
import { CreateResourceSheet } from './create-resource-sheet';
import { DeleteResourceAlert } from './delete-resource-alert';
import { EditResourceSheet } from './edit-resource-sheet';

type PageProps = ResourcePageProps;
type ResourceDocument = NonNullable<ResourceItem['documents']>[number];

/* -------------------------------------------------------------------------- */
/*  Configuración visual                                                      */
/* -------------------------------------------------------------------------- */

const NEW_DAYS = 7;

/** Alcance del recurso: a quién le llega. */
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

/** Detecta el tipo por la extensión real del archivo, no por el nombre del tipo documental. */
function getFileKind(doc?: ResourceDocument): FileKind {
    const source = doc?.path ?? doc?.name ?? '';
    const extension = source.split('.').pop()?.toLowerCase() ?? '';

    return FILE_KINDS[EXTENSIONS[extension] ?? 'other'];
}

/* -------------------------------------------------------------------------- */
/*  Estados vacíos                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Tres hojas apiladas que flotan; al pasar el cursor se abren como abanico.
 * Los keyframes viven aquí para no tocar app.css; respetan "reducir movimiento".
 */
function PaperStack() {
    return (
        <div className="group relative mx-auto h-60 w-72 select-none">
            <style>{`
                @keyframes resource-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .resource-float { animation: none !important; }
                }
            `}</style>

            <div
                className="resource-float relative h-full w-full"
                style={{ animation: 'resource-float 5s ease-in-out infinite' }}
            >
                <div className="absolute top-8 left-10 h-44 w-48 -rotate-6 rounded-2xl border bg-card shadow-sm transition-transform duration-500 ease-out group-hover:-translate-x-6 group-hover:-rotate-12" />
                <div className="absolute top-6 left-14 h-44 w-48 rotate-3 rounded-2xl border bg-card shadow-sm transition-transform duration-500 ease-out group-hover:translate-x-6 group-hover:rotate-12" />

                <div className="absolute top-3 left-12 w-48 space-y-3 rounded-2xl border bg-card p-4 shadow-lg transition-transform duration-500 ease-out group-hover:-translate-y-2">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="size-5" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <div className="h-2 w-4/5 rounded-full bg-muted" />
                            <div className="h-2 w-1/2 rounded-full bg-muted/70" />
                        </div>
                    </div>
                    <div className="space-y-2 pt-1">
                        <div className="h-2 w-full rounded-full bg-muted/70" />
                        <div className="h-2 w-11/12 rounded-full bg-muted/70" />
                        <div className="h-2 w-3/5 rounded-full bg-muted/70" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-primary/15" />
                </div>

                <div className="absolute -top-1 right-8 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/30 [animation-duration:2.8s] motion-reduce:hidden" />
                    <FolderOpen className="relative size-7" />
                </div>
            </div>
        </div>
    );
}

function EmptyLibrary({
    canCreate,
    refreshing,
    onCreate,
    onRefresh,
}: {
    canCreate: boolean;
    refreshing: boolean;
    onCreate: () => void;
    onRefresh: () => void;
}) {
    return (
        <div className="flex flex-1 items-center justify-center py-6">
            <div className="flex w-full max-w-xl animate-in flex-col items-center gap-8 text-center duration-700 zoom-in-95 fade-in motion-reduce:animate-none">
                <PaperStack />

                <div className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        {canCreate
                            ? 'Tu biblioteca está vacía'
                            : 'Aún no hay recursos para ti'}
                    </h2>
                    <p className="mx-auto max-w-md text-base leading-relaxed text-muted-foreground">
                        {canCreate
                            ? 'Sube el primer manual, formato o reglamento. Los estudiantes lo verán aquí apenas lo publiques.'
                            : 'Cuando tu docente o la coordinación publiquen guías, formatos o reglamentos, los encontrarás en esta página.'}
                    </p>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                    {canCreate && (
                        <Button
                            size="lg"
                            onClick={onCreate}
                            className="group/cta transition-transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Plus className="transition-transform duration-300 group-hover/cta:rotate-90" />
                            Subir primer recurso
                        </Button>
                    )}
                    <Button
                        size="lg"
                        variant={canCreate ? 'ghost' : 'default'}
                        onClick={onRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw
                            className={cn(refreshing && 'animate-spin')}
                        />
                        {refreshing ? 'Buscando…' : 'Buscar recursos nuevos'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
    return (
        <div className="flex flex-1 animate-in flex-col items-center justify-center gap-5 py-16 text-center duration-500 zoom-in-95 fade-in motion-reduce:animate-none">
            <div className="flex size-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
                <SearchX className="size-9" />
            </div>
            <div className="space-y-1.5">
                <h3 className="text-xl font-semibold">
                    No encontramos coincidencias
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                    {query
                        ? `Nada coincide con "${query}" en este filtro. Revisa la ortografía o prueba con otra palabra.`
                        : 'No hay recursos en esta categoría todavía.'}
                </p>
            </div>
            <Button variant="outline" onClick={onClear}>
                <X />
                Quitar búsqueda y filtros
            </Button>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Tarjeta de recurso                                                        */
/* -------------------------------------------------------------------------- */

function ResourceCard({
    resource,
    index,
    isNew,
    canManage,
    onEdit,
    onDelete,
}: {
    resource: ResourceItem;
    index: number;
    isNew: boolean;
    canManage: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const document = resource.documents?.[0];
    const url = document?.path ? `/storage/${document.path}` : null;
    const kind = getFileKind(document);
    const level = LEVELS[resource.level] ?? FALLBACK_LEVEL;
    const KindIcon = kind.icon;

    return (
        <article
            className="group relative flex animate-in flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs transition-all duration-300 fill-mode-both fade-in slide-in-from-bottom-2 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg motion-reduce:animate-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
        >
            {/* Franja del alcance: crece al pasar el cursor */}
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

                    {canManage && (
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
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={level.badge}>
                        {level.label}
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

/* -------------------------------------------------------------------------- */
/*  Página                                                                    */
/* -------------------------------------------------------------------------- */

export default function AcademicResourceContent(props: PageProps) {
    const { role } = usePage().props;
    const { resources, documentTypes, roles, faculties, initialFilters } =
        props;

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [resourceToEdit, setResourceToEdit] = useState<ResourceItem | null>(
        null,
    );
    const [resourceToDelete, setResourceToDelete] =
        useState<ResourceItem | null>(null);
    const [query, setQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    // Fijo al montar: mantiene el render puro y estable.
    const [now] = useState(() => Date.now());

    const isAuthorized = role !== ROLES.SUPERVISOR && role !== ROLES.STUDENT;

    const levelCounts = useMemo(() => {
        const counts = new Map<number, number>();
        resources.forEach((r) =>
            counts.set(r.level, (counts.get(r.level) ?? 0) + 1),
        );

        return counts;
    }, [resources]);

    const filtered = useMemo(() => {
        const term = query.trim().toLocaleLowerCase('es');

        return resources.filter((r) => {
            if (levelFilter !== null && r.level !== levelFilter) return false;
            if (!term) return true;

            return (
                r.name.toLocaleLowerCase('es').includes(term) ||
                (r.description ?? '').toLocaleLowerCase('es').includes(term)
            );
        });
    }, [resources, query, levelFilter]);

    const hasFilters = query.trim() !== '' || levelFilter !== null;
    const isEmpty = resources.length === 0;

    const clearFilters = () => {
        setQuery('');
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
            {/* Cabecera */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Heading
                    variant="small"
                    title="Recursos académicos"
                    description="Manuales, plantillas y documentos importantes para tus prácticas."
                />
                {isAuthorized && !isEmpty && (
                    <Button onClick={() => setIsSheetOpen(true)}>
                        <Plus /> Nuevo recurso
                    </Button>
                )}
            </div>

            {isEmpty ? (
                <EmptyLibrary
                    canCreate={isAuthorized}
                    refreshing={refreshing}
                    onCreate={() => setIsSheetOpen(true)}
                    onRefresh={refresh}
                />
            ) : (
                <>
                    {/* Búsqueda y filtros */}
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar por nombre o descripción…"
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

                        {levelCounts.size > 1 && (
                            <div
                                role="group"
                                aria-label="Filtrar por alcance"
                                className="flex flex-wrap gap-2"
                            >
                                {[
                                    {
                                        value: null,
                                        label: 'Todos',
                                        count: resources.length,
                                    },
                                    ...Object.entries(LEVELS)
                                        .map(([value, cfg]) => ({
                                            value: Number(value),
                                            label: cfg.label,
                                            count:
                                                levelCounts.get(
                                                    Number(value),
                                                ) ?? 0,
                                        }))
                                        .filter((l) => l.count > 0),
                                ].map((chip) => {
                                    const active = levelFilter === chip.value;

                                    return (
                                        <button
                                            key={chip.label}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() =>
                                                setLevelFilter(chip.value)
                                            }
                                            className={cn(
                                                'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 motion-reduce:transition-none',
                                                active
                                                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                                    : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                                            )}
                                        >
                                            {chip.label}
                                            <span
                                                className={cn(
                                                    'rounded-full px-1.5 text-xs tabular-nums transition-colors',
                                                    active
                                                        ? 'bg-primary-foreground/20'
                                                        : 'bg-muted',
                                                )}
                                            >
                                                {chip.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <p
                            aria-live="polite"
                            className="text-sm text-muted-foreground"
                        >
                            {hasFilters
                                ? `${filtered.length} de ${resources.length} recursos`
                                : `${resources.length} ${resources.length === 1 ? 'recurso' : 'recursos'}`}
                        </p>
                    </div>

                    {/* Resultados: la key reinicia la entrada al cambiar el filtro */}
                    {filtered.length === 0 ? (
                        <NoResults
                            query={query.trim()}
                            onClear={clearFilters}
                        />
                    ) : (
                        <div
                            key={`${levelFilter ?? 'all'}-${query.trim()}`}
                            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {filtered.map((resource, index) => (
                                <ResourceCard
                                    key={resource.id}
                                    resource={resource}
                                    index={index}
                                    isNew={isNewResource(resource.created_at)}
                                    canManage={isAuthorized}
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
