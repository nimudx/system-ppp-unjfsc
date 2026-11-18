import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Vista completa del visor: Escape para cerrar y sin scroll de fondo.
 */
export function useExpandedViewer() {
    const [expanded, setExpanded] = useState(false);

    const toggle = useCallback(() => setExpanded((value) => !value), []);

    useEffect(() => {
        if (!expanded) return;

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setExpanded(false);
            }
        };

        const previous = document.body.style.overflow;

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener('keydown', onKey);
        };
    }, [expanded]);

    return { expanded, setExpanded, toggle };
}

interface UseDocumentKeyboardNavOptions {
    count: number;
    selectedType: number;
    onSelect: (index: number) => void;
    /** Permite desactivar los atajos mientras la entrega no está habilitada. */
    enabled?: boolean;
}

/**
 * Atajos ← y → para cambiar de documento (si no estás escribiendo).
 */
export function useDocumentKeyboardNav({
    count,
    selectedType,
    onSelect,
    enabled = true,
}: UseDocumentKeyboardNavOptions) {
    const onSelectRef = useRef(onSelect);
    const indexRef = useRef(selectedType);
    const countRef = useRef(count);

    useEffect(() => {
        onSelectRef.current = onSelect;
        indexRef.current = selectedType;
        countRef.current = count;
    });

    useEffect(() => {
        if (!enabled) return;

        const onKey = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;

            const target = event.target as HTMLElement | null;
            const typing =
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable);

            if (typing) return;

            if (event.key === 'ArrowLeft') {
                onSelectRef.current(Math.max(0, indexRef.current - 1));
            } else if (event.key === 'ArrowRight') {
                onSelectRef.current(
                    Math.min(countRef.current - 1, indexRef.current + 1),
                );
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [enabled]);
}
