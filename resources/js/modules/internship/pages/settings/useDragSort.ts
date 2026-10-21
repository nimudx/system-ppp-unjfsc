/**
 * useDragSort.ts
 * 
 * Encapsula toda la lógica de Drag & Drop para el builder de configuración de prácticas.
 * Usa @dnd-kit/react (v3 beta) con el OptimisticSortingPlugin activo por defecto.
 *
 * NOTA TÉCNICA: En dnd-kit v3, el OptimisticSortingPlugin reordena el DOM antes
 * de disparar onDragEnd. Por eso source.id === target.id al final del arrastre.
 * La fuente de verdad es:
 *   - source.initialIndex → posición original antes del drag
 *   - source.index        → posición final tras el reordenamiento optimista
 */

import { Modifier, DragOperation } from '@dnd-kit/abstract';

// ─── Modificador: Restringir movimiento al eje vertical ──────────────────────
export class RestrictToVerticalAxis extends Modifier<any> {
    apply({ transform }: DragOperation): any {
        return { x: 0, y: transform.y };
    }
}

// ─── Tipos de IDs que usa este módulo ─────────────────────────────────────────
// Etapas:    "stage-{uuid}"
// Docs:      "req|{type}|{stageId}|{docCode}"

export type DragSortHandlers = {
    onReorderStage: (oldIndex: number, newIndex: number) => void;
    onReorderRequirement: (stageId: string, type: 'development' | 'validation', oldIndex: number, newIndex: number) => void;
};

/**
 * Genera el handler onDragEnd listo para pasar al <DragDropProvider>.
 * Separa claramente el reordenamiento de Etapas del de Requisitos.
 */
export function buildDragEndHandler({ onReorderStage, onReorderRequirement }: DragSortHandlers) {
    return (event: any) => {
        if (event.canceled) return;
        if (!event.operation?.source) return;

        const source = event.operation.source as any;

        // Índice original (antes del drag) vs índice final (tras reordenamiento optimista)
        const initialIdx = typeof source.initialIndex === 'number' ? source.initialIndex : -1;
        const currentIdx = typeof source.index === 'number' ? source.index : -1;

        if (initialIdx === -1 || currentIdx === -1 || initialIdx === currentIdx) return;

        const sourceId = String(source.id);

        // Reordenar etapas normales (nunca la etapa de evaluación)
        if (sourceId.startsWith('stage-')) {
            // Si el source es la etapa de evaluación, ignorar
            if (source.type === 'evaluation') return;
            onReorderStage(initialIdx, currentIdx);
            return;
        }

        // Reordenar documentos requisito dentro de una etapa
        if (sourceId.startsWith('req|')) {
            const parts = sourceId.split('|'); // req|type|stageId|code
            if (parts.length !== 4) return;
            const type = parts[1] as 'development' | 'validation';
            const stageId = parts[2];
            onReorderRequirement(stageId, type, initialIdx, currentIdx);
        }
    };
}
