import type { DocumentTypeOption } from '@/modules/documents/types';
import InputError from '@/shared/components/input-error';

import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

interface DocumentTypeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingDoc: DocumentTypeOption | null;
    roles: Array<{ id: number; name: string }>;
    data: { name: string; code: string; description: string; roles: number[] };
    setData: (
        key: 'name' | 'code' | 'description' | 'roles',
        value: string | number[],
    ) => void;
    errors: Partial<Record<'name' | 'code' | 'description' | 'roles', string>>;
    processing: boolean;
}

export function DocumentTypeForm({
    isOpen,
    onClose,
    onSubmit,
    editingDoc,
    roles,
    data,
    setData,
    errors,
    processing,
}: DocumentTypeFormProps) {
    const handleRoleToggle = (roleId: number) => {
        const currentRoles = data.roles || [];
        if (currentRoles.includes(roleId)) {
            setData(
                'roles',
                currentRoles.filter((id: number) => id !== roleId),
            );
        } else {
            setData('roles', [...currentRoles, roleId]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {editingDoc
                                ? 'Editar Tipo de Documento'
                                : 'Registrar Nuevo Documento'}
                        </DialogTitle>
                        <DialogDescription>
                            Define los campos necesarios para este tipo de
                            documento.
                        </DialogDescription>
                    </DialogHeader>

                    {editingDoc && (
                        <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                            <strong>Precaución:</strong> Modificar el código o
                            remover roles de un documento en uso podría
                            ocasionar comportamientos inesperados en el sistema.
                        </div>
                    )}

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Ej: Carta u Oficio"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="code">Código (Único)</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                                placeholder="Ej: OFICIO_MULTIPLE"
                            />
                            <InputError message={errors.code} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                Descripción (Opcional)
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Breve detalle sobre su uso..."
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="mt-2 grid gap-2">
                            <Label>Roles Compatibles</Label>
                            <div className="mt-1 flex flex-col gap-2">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={`role-${role.id}`}
                                            checked={data.roles.includes(
                                                role.id,
                                            )}
                                            onCheckedChange={() =>
                                                handleRoleToggle(role.id)
                                            }
                                        />
                                        <label
                                            htmlFor={`role-${role.id}`}
                                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {role.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.roles} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
