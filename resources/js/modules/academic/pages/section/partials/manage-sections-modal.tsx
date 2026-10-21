import { router } from '@inertiajs/react';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Plus, X } from 'lucide-react';
import { store, destroy } from '@/routes/academic/sections';
import type { School } from '@/shared/types';

interface Props {
    school: School | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const AVAILABLE_SECTION_NAMES = ['A', 'B', 'C', 'D'];

export default function ManageSectionsModal({ school, open, onOpenChange }: Props) {
    if (!school) return null;

    const currentSections = school.sections || [];
    const currentNames = currentSections.map(s => s.name);
    const pendingNames = AVAILABLE_SECTION_NAMES.filter(name => !currentNames.includes(name));

    const handleAdd = (name: string) => {
        router.post(store({ school: school.id }).url, { name }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleRemove = (sectionId: number) => {
        router.delete(destroy({ section: sectionId }).url, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Gestionar Secciones</DialogTitle>
                    <DialogDescription>
                        Añade o quita secciones para <span className="font-bold text-foreground">{school.name}</span> en el semestre actual.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* List Current Sections */}
                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Secciones Actuales
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {currentSections.length > 0 ? (
                                currentSections.map((section) => (
                                    <Badge
                                        key={section.id}
                                        variant="outline"
                                        className="flex items-center gap-1.5 py-1.5 pl-3 pr-1 text-sm font-semibold"
                                    >
                                        Sección {section.name}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemove(section.id)}
                                            className="h-5 w-5 rounded-full hover:bg-destructive hover:text-white"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm italic text-muted-foreground">
                                    No hay secciones asignadas.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Add New Sections */}
                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Añadir Sección
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {pendingNames.length > 0 ? (
                                pendingNames.map((name) => (
                                    <Button
                                        key={name}
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleAdd(name)}
                                        className="flex items-center gap-1.5 font-bold hover:bg-black hover:text-white"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        {name}
                                    </Button>
                                ))
                            ) : (
                                <p className="text-sm italic text-muted-foreground">
                                    Todas las secciones posibles han sido añadidas.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
