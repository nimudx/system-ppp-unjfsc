import { ExternalLink, FileText } from 'lucide-react';
import { FilePreview } from '@/modules/documents';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';

export default function CvPreviewDialog({
    cv,
    open,
    onOpenChange,
}: {
    cv: { name: string; url: string } | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Vista previa del CV</DialogTitle>
                    <DialogDescription>
                        {cv?.name ?? 'Documento del estudiante'}
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[70vh] overflow-auto rounded-md border">
                    {cv ? (
                        <FilePreview
                            path={cv.url}
                            name={cv.name}
                            previewEnabled
                        />
                    ) : (
                        <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
                            <FileText className="size-4" />
                            El estudiante no tiene un CV registrado en su
                            expediente.
                        </p>
                    )}
                </div>

                {cv && (
                    <DialogFooter>
                        <Button variant="outline" asChild>
                            <a
                                href={cv.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <ExternalLink className="mr-1.5 size-4" />
                                Abrir en una pestaña nueva
                            </a>
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
