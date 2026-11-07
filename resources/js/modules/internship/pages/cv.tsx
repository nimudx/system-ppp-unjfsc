import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ExternalLink,
    FileCheck2,
    FileText,
    Upload,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';

import { formatDateTime } from '@/modules/documents/components/dossier-shared';
import ConfirmDeleteDialog from '@/shared/components/confirm-delete-dialog';
import Heading from '@/shared/components/heading';
import PageContainer from '@/shared/components/page-container';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import AppLayout from '@/shared/layouts/app-layout';

type CvFile = {
    id: number;
    name: string;
    path: string | null;
    approval_status: number;
    comment: string | null;
    created_at: string | null;
    updated_at: string | null;
};

type Props = {
    cv: CvFile | null;
};

const MAX_SIZE_MB = 10;

export default function StudentCv({ cv }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const submit = () => {
        if (!file) return;

        router.post(
            '/internship/cv',
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => {
                    setProcessing(true);
                    setError(null);
                },
                onSuccess: () => {
                    setConfirmOpen(false);
                    setFile(null);
                },
                onError: (errors) => {
                    setError(
                        errors.file ??
                            'No se pudo subir el CV. Inténtalo nuevamente.',
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const handleSubmit = () => {
        if (!file) return;

        if (cv) {
            setConfirmOpen(true);

            return;
        }

        submit();
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Mi CV', href: '/internship/cv' }]}>
            <Head title="Mi CV" />

            <PageContainer>
                <Heading
                    variant="small"
                    title="Mi CV"
                    description="Adjunta tu currículum vitae para completar tu perfil de prácticas. Solo puedes tener un CV vigente."
                />

                <div className="w-full max-w-2xl">
                    <SectionCard>
                        <SectionCard.Header>
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                    <UserRound className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Currículum vitae
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Formato PDF, DOC o DOCX · hasta{' '}
                                        {MAX_SIZE_MB} MB
                                    </p>
                                </div>
                            </div>
                        </SectionCard.Header>

                        <SectionCard.Body className="space-y-5">
                            {cv ? (
                                <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                                        <FileCheck2 className="size-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {cv.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Actualizado el{' '}
                                            {formatDateTime(
                                                cv.updated_at ?? cv.created_at,
                                            ) ?? 'fecha no registrada'}
                                        </p>
                                    </div>
                                    {cv.path && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <a
                                                href={cv.path}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <ExternalLink className="mr-2 size-4" />
                                                Ver CV
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                    Aún no has subido tu CV.
                                </div>
                            )}

                            <label
                                htmlFor="cv-file"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
                            >
                                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                    <Upload className="size-6" />
                                </div>
                                <p className="text-sm font-medium">
                                    {cv
                                        ? 'Reemplazar mi CV'
                                        : 'Selecciona tu CV'}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Haz clic aquí para elegir un archivo de tu
                                    equipo.
                                </p>
                                <input
                                    id="cv-file"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="sr-only"
                                    onChange={(event) => {
                                        setError(null);
                                        setFile(
                                            event.target.files?.[0] ?? null,
                                        );
                                        event.target.value = '';
                                    }}
                                />
                            </label>

                            {file && (
                                <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
                                    <FileText className="size-6 shrink-0 text-primary" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(
                                                2,
                                            )}{' '}
                                            MB
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFile(null)}
                                    >
                                        Quitar
                                    </Button>
                                </div>
                            )}

                            {error && (
                                <p className="text-xs text-destructive">
                                    {error}
                                </p>
                            )}

                            <Button
                                className="w-full"
                                disabled={!file || processing}
                                onClick={handleSubmit}
                            >
                                <Upload className="mr-2 size-4" />
                                {processing
                                    ? 'Subiendo…'
                                    : cv
                                      ? 'Reemplazar CV'
                                      : 'Subir CV'}
                            </Button>

                            <p className="text-xs text-muted-foreground">
                                Solo puedes tener un CV en el sistema. Al
                                reemplazarlo, el archivo anterior se elimina
                                permanentemente.
                            </p>
                        </SectionCard.Body>
                    </SectionCard>
                </div>
            </PageContainer>

            <ConfirmDeleteDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="¿Reemplazar tu CV actual?"
                description={
                    <>
                        Esta acción es permanente. El CV que tienes registrado (
                        {cv?.name ?? 'actual'}) se eliminará y no podrás
                        recuperarlo. Se guardará únicamente el archivo que
                        acabas de seleccionar.
                    </>
                }
                confirmLabel="Sí, reemplazar"
                processing={processing}
                icon={AlertTriangle}
                onConfirm={() => submit()}
            />
        </AppLayout>
    );
}
