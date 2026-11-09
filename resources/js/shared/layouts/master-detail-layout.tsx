import type { ReactNode } from 'react';
import Heading from '@/shared/components/heading';
import PageContainer from '@/shared/components/page-container';
import { cn } from '@/shared/lib/utils';

interface MasterDetailLayoutProps {
    title: string;
    description?: string;
    /** Acción o indicador alineado a la derecha del encabezado. */
    headerAction?: ReactNode;
    /** Controles de búsqueda y filtros sobre el listado. */
    toolbar?: ReactNode;
    /** Contenido del panel maestro (listado). */
    master: ReactNode;
    /** Contenido del panel de detalle. */
    detail: ReactNode;
    /** Indica si hay un elemento seleccionado para mostrar el detalle. */
    hasSelection: boolean;
    /** Alineación vertical del encabezado. */
    headerClassName?: string;
    /** Ancho del panel maestro cuando hay selección. */
    masterWidthClassName?: string;
    /** Clases adicionales para el panel de detalle. */
    detailClassName?: string;
}

/**
 * Layout de dos paneles: listado a la izquierda y detalle a la derecha.
 * Al seleccionar un registro, el listado se angosta y el detalle aparece.
 */
export default function MasterDetailLayout({
    title,
    description,
    headerAction,
    toolbar,
    master,
    detail,
    hasSelection,
    headerClassName = 'items-end',
    masterWidthClassName = 'w-87.5 lg:w-95',
    detailClassName,
}: MasterDetailLayoutProps) {
    return (
        <PageContainer fullHeight>
            <div className={cn('flex justify-between', headerClassName)}>
                <Heading
                    variant="small"
                    title={title}
                    description={description}
                />
                {headerAction}
            </div>

            <div className="relative flex flex-1 gap-6 overflow-hidden pr-1 pb-1">
                <aside
                    className={cn(
                        'flex shrink-0 flex-col transition-all duration-300 ease-in-out',
                        hasSelection ? masterWidthClassName : 'w-full',
                    )}
                >
                    {toolbar}
                    {master}
                </aside>

                <main
                    className={cn(
                        'flex min-w-0 flex-1 flex-col transition-all duration-500 ease-in-out',
                        hasSelection
                            ? 'translate-x-0 opacity-100'
                            : 'pointer-events-none translate-x-12.5 opacity-0',
                        detailClassName,
                    )}
                >
                    {detail}
                </main>
            </div>
        </PageContainer>
    );
}
