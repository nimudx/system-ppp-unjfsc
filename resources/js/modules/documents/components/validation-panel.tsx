import * as React from 'react';
import FileHistory from '@/modules/documents/components/FileHistory';
import { ValidationForm } from '@/modules/documents/components/validation-form';
import type { DocumentFile } from '@/modules/documents/types';
import { SectionCard } from '@/shared/components/ui/section-card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/shared/components/ui/tabs';

export interface ValidationPanelProps {
    status?: number;
    history?: DocumentFile[];
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
    emptyMessage = 'Seleccione un elemento',
    children,
    extendForm = false,
}: ValidationPanelProps) {
    return (
        <Tabs defaultValue="validation" className="w-full">
            <SectionCard>
                <SectionCard.Header>
                    <TabsList className="grid w-full grid-cols-2 gap-1 p-0">
                        <TabsTrigger
                            value="validation"
                            className="text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                        >
                            Dictamen
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                        >
                            Historial
                        </TabsTrigger>
                    </TabsList>
                </SectionCard.Header>
                <SectionCard.Body>
                    <TabsContent value="validation">
                        {!hasSelection ? (
                            <div className="py-8 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase italic opacity-60">
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
                            <div className="py-10 text-center text-xs text-muted-foreground italic">
                                Sin historial disponible
                            </div>
                        ) : history.length === 0 ? (
                            <div className="py-10 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase italic opacity-60">
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
