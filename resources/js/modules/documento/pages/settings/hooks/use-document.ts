import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

export type DocumentType = {
    id: number;
    name: string;
    code: string;
    description: string;
    roles: Array<{ id: number; name: string }>;
};

export function useDocumentSetup() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<DocumentType | null>(null);
    const [deletingDoc, setDeletingDoc] = useState<DocumentType | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        description: '',
        roles: [] as number[],
    });

    const openCreate = () => {
        setEditingDoc(null);
        reset();
        clearErrors();
        setIsFormOpen(true);
    };

    const openEdit = (doc: DocumentType) => {
        setEditingDoc(doc);
        setData({
            name: doc.name,
            code: doc.code,
            description: doc.description || '',
            roles: doc.roles.map(r => r.id),
        });
        clearErrors();
        setIsFormOpen(true);
    };

    const openDelete = (doc: DocumentType) => {
        setDeletingDoc(doc);
        setIsDeleteDialogOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        reset();
        clearErrors();
    };

    const closeDelete = () => {
        setIsDeleteDialogOpen(false);
        setDeletingDoc(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingDoc) {
            put(`/settings/document/${editingDoc.id}`, {
                onSuccess: () => {
                    closeForm();
                },
                onError: () => {
                    toast.error('Corrige los errores antes de continuar.');
                }
            });
        } else {
            post('/settings/document', {
                onSuccess: () => {
                    closeForm();
                },
                onError: () => {
                    toast.error('Corrige los errores antes de continuar.');
                }
            });
        }
    };

    const confirmDelete = () => {
        if (!deletingDoc) return;

        destroy(`/settings/document/${deletingDoc.id}`, {
            onSuccess: () => {
                closeDelete();
            },
            onError: () => {
                toast.error('Ocurrió un error al eliminar el documento.');
            }
        });
    };

    return {
        isFormOpen,
        setIsFormOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        editingDoc,
        deletingDoc,
        openCreate,
        openEdit,
        openDelete,
        closeForm,
        closeDelete,
        handleSubmit,
        confirmDelete,
        form: { data, setData, processing, errors }
    };
}
