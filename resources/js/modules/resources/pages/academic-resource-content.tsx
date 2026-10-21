import { usePage } from "@inertiajs/react";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, FileText, Download, FileArchive, File, MoreVertical, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Heading from "@/shared/components/heading";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSubTrigger } from "@/shared/components/ui/dropdown-menu";
import { CreateResourceSheet } from "./partials/create-resource-sheet";
import { DeleteResourceAlert } from "./partials/delete-resource-alert";
import { EditResourceSheet } from "./partials/edit-resource-sheet";

// Interfaces para tipar nuestros recursos
interface DocumentType {
    name: string;
}

interface ResourceDoc {
    id: number;
    path: string;
    name?: string;
    type: DocumentType;
}

interface ResourceItem {
    id: number;
    name: string;
    description: string;
    level: number;
    documents?: ResourceDoc[];
    created_at?: string;
}

interface PageProps {
    resources: ResourceItem[];
    documentTypes: any[];
    roles: any[];
    faculties: any[];
    initialFilters: any;
}

export default function AcademicResourceContent(props: PageProps) {
    const { role } = usePage().props as any;
    const { resources, documentTypes, roles, faculties, initialFilters } = props;

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [resourceToEdit, setResourceToEdit] = useState<ResourceItem | null>(null);
    const [resourceToDelete, setResourceToDelete] = useState<ResourceItem | null>(null);
    const isAuthorized = ![4, 5].includes(role);

    // Helper para pintar el Badge según el nivel del recurso
    const getLevelBadge = (level: number) => {
        switch (level) {
            case 1: return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">Global</Badge>;
            case 2: return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">Facultad</Badge>;
            case 3: return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">Escuela</Badge>;
            case 4: return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20">Sección</Badge>;
            case 5: return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20">Empresa</Badge>;
            default: return <Badge variant="outline">Desconocido</Badge>;
        }
    };

    // Helper para iconos según extensión (simulado)
    const getFileIcon = (doc?: ResourceDoc) => {
        const typeName = doc?.type?.name?.toLowerCase() || '';
        if (typeName.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
        if (typeName.includes('zip') || typeName.includes('rar')) return <FileArchive className="h-8 w-8 text-yellow-500" />;
        return <File className="h-8 w-8 text-blue-500" />;
    };

    // MOCKS: Si el backend todavía no envía nada, mostramos esto de ejemplo.
    const displayList = resources.length > 0 ? resources : [
        { id: 1, name: "Reglamento General PPP", description: "Documento oficial de la universidad para el año en curso.", level: 1, created_at: new Date().toISOString() },
        { id: 2, name: "Formato de Anexo 03", description: "Plantilla en Word para presentar el plan de prácticas.", level: 3, created_at: new Date().toISOString() },
        { id: 3, name: "Horarios de Sustentación", description: "Cronograma exclusivo para tu sección.", level: 4, created_at: new Date().toISOString() },
        { id: 4, name: "Convenio Marco 45-A", description: "Ejemplo de convenio válido para tu facultad.", level: 2, created_at: new Date().toISOString() },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto relative">
            {/* Cabecera */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6 border-b border-sidebar-border">
                <Heading
                    variant="small"
                    title="Recursos Académicos"
                    description="Manuales, plantillas y documentos importantes para tus prácticas."
                />
                {isAuthorized && (
                    <Button
                        onClick={() => setIsSheetOpen(true)}
                        className="mt-4 text-sm font-semibold shadow-sm md:mt-0"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Recurso
                    </Button>
                )}
            </div>

            {/* Listado de Recursos en Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayList.map((res: any) => (
                    <div
                        key={res.id}
                        className="group flex flex-col justify-between bg-card text-card-foreground rounded-xl border border-sidebar-border shadow-sm overflow-hidden hover:shadow-md hover:border-sidebar-border/80 transition-all duration-200"
                    >
                        {/* Area de contenido */}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-muted/50 rounded-lg group-hover:scale-105 transition-transform">
                                    {getFileIcon(res.documents?.[0])}
                                </div>
                                {getLevelBadge(res.level)}
                                {isAuthorized && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setResourceToEdit(res)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setResourceToDelete(res)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            <h3 className="font-semibold text-base leading-tight mb-2 line-clamp-2">
                                {res.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {res.description || "Sin descripción disponible."}
                            </p>
                        </div>

                        {/* Area inferior (Botón descargas) */}
                        <div className="p-4 border-t border-sidebar-border/50 bg-muted/20 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium">
                                {format(new Date(res.created_at), "d 'de' MMMM, p", { locale: es }) || 'Reciente'}
                            </span>
                            <div className="flex items-center gap-1">
                                {res.documents?.[0]?.path ? (
                                    <>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-600 transition-colors" asChild title="Abrir en nueva pestaña">
                                            <a href={`/storage/${res.documents[0].path}`} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                                <span className="sr-only">Abrir</span>
                                            </a>
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-8 gap-2 hover:bg-blue-500/10 hover:text-blue-600 transition-colors" asChild title="Descargar archivo">
                                            <a href={`/storage/${res.documents[0].path}`} download={res.documents[0].name || 'documento'}>
                                                <Download className="h-4 w-4" />
                                                <span className="sr-only sm:not-sr-only text-xs">Descargar</span>
                                            </a>
                                        </Button>
                                    </>
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">Sin archivo</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State por si borras los mocks y está vacío */}
            {displayList.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl border-sidebar-border">
                    <FileArchive className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium text-lg mb-1">No hay recursos disponibles</h3>
                    <p className="text-sm text-muted-foreground">En este momento no hay manuales o plantillas asignadas a tu perfil.</p>
                </div>
            )}

            {/* Formulario Sheet de Creación */}
            <CreateResourceSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                documentTypes={documentTypes}
                roles={roles}
                faculties={faculties}
                initialFilters={initialFilters}
            />

            {/* Modal de confirmación para eliminar */}
            <DeleteResourceAlert
                fres={resourceToDelete}
                isOpen={!!resourceToDelete}
                onClose={() => setResourceToDelete(null)}
            />

            {/* Sheet para edición rápida */}
            <EditResourceSheet
                resource={resourceToEdit}
                open={!!resourceToEdit}
                onOpenChange={(open) => !open && setResourceToEdit(null)}
            />
        </div>
    );
}