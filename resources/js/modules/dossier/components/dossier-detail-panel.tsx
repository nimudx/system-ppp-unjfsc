import { Building2, Eye, EyeOff, FileText, User, X } from "lucide-react";
import { ValidationPanel } from "@/shared/components/academic/validation-panel";
import RequirementsList from "@/shared/components/academic/requirements-list";
import FilePreview from "@/shared/components/document/FilePreview";
import { Button } from "@/shared/components/ui/button";
import { DetailHeader } from "@/shared/components/academic/detail-header";
import { SectionCard } from "@/shared/components/ui/section-card";

interface DossierDetailPanelProps {
    selectedItem: any;
    detail: any;
    selectedType: number;
    setSelectedType: (val: number) => void;
    previewEnabled: boolean;
    setPreviewEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
    handleCloseSelected: () => void;
    handleSaveValidation: (status: number, message: string) => void;
    isSavingValidation: boolean;
}

export default function DossierDetailPanel({
    selectedItem,
    detail,
    selectedType,
    setSelectedType,
    previewEnabled,
    setPreviewEnabled,
    handleCloseSelected,
    handleSaveValidation,
    isSavingValidation,
}: DossierDetailPanelProps) {
    if (!selectedItem) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-semibold">Sin selección</h3>
                    <p className="text-muted-foreground">
                        Selecciona un expediente para ver los detalles.
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <DetailHeader
                selectedItem={selectedItem}
                handleCloseSelected={handleCloseSelected}
            />
            {/* --- CONTENEDOR 2 COLUMNAS (Viewer + Sidebar) --- */}
            <div className="mt-5 flex flex-1 flex-col gap-5 overflow-hidden xl:flex-row">
                <SectionCard className="flex-1">
                    <SectionCard.Header>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex size-8 items-center justify-center rounded-md border ${selectedItem?.requirements?.[selectedType]?.latest ? 'border-primary/20 bg-primary/5' : 'bg-muted/50'}`}
                                >
                                    <FileText
                                        className={`size-4 ${detail?.requirements?.[selectedType]?.latest ? 'text-primary' : 'text-muted-foreground'}`}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm leading-none font-semibold">
                                        {
                                            detail
                                                ?.requirements?.[
                                                selectedType
                                            ]?.title
                                        }
                                    </span>
                                    <span className="mt-1 text-[11px] text-muted-foreground">
                                        {detail
                                            ?.requirements?.[
                                            selectedType
                                        ]?.latest
                                            ? 'Archivo cargado'
                                            : 'Sin archivo'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    setPreviewEnabled((p) => !p)
                                }
                                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {previewEnabled ? (
                                    <EyeOff className="size-4" />
                                ) : (
                                    <Eye className="size-4" />
                                )}
                                <span className="hidden sm:block">
                                    {previewEnabled
                                        ? 'Desactivar'
                                        : 'Previsualizar'}
                                </span>
                            </button>
                        </div>
                    </SectionCard.Header>
                    <SectionCard.Body className="p-0">
                        <FilePreview
                            path={
                                detail?.requirements?.[
                                    selectedType
                                ]?.latest?.path
                            }
                            name={
                                detail?.requirements?.[
                                    selectedType
                                ]?.title || 'Documento adjunto'
                            }
                            previewEnabled={previewEnabled}
                        />
                    </SectionCard.Body>
                </SectionCard>

                {/* COLUMNA 2: PANEL DE CONTROL */}
                <div className="flex h-full w-full shrink-0 flex-col gap-6 overflow-hidden text-foreground not-italic lg:w-64 xl:w-72">
                    {/* Arriba: Lista de Requisitos (Componente Reutilizable) */}

                    <RequirementsList
                        requirements={
                            detail?.requirements ||
                            []
                        }
                        selectedType={selectedType}
                        onSelectType={setSelectedType}
                        previewEnabled={previewEnabled}
                        onTogglePreview={() =>
                            setPreviewEnabled(
                                !previewEnabled,
                            )
                        }
                    />
                    {/* Validation Panel */}
                    <ValidationPanel
                        status={detail?.requirements?.[selectedType]?.status}
                        history={detail?.requirements?.[selectedType]?.history || []}
                        onSuccess={(data) => handleSaveValidation(data.status, data.comment)}
                        isSubmitting={isSavingValidation}
                        hasSelection={!!detail?.requirements?.[selectedType]}
                        showFileInfo={detail?.requirements?.[selectedType]?.latest ? {
                            name: detail?.requirements?.[selectedType]?.title,
                            meta: "Documento adjunto"
                        } : undefined}
                        emptyMessage="Seleccione un requisito para evaluar"
                    />
                </div>
            </div>
        </div>
    );
}