import FileHistory from "@/shared/components/document/FileHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { SectionCard } from "@/shared/components/ui/section-card";
import SubmissionForm from "@/shared/components/academic/submission-form";

interface Props {
    status?: number;
    currentRequirement: any;
    tempFile: File | null;
    isEditing: boolean;
    onSetEditing: (val: boolean) => void;
    onRemoveTemp: () => void;
    uploading: boolean;
    showFileInfo?: {
        name?: string;
        meta?: string;
        size?: string;
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
    const existingFileInfo = hasExistingDocument ? {
        name: showFileInfo?.name || currentRequirement?.latest?.name || 'Archivo adjunto',
        meta: showFileInfo?.meta || 'Documento adjunto',
        grade: currentRequirement?.latest?.grade,
        observationMsg: currentRequirement?.latest?.comment || currentRequirement?.latest?.justification,
    } : undefined;

    return (
        <div className="w-full lg:w-64 xl:w-72 flex flex-col gap-4 shrink-0">
            {/* Shadcn Tabs Card */}
            <Tabs defaultValue="detail" className="w-full">
                <SectionCard>
                    <SectionCard.Header>
                        <TabsList className="grid w-full grid-cols-2 gap-1 p-0 rounded-lg">
                            <TabsTrigger value="detail"
                                className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none transition-colors"
                            >Detalle</TabsTrigger>
                            <TabsTrigger value="history"
                                className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none transition-colors"
                            >Historial</TabsTrigger>
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
                            <FileHistory history={currentRequirement?.history} />
                        </TabsContent>
                    </SectionCard.Body>
                </SectionCard>
            </Tabs>
        </div>
    );
}
