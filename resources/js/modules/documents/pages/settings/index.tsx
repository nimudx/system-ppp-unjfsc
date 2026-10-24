import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Heading from '@/shared/components/heading';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import AppLayout from '@/shared/layouts/app-layout';
import AcademicSettingsLayout from '@/shared/layouts/settings/academic-settings-layout';

import { DocumentTypeForm } from './components/DocumentTypeForm';
import { DocumentTypeTable } from './components/DocumentTypeTable';
import type { DocumentType } from './hooks/use-document';
import { useDocumentSetup } from './hooks/use-document';

interface Props {
    documentTypes: DocumentType[];
    roles: Array<{ id: number; name: string }>;
}

export default function DocumentSettingsIndex({ documentTypes, roles }: Props) {
    const {
        isFormOpen,
        isDeleteDialogOpen,
        editingDoc,
        deletingDoc,
        openCreate,
        openEdit,
        openDelete,
        closeForm,
        closeDelete,
        handleSubmit,
        confirmDelete,
        form: { data, setData, processing, errors },
    } = useDocumentSetup();

    const breadcrumbs = [
        { title: 'Panel', href: '/dashboard' },
        { title: 'Configuraciones', href: '/settings/internship' },
        { title: 'Tipos de Documentos', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de Documentos" />

            <AcademicSettingsLayout>
                <div className="flex flex-1 flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <Heading
                            variant="small"
                            title="Tipos de Documentos"
                            description="Gestiona los tipos de documentos requeridos y para quiénes aplican."
                        />
                        <Button onClick={openCreate} className="gap-2">
                            <Plus className="h-4 w-4" /> Registrar Documento
                        </Button>
                    </div>

                    <DocumentTypeTable
                        documents={documentTypes}
                        onEdit={openEdit}
                        onDelete={openDelete}
                    />

                    {/* Formulario Modal para Crear/Editar */}
                    <DocumentTypeForm
                        isOpen={isFormOpen}
                        onClose={closeForm}
                        onSubmit={handleSubmit}
                        editingDoc={editingDoc}
                        roles={roles}
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                    />

                    {/* Alerta de Eliminación */}
                    <AlertDialog
                        open={isDeleteDialogOpen}
                        onOpenChange={closeDelete}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    ¿Eliminar tipo de documento?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Estás a punto de eliminar el documento "
                                    {deletingDoc?.name}".
                                    <br />
                                    <br />
                                    <strong>Precaución:</strong> Si este
                                    documento ya se está usando en expedientes
                                    activos, podría causar pérdida de
                                    accesibilidad de archivos vinculados. Esta
                                    acción no se puede deshacer.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={confirmDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Sí, eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </AcademicSettingsLayout>
        </AppLayout>
    );
}
