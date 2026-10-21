import { useSortable } from '@dnd-kit/react/sortable';
import { X, GraduationCap, Briefcase, GripVertical } from 'lucide-react';
import { useState } from 'react';
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from '@/shared/components/ui/combobox';
import type { Document } from '../types';

interface RequirementColumnProps {
    type: 'development' | 'validation';
    stageId: string;
    documents: Document[];
    onAdd: (
        type: 'development' | 'validation',
        docInfo: { name: string; code: string },
    ) => void;
    onRemove: (type: 'development' | 'validation', index: number) => void;
    availableDocuments: { id: number; name: string; code: string }[];
}

function SortableDocItem({
    doc,
    idx,
    type,
    stageId,
    onRemove,
}: {
    doc: Document;
    idx: number;
    type: 'development' | 'validation';
    stageId: string;
    onRemove: RequirementColumnProps['onRemove'];
}) {
    const { ref, handleRef, isDragging } = useSortable({
        id: `req|${type}|${stageId}|${doc.code}`,
        type: `req-${type}-${stageId}`,
        accept: `req-${type}-${stageId}`,
        index: idx,
        group: `req-${type}-${stageId}`,
    });

    return (
        <div
            ref={ref}
            className={`group flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-2 text-sm ${isDragging ? 'relative z-50 bg-white opacity-30 shadow-md ring-1 ring-primary' : ''}`}
        >
            <div className="flex items-center gap-2 overflow-hidden">
                <button
                    ref={handleRef}
                    className="cursor-move text-slate-300 hover:text-slate-500 focus:outline-none"
                >
                    <GripVertical className="h-3 w-3" />
                </button>
                <span className="truncate">{doc.name}</span>
            </div>
            <button
                onClick={() => onRemove(type, idx)}
                className={`text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:text-destructive ${isDragging ? 'hidden' : ''}`}
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
}

export function RequirementColumn({
    type,
    stageId,
    documents,
    onAdd,
    onRemove,
    availableDocuments = [],
}: RequirementColumnProps) {
    const addedCodes = documents.map((d) => d.code);
    const [inputValue, setInputValue] = useState('');

    return (
        <div
            className={`space-y-3 ${type === 'validation' ? 'border-l pl-4' : ''}`}
        >
            <h4 className="flex items-center text-xs font-bold text-slate-500 uppercase">
                {type === 'development' ? (
                    <GraduationCap className="mr-1 h-3 w-3" />
                ) : (
                    <Briefcase className="mr-1 h-3 w-3" />
                )}
                {type}
            </h4>

            <div className="relative space-y-2">
                {documents.length === 0 ? (
                    <span className="text-[10px] text-slate-400 italic">
                        Ningún requisito definido
                    </span>
                ) : (
                    documents.map((doc, idx) => (
                        <SortableDocItem
                            key={doc.code || idx}
                            doc={doc}
                            idx={idx}
                            type={type}
                            stageId={stageId}
                            onRemove={onRemove}
                        />
                    ))
                )}
            </div>

            <Combobox
                value={null}
                inputValue={inputValue}
                onInputValueChange={setInputValue}
                onValueChange={(val) => {
                    if (!val) return;
                    const doc = availableDocuments.find((d) => d.code === val);
                    if (doc) {
                        onAdd(type, { name: doc.name, code: doc.code });
                    }
                    setTimeout(() => setInputValue(''), 0);
                }}
            >
                <ComboboxInput
                    placeholder="Buscar y añadir requisito..."
                    className="h-8 border-dashed bg-slate-50 text-xs text-slate-600"
                    showClear={false}
                />
                <ComboboxContent
                    align="start"
                    className="w-[12rem] md:w-[15rem]"
                >
                    <ComboboxList>
                        <ComboboxEmpty>
                            No se encontraron resultados.
                        </ComboboxEmpty>
                        {availableDocuments.map((doc) => (
                            <ComboboxItem
                                key={doc.code}
                                value={doc.code}
                                disabled={addedCodes.includes(doc.code)}
                            >
                                {doc.name}
                            </ComboboxItem>
                        ))}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}
