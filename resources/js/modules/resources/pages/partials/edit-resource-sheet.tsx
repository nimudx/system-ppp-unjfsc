import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";

interface ResourceItem {
    id: number;
    name: string;
    description: string;
}

interface EditResourceSheetProps {
    resource: ResourceItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditResourceSheet({ resource, open, onOpenChange }: EditResourceSheetProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: "",
        description: "",
        file: null as File | null,
        _method: "PUT",
    });

    // Populate form when resource changes
    useEffect(() => {
        if (resource) {
            setData({
                name: resource.name || "",
                description: resource.description || "",
                file: null,
                _method: "PUT",
            });
            clearErrors();
        }
    }, [resource, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resource) return;

        post(`/resource/${resource.id}`, {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
            onError: () => {
                toast.error("Ocurrió un error al actualizar el recurso");
            },
            preserveScroll: true,
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto p-4">
                <SheetHeader className="mb-6">
                    <SheetTitle>Editar Recurso</SheetTitle>
                    <SheetDescription>
                        Actualiza la información básica del recurso. Si no seleccionas un archivo nuevo, se mantendrá el actual.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del recurso <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Ej: Reglamento Interno 2024"
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Breve descripción del contenido del documento..."
                            rows={4}
                        />
                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Archivo de reemplazo (Opcional)</Label>
                        <Input
                            id="file"
                            type="file"
                            onChange={(e) => setData("file", e.target.files ? e.target.files[0] : null)}
                            className="file:text-foreground"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Sube un archivo solo si deseas reemplazar el documento actual.
                        </p>
                        {errors.file && <p className="text-sm text-destructive">{errors.file}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-sidebar-border mt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Guardando..." : "Guardar cambios"}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
