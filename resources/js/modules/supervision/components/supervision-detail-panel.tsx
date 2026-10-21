import { ChevronRight, FileText, User, X, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RequirementsList, DocumentViewer, DetailHeader } from '@/modules/documents';
import type { StudentSupervision } from '@/modules/supervision/types';
import { SectionCard } from '@/shared/components/ui/section-card';

interface SupervisionDetailPanelProps {
    selectedItem: StudentSupervision;
    selectedModuleId: number;
    annexes: any[];
    isLoading: boolean;
    onClose: () => void;
    selectedIdx: number;
    onSelectIdx: (idx: number) => void;
    canUpload?: boolean;
    onUpload?: (file: File) => void;
    tempFile?: File | null;
    renderActionForm: (annex: any) => React.ReactNode;
    actionTitle?: string;
}

export default function SupervisionDetailPanel({
    selectedItem,
    selectedModuleId,
    annexes,
    isLoading,
    onClose,
    selectedIdx,
    onSelectIdx,
    canUpload = false,
    onUpload = () => { },
    tempFile = null,
    renderActionForm,
    actionTitle = "Validación"
}: SupervisionDetailPanelProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (tempFile) {
            const url = URL.createObjectURL(tempFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [tempFile]);

    const [previewEnabled, setPreviewEnabled] = useState(false);

    const currentAnnex = annexes[selectedIdx];

    return (
        <div className="flex h-full flex-1 flex-col overflow-hidden">
            <DetailHeader
                selectedItem={selectedItem}
                handleCloseSelected={onClose}
            >
                •
                <span className="font-bold">Módulo {selectedModuleId}</span>
            </DetailHeader>

            <div className="flex-1 flex gap-6 mt-4 overflow-hidden relative pr-1">
                {isLoading ? (
                    <div className="flex flex-1 items-center justify-center animate-pulse text-muted-foreground font-medium">
                        Cargando información del estudiante...
                    </div>
                ) : (
                    <>
                        {/* 2. Cuerpo Central: Document Viewer */}
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <SectionCard>
                                <SectionCard.Header>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex size-8 items-center justify-center rounded-md border ${tempFile || currentAnnex?.latest ? 'border-primary/20 bg-primary/10' : 'bg-muted/50'}`}>
                                                <FileText className={`size-4 ${tempFile || currentAnnex?.latest ? 'text-primary' : 'text-muted-foreground'}`} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold leading-none tracking-tight">
                                                    {currentAnnex?.title || 'Seleccionar anexo'}
                                                </span>
                                                <span className="mt-1 text-[10px] text-muted-foreground font-medium uppercase">
                                                    {tempFile ? 'Vista previa local' : currentAnnex?.latest ? 'Archivo cargado' : 'Sin archivo'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setPreviewEnabled((p) => !p)}
                                            className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:text-primary uppercase tracking-tighter"
                                        >
                                            {previewEnabled ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            {previewEnabled ? 'Ocultar' : 'Previsualizar'}
                                        </button>
                                    </div>
                                </SectionCard.Header>
                                <SectionCard.Body>
                                    <DocumentViewer
                                        currentFile={tempFile ? { ...currentAnnex, latest: { path: previewUrl, name: tempFile.name } } : (currentAnnex ? { ...currentAnnex, latest: currentAnnex.latest } : { code: '', title: '', latest: null })}
                                        canUpload={canUpload}
                                        onUpload={onUpload}
                                        previewEnabled={previewEnabled}
                                    />
                                </SectionCard.Body>
                            </SectionCard>
                        </div>

                        {/* 3. Panel Lateral: Lista y Panel Inyectado (Submission/Validation) */}
                        <aside className="hidden md:flex w-64 shrink-0 flex-col gap-4 xl:w-72 overflow-hidden">
                            <RequirementsList
                                requirements={annexes}
                                selectedType={selectedIdx}
                                onSelectType={onSelectIdx}
                                previewEnabled={previewEnabled}
                                onTogglePreview={() => setPreviewEnabled(!previewEnabled)}
                            />

                            {/* El Form/Panel se inyecta directamente, ya que traen sus propios Tabs */}
                            {currentAnnex && renderActionForm(currentAnnex)}
                        </aside>
                    </>
                )}
            </div>
        </div>
    );
}