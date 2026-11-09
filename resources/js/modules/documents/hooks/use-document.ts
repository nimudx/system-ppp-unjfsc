import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { DocumentTypeOption } from '@/modules/documents/types';
import documentSettings from '@/routes/settings/academic/document';

export function useDocumentSetup() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<DocumentTypeOption | null>(
        null,
    );
    const [deletingDoc, setDeletingDoc] = useState<DocumentTypeOption | null>(
        null,
    );

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
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

    const openEdit = (doc: DocumentTypeOption) => {
        setEditingDoc(doc);
        setData({
            name: doc.name,
            code: doc.code,
            description: doc.description || '',
            roles: (doc.roles ?? []).map((r) => r.id),
        });
        clearErrors();
        setIsFormOpen(true);
    };

    const openDelete = (doc: DocumentTypeOption) => {
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
            put(documentSettings.update(editingDoc.id).url, {
                onSuccess: () => {
                    closeForm();
                },
                onError: () => {
                    toast.error('Corrige los errores antes de continuar.');
                },
            });
        } else {
            post(documentSettings.store().url, {
                onSuccess: () => {
                    closeForm();
                },
                onError: () => {
                    toast.error('Corrige los errores antes de continuar.');
                },
            });
        }
    };

    const confirmDelete = () => {
        if (!deletingDoc) return;

        destroy(documentSettings.destroy(deletingDoc.id).url, {
            onSuccess: () => {
                closeDelete();
            },
            onError: () => {
                toast.error('Ocurrió un error al eliminar el documento.');
            },
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
        form: { data, setData, processing, errors },
    };
}
