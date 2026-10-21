import { ChevronRight, User } from 'lucide-react';

import type { AssignmentRecord } from '@/modules/identity/types';
import { Badge } from '@/shared/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';

interface DossierTableProps {
    data: AssignmentRecord[];
    isLoading: boolean;
    selectedId: number | null;
    onSelect: (id: number) => void;
    search: string;
}

export default function DossierTable({
    data,
    isLoading,
    selectedId,
    onSelect,
    search,
}: DossierTableProps) {
    return (
        <Table>
            <colgroup>
                <col className="w-[20%]" />
                {!selectedId && (
                    <>
                        <col className="w-[25%]" />
                        <col className="w-[24%]" />
                        <col className="w-[10%]" />
                    </>
                )}
                <col className="w-[8%]" />
                <col className="w-[2%]" />
            </colgroup>
            <TableHeader>
                <TableRow>
                    <TableHead>Nombre / Usuario</TableHead>
                    {!selectedId && (
                        <>
                            <TableHead className="hidden md:table-cell">
                                Facultad
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                                Escuela
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                Sección
                            </TableHead>
                        </>
                    )}
                    <TableHead className="text-center">Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 && !isLoading ? (
                    <TableRow>
                        <TableCell
                            colSpan={6}
                            className="h-24 text-center text-sm text-muted-foreground italic"
                        >
                            {!search
                                ? 'Usa el filtro o buscador para cargar expedientes.'
                                : 'No se encontraron registros.'}
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((item) => (
                        <TableRow
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={`group cursor-pointer transition-colors ${selectedId === item.id ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                                        <User className="size-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="max-w-37.5 truncate text-xs font-bold uppercase lg:max-w-none">
                                            {item.user?.person?.surnames}{' '}
                                            {item.user?.person?.names}
                                        </span>
                                        {!selectedId ? (
                                            <span className="truncate text-[10px] text-muted-foreground">
                                                {item.user?.email}
                                            </span>
                                        ) : (
                                            <div className="flex gap-2">
                                                <span className="truncate text-[10px] text-muted-foreground">
                                                    {item.section?.school?.name}
                                                </span>
                                                <span className="truncate text-[10px] text-muted-foreground">
                                                    - {item.section?.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TableCell>

                            {/* Columnas que desaparecen en modo split */}
                            {!selectedId && (
                                <>
                                    <TableCell className="hidden text-sm font-medium text-muted-foreground md:table-cell">
                                        {item.section?.school?.faculty?.name ||
                                            'N/A'}
                                    </TableCell>
                                    <TableCell className="hidden text-sm font-medium text-muted-foreground md:table-cell">
                                        {item.section?.school?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell className="hidden font-bold lg:table-cell">
                                        {item.section?.name || 'N/A'}
                                    </TableCell>
                                </>
                            )}

                            <TableCell className="text-center">
                                {item.dossiers?.[0]?.approval_status === 1 && (
                                    <Badge
                                        variant="outline"
                                        className="h-5 border-none bg-green-500 px-1.5 text-[9px] font-bold tracking-tighter text-white uppercase"
                                    >
                                        Aprobado
                                    </Badge>
                                )}
                                {item.dossiers?.[0]?.approval_status === 3 &&
                                    item.dossiers?.[0]?.latest && (
                                        <Badge
                                            variant="outline"
                                            className="h-5 border-none bg-red-500 px-1.5 text-[9px] font-bold tracking-tighter text-white uppercase"
                                        >
                                            Observado
                                        </Badge>
                                    )}
                                {(item.dossiers?.[0]?.approval_status === 2 ||
                                    !item.dossiers?.[0]) && (
                                    <Badge
                                        variant="outline"
                                        className="h-5 border-none bg-amber-500 px-1.5 text-[9px] font-bold tracking-tighter text-white uppercase"
                                    >
                                        Pendiente
                                    </Badge>
                                )}
                            </TableCell>

                            <TableCell className="text-right">
                                <ChevronRight
                                    className={`size-4 text-muted-foreground transition-transform ${selectedId === item.id ? 'rotate-180 text-primary' : ''}`}
                                />
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
