import FileHistory from '@/modules/documents/components/FileHistory';
import SubmissionForm from '@/modules/documents/components/submission-form';
import type { DocumentRequirement } from '@/modules/documents/types';
import { SectionCard } from '@/shared/components/ui/section-card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/shared/components/ui/tabs';

interface Props {
    status?: number;
    currentRequirement: DocumentRequirement | null;
    tempFile: File | null;
    isEditing: boolean;
    onSetEditing: (val: boolean) => void;
    onRemoveTemp: () => void;
    uploading: boolean;
    showFileInfo?: {
        name?: string;
        meta?: string;
        size?: string | number;
        grade?: number;
    };
    onSubmit: () => void;
    children?: React.ReactNode;
}

export function SubmissionPanel({
    currentRequirement,
    tempFile,
    isEditing,
    onSetEditing,
    onRemoveTemp,
    uploading,
    showFileInfo,
    onSubmit,
    children,
}: Props) {
    // 1. Resolvemos qué existe en DB vs si estamos enviando uno nuevo
    const hasExistingDocument = !!currentRequirement?.latest;

    // 2. Extraemos la información relevante en un plano seguro
    const existingFileInfo = hasExistingDocument
        ? {
              name:
                  showFileInfo?.name ||
                  currentRequirement?.latest?.name ||
                  'Archivo adjunto',
              meta: showFileInfo?.meta || 'Documento adjunto',
              grade: currentRequirement?.latest?.grade,
              observationMsg:
                  currentRequirement?.latest?.comment ||
                  currentRequirement?.latest?.justification,
          }
        : undefined;

    return (
        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-64 xl:w-72">
            {/* Shadcn Tabs Card */}
            <Tabs defaultValue="detail" className="w-full">
                <SectionCard>
                    <SectionCard.Header>
                        <TabsList className="grid w-full grid-cols-2 gap-1 rounded-lg p-0">
                            <TabsTrigger
                                value="detail"
                                className="flex-1 rounded-lg text-xs font-semibold transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                            >
                                Detalle
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="flex-1 rounded-lg text-xs font-semibold transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                            >
                                Historial
                            </TabsTrigger>
                        </TabsList>
                    </SectionCard.Header>
                    <SectionCard.Body>
                        <TabsContent value="detail" className="m-0">
                            <SubmissionForm
                                status={currentRequirement?.status || 0}
                                hasExistingDocument={hasExistingDocument}
                                isEditing={isEditing}
                                isUploading={uploading}
                                existingFileInfo={existingFileInfo}
                                tempFile={tempFile}
                                onSave={onSubmit}
                                onSetEditing={onSetEditing}
                                onCancelForm={() => {
                                    onSetEditing(false);
                                    onRemoveTemp();
                                }}
                            >
                                {children}
                            </SubmissionForm>
                        </TabsContent>
                        <TabsContent value="history" className="m-0">
                            <FileHistory
                                history={currentRequirement?.history ?? []}
                            />
                        </TabsContent>
                    </SectionCard.Body>
                </SectionCard>
            </Tabs>
        </div>
    );
}
