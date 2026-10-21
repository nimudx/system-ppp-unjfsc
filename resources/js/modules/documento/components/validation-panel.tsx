import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { SectionCard } from '@/shared/components/ui/section-card';
import { ValidationForm } from '@/shared/components/academic/validation-form';
import FileHistory from '@/shared/components/document/FileHistory';

export interface ValidationPanelProps {
    status?: number;
    history?: any[];
    onSuccess: (data: { status: number; comment: string }) => void;
    isSubmitting?: boolean;
    showFileInfo?: { name: string; meta?: string; grade?: number };
    hasSelection?: boolean; // Set to false when no element is selected
    emptyMessage?: string;
    children?: React.ReactNode;
    extendForm?: boolean;
}

export function ValidationPanel({
    status,
    history = [],
    onSuccess,
    isSubmitting = false,
    showFileInfo,
    hasSelection = true,
    emptyMessage = "Seleccione un elemento",
    children,
    extendForm = false,
}: ValidationPanelProps) {
    return (
        <Tabs defaultValue="validation" className="w-full">
            <SectionCard>
                <SectionCard.Header>
                    <TabsList className="grid w-full grid-cols-2 p-0 gap-1">
                        <TabsTrigger
                            value="validation"
                            className='text-xs font-bold data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent'
                        >
                            Dictamen
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className='text-xs font-bold data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent'
                        >
                            Historial
                        </TabsTrigger>
                    </TabsList>
                </SectionCard.Header>
                <SectionCard.Body>
                    <TabsContent value="validation">
                        {!hasSelection ? (
                            <div className="py-8 text-center text-muted-foreground italic text-[10px] font-medium uppercase tracking-widest opacity-60">
                                {emptyMessage}
                            </div>
                        ) : (
                            <ValidationForm
                                status={status}
                                onSuccess={onSuccess}
                                isSubmitting={isSubmitting}
                                showFileInfo={showFileInfo}
                                extendForm={extendForm}
                            >
                                {children}
                            </ValidationForm>
                        )}
                    </TabsContent>
                    <TabsContent value="history">
                        {!hasSelection ? (
                            <div className="py-10 text-center text-muted-foreground italic text-xs">Sin historial disponible</div>
                        ) : history.length === 0 ? (
                            <div className="py-10 text-center text-muted-foreground italic text-[10px] font-medium uppercase tracking-widest opacity-60">
                                Sin historial previo
                            </div>
                        ) : (
                            <FileHistory history={history} />
                        )}
                    </TabsContent>
                </SectionCard.Body>
            </SectionCard>
        </Tabs>
    );
}
