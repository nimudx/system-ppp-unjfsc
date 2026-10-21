import AcademicPagination from '@/shared/components/academic/academic-pagination';
import { Badge } from '@/shared/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import { StudentSupervision } from '@/shared/types';
import { ChevronRight, User } from 'lucide-react';

interface SupervisionTableProps {
    // El objeto retornado por useConfigTable
    tableManager: {
        data: any;
        displayData: StudentSupervision[];
        allLocalFiltered: any[];
        isSearching: boolean;
        localPage: number;
        localTotalPages: number;
        handlePageChange: (url: string | null) => void;
        setLocalPage: (page: number) => void;
    };
    isAdmin: boolean;
    selectedId: number | null;
    selectedModuleId: number | null;
    selectedGroup: any;
    statusConfig: Record<number, { label: string; className: string }>;
    onSelect: (id: number, moduleOverride?: number) => void;
}

export default function SupervisionTable({
    tableManager,
    isAdmin,
    selectedId,
    selectedModuleId,
    selectedGroup,
    statusConfig,
    onSelect,
}: SupervisionTableProps) {
    const {
        displayData,
        isSearching,
        handlePageChange,
        localPage,
        localTotalPages,
        setLocalPage,
        allLocalFiltered,
        data: assignments,
    } = tableManager;

    return (
        <div className="overflow-hidden rounded-md border bg-card">
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
                {isSearching ? (
                    <TableBody>
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="h-24 text-center text-sm text-muted-foreground italic"
                            >
                                Cargando estudiantes...
                            </TableCell>
                        </TableRow>
                    </TableBody>
                ) : displayData.length > 0 ? (
                    <TableBody>
                        {displayData.map((student) => {
                            const status =
                                student.supervision?.approval_status ?? 0;
                            const cfg = statusConfig[status] ?? statusConfig[0];
                            const isSelected = student.search_module
                                ? selectedId === student.id &&
                                selectedModuleId === student.search_module
                                : selectedId === student.id;
                            return (
                                <TableRow
                                    key={
                                        student.search_module
                                            ? `${student.id}-${student.search_module}`
                                            : student.id
                                    }
                                    onClick={() =>
                                        onSelect(
                                            student.id,
                                            student.search_module,
                                        )
                                    }
                                    className={`group/row cursor-pointer transition-colors ${isSelected
                                        ? 'border-l-2 border-l-primary bg-primary/5'
                                        : 'hover:bg-muted/30'
                                        }`}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                                                <User className="size-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="max-w-37.5 truncate text-xs font-bold uppercase lg:max-w-none">
                                                    {student.user?.person?.surnames}{' '}
                                                    {student.user?.person?.names}
                                                </span>
                                                {!selectedId ? (
                                                    <span className="truncate text-[10px] text-muted-foreground">
                                                        {student.user?.email}
                                                    </span>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <span className="truncate text-[10px] text-muted-foreground">
                                                            {student.section?.school?.name}
                                                        </span>
                                                        <span className="truncate text-[10px] text-muted-foreground">
                                                            - {student.section?.name}
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
                                                {student.section?.school?.faculty?.name ||
                                                    'N/A'}
                                            </TableCell>
                                            <TableCell className="hidden text-sm font-medium text-muted-foreground md:table-cell">
                                                {student.section?.school?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell className="hidden font-bold lg:table-cell">
                                                {student.section?.name || 'N/A'}
                                            </TableCell>
                                        </>
                                    )}
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="outline"
                                            className={`h-5 px-1.5 text-[9px] font-bold ${cfg.className}`}
                                        >
                                            {cfg.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <ChevronRight
                                            className={`size-4 text-muted-foreground transition-all ${isSelected
                                                ? 'rotate-180 text-primary'
                                                : 'opacity-0 group-hover/row:opacity-100'
                                                }`}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                ) : !selectedGroup || !selectedModuleId ? (
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={5} className="h-36 text-center">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <User className="size-8 opacity-20" />
                                    <p className="text-sm font-medium">
                                        {!selectedGroup
                                            ? 'Selecciona un grupo para continuar'
                                            : 'Selecciona un módulo'}
                                    </p>
                                    <p className="text-xs opacity-60">
                                        Usa los selectores de arriba
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                ) : (
                    <TableBody>
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="h-24 text-center text-sm text-muted-foreground italic"
                            >
                                No se encontraron estudiantes registrados.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                )}
            </Table>
            <AcademicPagination
                isAdmin={isAdmin}
                isLoading={isSearching}
                links={(assignments as any)?.links}
                total={(assignments as any)?.total}
                showing={(assignments as any)?.data?.length}
                onPageChange={handlePageChange}
                currentPage={localPage}
                totalPages={localTotalPages}
                localShowing={displayData.length}
                localTotal={allLocalFiltered.length}
                onLocalPageChange={setLocalPage}
            />
        </div>
    );
}

